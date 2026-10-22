import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, requestSafe } from '../services/api';
import { gameEventBus, type CoinKey } from '../context/GameEventBus';
import { applyCombatHealthChange } from '../domain/combat/DamageStrategy';
import {
  ApplyDamageCommand,
  HealCommand,
  combatActionHistory,
} from '../domain/commands/CombatActionHistory';
import type {
  EnrichedCharacter,
  AttackItem,
  InventoryItem,
  ClassFeature,
  SpellSlot,
  SpellCard,
  AbilityKey,
  SkillKey,
  CharacterCore,
  CharacterDetailResponse,
} from '../types/dnd5e';

export interface UseCharacterReturn {
  character: EnrichedCharacter | null;
  items: InventoryItem[];
  attacks: AttackItem[];
  features: ClassFeature[];
  spellSlots: SpellSlot[];
  setSpellSlots: (slots: SpellSlot[]) => void;
  spells: SpellCard[];
  setSpells: (spells: SpellCard[]) => void;
  loading: boolean;
  error: string;
  loadCharacter: () => Promise<void>;
  adjustHp: (delta: number) => Promise<void>;
  adjustTempHp: (delta: number) => Promise<void>;
  adjustHitDice: (delta: number) => Promise<void>;
  toggleDeathSave: (type: 'success' | 'failure', index: number) => Promise<void>;
  toggleInspiration: () => Promise<void>;
  longRest: () => Promise<void>;
  restoreSpellSlots: () => Promise<void>;
  toggleSkill: (skillKey: SkillKey) => Promise<void>;
  toggleSavingThrow: (abilityKey: AbilityKey) => Promise<void>;
  adjustCoin: (coinKey: CoinKey, delta: number) => Promise<void>;
  addAttack: (attack: Omit<AttackItem, 'id' | 'character_id'>) => Promise<void>;
  deleteAttack: (attackId: number) => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id' | 'character_id'>) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  addFeature: (feature: Omit<ClassFeature, 'id' | 'character_id'>) => Promise<void>;
  adjustFeatureUsage: (featureId: number, delta: number) => Promise<void>;
  deleteFeature: (featureId: number) => Promise<void>;
  saveEdit: (updates: Partial<CharacterCore>) => Promise<void>;
}

export function useCharacter(characterId: number): UseCharacterReturn {
  const queryClient = useQueryClient();
  const queryKey = ['character', characterId] as const;

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<CharacterDetailResponse, Error>({
    queryKey,
    queryFn: async () => {
      return requestSafe<CharacterDetailResponse>(`/characters/${characterId}`).match(
        (d) => d,
        (e) => {
          throw e;
        }
      );
    },
    enabled: Boolean(characterId),
  });

  const charData = data?.character ?? null;

  const updateMutation = useMutation({
    mutationKey: ['updateCharacter', characterId],
    mutationFn: (variables: { characterId: number; updates: Partial<CharacterCore> }) =>
      requestSafe(`/characters/${variables.characterId}`, {
        method: 'PATCH',
        body: JSON.stringify(variables.updates),
      }).match(
        (d) => d,
        (e) => {
          throw e;
        }
      ),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['character', characterId] });
      const previous = queryClient.getQueryData<CharacterDetailResponse>(['character', characterId]);
      if (previous) {
        queryClient.setQueryData<CharacterDetailResponse>(['character', characterId], {
          ...previous,
          character: { ...previous.character, ...variables.updates } as EnrichedCharacter,
        });
      }
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['character', characterId], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['character', characterId] });
    },
  });

  const update = async (updates: Partial<CharacterCore>) => {
    await updateMutation.mutateAsync({ characterId, updates });
  };

  const getLatestDetail = (): CharacterDetailResponse | undefined =>
    queryClient.getQueryData<CharacterDetailResponse>(['character', characterId]) ?? data;

  const getLatestChar = (): EnrichedCharacter | null =>
    getLatestDetail()?.character ?? charData;

  const adjustHp = async (delta: number) => {
    const current = getLatestChar();
    if (!current) return;

    const currentTempHp = current.temp_hp || 0;
    const state = {
      currentHp: current.current_hp,
      maxHp: current.max_hp,
      tempHp: currentTempHp,
    };

    const command = delta < 0 ? new ApplyDamageCommand(Math.abs(delta)) : new HealCommand(delta);
    combatActionHistory.executeCommand(command, state);

    const healthResult = applyCombatHealthChange(state, delta);
    const updates: Partial<CharacterCore> = { current_hp: healthResult.currentHp };
    if (healthResult.tempHp !== currentTempHp) {
      updates.temp_hp = healthResult.tempHp;
    }

    await update(updates);

    if (healthResult.droppedToZero) {
      gameEventBus.publish({
        type: 'CHARACTER_UNCONSCIOUS',
        payload: { characterId, name: current.name },
      });
    }
    if (healthResult.concentrationDc !== null) {
      gameEventBus.publish({
        type: 'CONCENTRATION_CHECK_REQUIRED',
        payload: {
          characterId,
          dc: healthResult.concentrationDc,
          damageTaken: healthResult.damageTaken,
        },
      });
    }
  };

  const adjustTempHp = async (delta: number) => {
    const current = getLatestChar();
    if (!current) return;
    const newTemp = Math.max(0, (current.temp_hp || 0) + delta);
    await update({ temp_hp: newTemp });
  };

  const adjustHitDice = async (delta: number) => {
    const current = getLatestChar();
    if (!current) return;
    const maxDice = current.level || 1;
    const curDice = current.hit_dice_current !== undefined ? current.hit_dice_current : maxDice;
    const nextVal = Math.max(0, Math.min(maxDice, curDice + delta));
    await update({ hit_dice_current: nextVal });
  };

  const toggleDeathSave = async (type: 'success' | 'failure', index: number) => {
    const current = getLatestChar();
    if (!current) return;
    const curVal = type === 'success' ? current.death_successes : current.death_failures;
    const newVal = index < curVal ? index : index + 1;
    const updateKey = type === 'success' ? 'death_successes' : 'death_failures';
    await update({ [updateKey]: newVal });
  };

  const toggleInspiration = async () => {
    const current = getLatestChar();
    if (!current) return;
    await update({ inspiration: current.inspiration ? 0 : 1 });
  };

  const longRest = async () => {
    const current = getLatestChar();
    if (!current) return;
    if (
      !window.confirm(
        'Realizar Descanso Longo? Todos os PV, dados de vida e espaços de magia serão restaurados.'
      )
    ) {
      return;
    }
    await requestSafe(`/characters/${characterId}/long-rest`, { method: 'POST' }).match(
      (d) => d,
      () => {}
    );
    await refetch();
  };

  const restoreSpellSlots = async () => {
    const latest = getLatestDetail();
    if (!latest) return;
    for (const slot of latest.spell_slots) {
      if (slot.used_slots > 0) {
        await requestSafe(`/characters/${characterId}/spell-slots/${slot.slot_level}`, {
          method: 'PATCH',
          body: JSON.stringify({ used_slots: 0 }),
        }).match(
          (d) => d,
          () => {}
        );
      }
    }
    await refetch();
  };

  const toggleSkill = async (skillKey: SkillKey) => {
    const current = getLatestChar();
    if (!current) return;
    await requestSafe(`/characters/${characterId}/skills/toggle`, {
      method: 'POST',
      body: JSON.stringify({ skill_key: skillKey }),
    }).match(
      (d) => d,
      () => {}
    );
    await refetch();
  };

  const toggleSavingThrow = async (abilityKey: AbilityKey) => {
    const current = getLatestChar();
    if (!current) return;
    await requestSafe(`/characters/${characterId}/saving-throws/toggle`, {
      method: 'POST',
      body: JSON.stringify({ ability_key: abilityKey }),
    }).match(
      (d) => d,
      () => {}
    );
    await refetch();
  };

  const adjustCoin = async (coinKey: CoinKey, delta: number) => {
    const current = getLatestChar();
    if (!current) return;
    const currentVal = Number(current[coinKey] ?? 0);
    const newVal = Math.max(0, currentVal + delta);
    await update({ [coinKey]: newVal });
  };

  const addAttack = async (attack: Omit<AttackItem, 'id' | 'character_id'>) => {
    await api.addAttack(characterId, attack);
    await refetch();
  };

  const deleteAttack = async (attackId: number) => {
    await api.deleteAttack(characterId, attackId);
    await refetch();
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'character_id'>) => {
    await api.addItem(characterId, item);
    await refetch();
  };

  const deleteItem = async (itemId: number) => {
    await api.deleteItem(characterId, itemId);
    await refetch();
  };

  const addFeature = async (feature: Omit<ClassFeature, 'id' | 'character_id'>) => {
    await api.addFeature(characterId, feature);
    await refetch();
  };

  const adjustFeatureUsage = async (featureId: number, delta: number) => {
    const latest = getLatestDetail();
    if (!latest) return;
    const feat = latest.features?.find((f) => f.id === featureId);
    if (!feat || !feat.uses_max) return;
    const newCur = Math.max(0, Math.min(feat.uses_max, feat.uses_current + delta));
    await api.updateFeature(characterId, featureId, { uses_current: newCur });
    await refetch();
  };

  const deleteFeature = async (featureId: number) => {
    await api.deleteFeature(characterId, featureId);
    await refetch();
  };

  const saveEdit = async (updates: Partial<CharacterCore>) => {
    await update(updates);
  };

  useEffect(() => {
    if (!characterId) return;
    let isSubscribed = true;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('black_rose_token') || '';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (!isSubscribed) return;
      ws.send(JSON.stringify({ type: 'player:join', characterId }));
    };

    ws.onmessage = (event) => {
      if (!isSubscribed) return;
      try {
        const msg = JSON.parse(event.data) as {
          type?: string;
          characterId?: number;
          patch?: Partial<EnrichedCharacter>;
        };
        if (msg.type === 'patch' && msg.characterId === characterId && msg.patch) {
          queryClient.setQueryData<CharacterDetailResponse>(['character', characterId], (old) => {
            if (!old) return old;
            return {
              ...old,
              character: { ...old.character, ...msg.patch },
            };
          });
        }
      } catch {
        return;
      }
    };

    const unsubs = [
      gameEventBus.subscribe('HP_ADJUSTED', async ({ characterId: id, delta }) => {
        if (id !== characterId) return;
        await adjustHp(delta);
      }),
      gameEventBus.subscribe('TEMP_HP_ADJUSTED', async ({ characterId: id, delta }) => {
        if (id !== characterId) return;
        await adjustTempHp(delta);
      }),
      gameEventBus.subscribe('HIT_DICE_ADJUSTED', async ({ characterId: id, delta }) => {
        if (id !== characterId) return;
        await adjustHitDice(delta);
      }),
      gameEventBus.subscribe('DEATH_SAVE_TOGGLED', async ({ characterId: id, saveType, index }) => {
        if (id !== characterId) return;
        await toggleDeathSave(saveType, index);
      }),
      gameEventBus.subscribe('INSPIRATION_TOGGLED', async ({ characterId: id }) => {
        if (id !== characterId) return;
        await toggleInspiration();
      }),
      gameEventBus.subscribe('ATTACK_ADDED', async ({ characterId: id, attack }) => {
        if (id !== characterId) return;
        await addAttack(attack);
      }),
      gameEventBus.subscribe('ATTACK_DELETED', async ({ characterId: id, attackId }) => {
        if (id !== characterId) return;
        await deleteAttack(attackId);
      }),
      gameEventBus.subscribe('COIN_ADJUSTED', async ({ characterId: id, coinKey, delta }) => {
        if (id !== characterId) return;
        await adjustCoin(coinKey, delta);
      }),
      gameEventBus.subscribe('ITEM_ADDED', async ({ characterId: id, item }) => {
        if (id !== characterId) return;
        await addItem(item);
      }),
      gameEventBus.subscribe('ITEM_DELETED', async ({ characterId: id, itemId }) => {
        if (id !== characterId) return;
        await deleteItem(itemId);
      }),
      gameEventBus.subscribe('LONG_REST', async ({ characterId: id }) => {
        if (id !== characterId) return;
        await longRest();
      }),
      gameEventBus.subscribe('CHARACTER_EDITED', async ({ characterId: id, updates }) => {
        if (id !== characterId) return;
        await saveEdit(updates);
      }),
      gameEventBus.subscribe('SKILL_TOGGLED', async ({ characterId: id, skillKey }) => {
        if (id !== characterId) return;
        await toggleSkill(skillKey);
      }),
      gameEventBus.subscribe('SAVING_THROW_TOGGLED', async ({ characterId: id, abilityKey }) => {
        if (id !== characterId) return;
        await toggleSavingThrow(abilityKey);
      }),
      gameEventBus.subscribe('FEATURE_ADDED', async ({ characterId: id, feature }) => {
        if (id !== characterId) return;
        await addFeature(feature);
      }),
      gameEventBus.subscribe('FEATURE_USAGE_ADJUSTED', async ({ characterId: id, featureId, delta }) => {
        if (id !== characterId) return;
        await adjustFeatureUsage(featureId, delta);
      }),
      gameEventBus.subscribe('FEATURE_DELETED', async ({ characterId: id, featureId }) => {
        if (id !== characterId) return;
        await deleteFeature(featureId);
      }),
      gameEventBus.subscribe('SPELL_ADDED', async ({ characterId: id, spell }) => {
        if (id !== characterId) return;
        await requestSafe(`/spells/character/${characterId}/spells`, {
          method: 'POST',
          body: JSON.stringify({ spell_id: spell.id }),
        }).match(
          (d) => d,
          () => {}
        );
        await refetch();
      }),
      gameEventBus.subscribe('SPELL_REMOVED', async ({ characterId: id, spellId }) => {
        if (id !== characterId) return;
        await requestSafe(`/spells/character/${characterId}/spells/${spellId}`, {
          method: 'DELETE',
        }).match(
          (d) => d,
          () => {}
        );
        await refetch();
      }),
      gameEventBus.subscribe('SPELL_SLOT_TOGGLED', async ({ characterId: id, slotLevel, currentUsed, circleIndex }) => {
        if (id !== characterId) return;
        const newUsed = currentUsed === circleIndex + 1 ? circleIndex : circleIndex + 1;
        await requestSafe(`/characters/${characterId}/spell-slots/${slotLevel}`, {
          method: 'PATCH',
          body: JSON.stringify({ used_slots: newUsed }),
        }).match(
          (d) => d,
          () => {}
        );
        await refetch();
      }),
      gameEventBus.subscribe('SPELL_SLOTS_RESTORED', async ({ characterId: id }) => {
        if (id !== characterId) return;
        await restoreSpellSlots();
      }),
      gameEventBus.subscribe('SPELL_SLOTS_CONFIG_SAVED', async ({ characterId: id, newSlots }) => {
        if (id !== characterId) return;
        for (const slot of newSlots) {
          await requestSafe(`/characters/${characterId}/spell-slots/${slot.slot_level}`, {
            method: 'PATCH',
            body: JSON.stringify({ max_slots: Number(slot.max_slots) || 0 }),
          }).match(
            (d) => d,
            () => {}
          );
        }
        await refetch();
      }),
    ];

    return () => {
      isSubscribed = false;
      ws.close();
      unsubs.forEach((u) => u());
    };
  }, [characterId, queryClient]);

  const setSpellSlots = (slots: SpellSlot[]) => {
    queryClient.setQueryData<CharacterDetailResponse>(['character', characterId], (old) =>
      old ? { ...old, spell_slots: slots } : old
    );
  };

  const setSpells = (spells: SpellCard[]) => {
    queryClient.setQueryData<CharacterDetailResponse>(['character', characterId], (old) =>
      old ? { ...old, spells } : old
    );
  };

  return {
    character: charData,
    items: data?.items || [],
    attacks: data?.attacks || [],
    features: data?.features || [],
    spellSlots: data?.spell_slots || [],
    setSpellSlots,
    spells: data?.spells || [],
    setSpells,
    loading: isLoading,
    error: queryError ? queryError.message : '',
    loadCharacter: async () => {
      await refetch();
    },
    adjustHp,
    adjustTempHp,
    adjustHitDice,
    toggleDeathSave,
    toggleInspiration,
    longRest,
    restoreSpellSlots,
    toggleSkill,
    toggleSavingThrow,
    adjustCoin,
    addAttack,
    deleteAttack,
    addItem,
    deleteItem,
    addFeature,
    adjustFeatureUsage,
    deleteFeature,
    saveEdit,
  };
}
