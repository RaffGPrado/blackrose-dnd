import type { Request, Response } from 'express';
import type { ICharacterRepository } from '../../domain/character/ICharacterRepository.js';
import { broadcastCharacterPatch } from '../../websocket/GameServer.js';

export function createCharacterController(repo: ICharacterRepository) {
  return {
    getMetaOptions: (_req: Request, res: Response): void => {
      repo.getMetaOptions().match(
        (data) => res.json(data),
        () => res.status(500).json({ error: 'Failed to fetch metadata options' })
      );
    },

    listCharacters: (req: Request, res: Response): void => {
      repo.findAllByUser(req.user!.id).match(
        (characters) => res.json({ characters }),
        () => res.status(500).json({ error: 'Failed to fetch characters' })
      );
    },

    getCharacterDetail: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findDetailById(id, req.user!.id).match(
        (detail) => {
          if (!detail) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          res.json(detail);
        },
        () => res.status(500).json({ error: 'Failed to fetch character detail' })
      );
    },

    createCharacter: (req: Request, res: Response): void => {
      const { name, race_id, class_id, level = 1, ...stats } = req.body;
      if (!name?.trim()) {
        res.status(400).json({ error: 'Character name is required' });
        return;
      }

      repo.create({
        userId: req.user!.id,
        name: name.trim(),
        race_id: race_id ? Number(race_id) : null,
        class_id: class_id ? Number(class_id) : null,
        level: Number(level) || 1,
        ...stats,
      }).match(
        (character) => {
          res.status(201).json({ message: 'Character created successfully', character });
        },
        () => {
          res.status(500).json({ error: 'Failed to create character' });
        }
      );
    },

    updateCharacter: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.update(id, req.user!.id, req.body).match(
        (character) => {
          if (!character) {
            res.status(404).json({ error: 'Character not found or no fields provided' });
            return;
          }
          broadcastCharacterPatch(id, req.body);
          res.json({ message: 'Character updated successfully', character });
        },
        (err) => {
          res.status(500).json({ error: 'Failed to update character' });
        }
      );
    },

    longRest: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const userId = req.user!.id;
      
      repo.longRest(id, userId).match(
        (success) => {
          if (!success) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.findRawById(id, userId).match(
            (raw) => {
              if (raw) {
                broadcastCharacterPatch(id, {
                  current_hp: raw.max_hp, temp_hp: 0,
                  death_successes: 0, death_failures: 0, hit_dice_current: raw.level,
                });
              }
              res.json({ message: 'Long rest completed! HP and spell slots fully restored.' });
            },
            () => {
              res.status(500).json({ error: 'Failed to fetch updated character' });
            }
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to perform long rest' });
        }
      );
    },

    getDMRoster: (_req: Request, res: Response): void => {
      repo.findAllForDM().match(
        (roster) => res.json({ roster }),
        (err) => res.status(500).json({ error: 'Failed to fetch roster for DM' })
      );
    },

    updateCharacterAsDM: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.updateAsDM(id, req.body).match(
        (character) => {
          if (!character) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          broadcastCharacterPatch(id, req.body);
          res.json({ message: 'Character updated by DM', character });
        },
        (err) => {
          res.status(500).json({ error: 'Failed to update character as DM' });
        }
      );
    },

    deleteCharacter: (req: Request, res: Response): void => {
      repo.delete(Number(req.params.id), req.user!.id).match(
        (ok) => {
          if (ok) {
            res.json({ message: 'Character deleted successfully' });
          } else {
            res.status(404).json({ error: 'Character not found' });
          }
        },
        (err) => {
          res.status(500).json({ error: 'Failed to delete character' });
        }
      );
    },

    toggleSkill: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { skill_key } = req.body as { skill_key?: string };
      
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.toggleSkill(char.id, skill_key!).match(
            (enriched) => res.json({ message: 'Skill updated', skills: enriched.skills }),
            (err) => res.status(500).json({ error: 'Failed to update skill' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    toggleSavingThrow: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { ability_key } = req.body as { ability_key?: string };
      
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.toggleSavingThrow(char.id, ability_key!).match(
            (enriched) => res.json({ message: 'Saving throw updated', saving_throws: enriched.saving_throws }),
            (err) => res.status(500).json({ error: 'Failed to update saving throw' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    updateSpellSlot: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { used_slots, max_slots } = req.body as { used_slots?: number; max_slots?: number };
      
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.updateSpellSlot(char.id, Number(req.params.slotLevel), { used_slots, max_slots }).match(
            (slots) => res.json({ message: 'Spell slot updated', spell_slots: slots }),
            (err) => res.status(500).json({ error: 'Failed to update spell slot' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    addAttack: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { name, bonus = '+5', damage_type = '1d8 cortante' } = req.body as { name?: string; bonus?: string; damage_type?: string };
      
      if (!name?.trim()) {
        res.status(400).json({ error: 'Attack name is required' });
        return;
      }

      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.addAttack(char.id, { name, bonus, damage_type }).match(
            (attack) => res.status(201).json({ message: 'Attack added', attack }),
            (err) => res.status(500).json({ error: 'Failed to add attack' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    deleteAttack: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.deleteAttack(char.id, Number(req.params.attackId)).match(
            () => res.json({ message: 'Attack deleted' }),
            (err) => res.status(500).json({ error: 'Failed to delete attack' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    addFeature: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { name, description = '', uses_max = 0, uses_current = 0 } = req.body as { name?: string; description?: string; uses_max?: number; uses_current?: number };
      
      if (!name?.trim()) {
        res.status(400).json({ error: 'Feature name is required' });
        return;
      }

      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.addFeature(char.id, { name, description, uses_max: Number(uses_max) || 0, uses_current: Number(uses_current) || 0 }).match(
            (feature) => res.status(201).json({ message: 'Feature added', feature }),
            (err) => res.status(500).json({ error: 'Failed to add feature' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    updateFeature: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.updateFeature(char.id, Number(req.params.featureId), req.body).match(
            (feature) => res.json({ message: 'Feature updated', feature }),
            (err) => res.status(500).json({ error: 'Failed to update feature' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    deleteFeature: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.deleteFeature(char.id, Number(req.params.featureId)).match(
            () => res.json({ message: 'Feature deleted' }),
            (err) => res.status(500).json({ error: 'Failed to delete feature' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    addItem: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      const { name, quantity = 1, weight = 0, effect = '', equipped = 0 } = req.body as { name?: string; quantity?: number; weight?: number; effect?: string; equipped?: number };
      
      if (!name?.trim()) {
        res.status(400).json({ error: 'Item name is required' });
        return;
      }

      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.addItem(char.id, { name, quantity: Number(quantity) || 1, weight: Number(weight) || 0, effect: effect ?? '', equipped: equipped ? 1 : 0 }).match(
            (item) => res.status(201).json({ message: 'Item added successfully', item }),
            (err) => res.status(500).json({ error: 'Failed to add item' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    updateItem: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.updateItem(char.id, Number(req.params.itemId), req.body).match(
            (item) => res.json({ message: 'Item updated successfully', item }),
            (err) => res.status(500).json({ error: 'Failed to update item' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    },

    deleteItem: (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      repo.findRawById(id, req.user!.id).match(
        (char) => {
          if (!char) {
            res.status(404).json({ error: 'Character not found' });
            return;
          }
          repo.deleteItem(char.id, Number(req.params.itemId)).match(
            () => res.json({ message: 'Item removed successfully' }),
            (err) => res.status(500).json({ error: 'Failed to remove item' })
          );
        },
        (err) => {
          res.status(500).json({ error: 'Failed to verify character' });
        }
      );
    }
  };
}
