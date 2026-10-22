import { Result } from 'neverthrow';
import { db, type DbExecutor } from '../../config/db.js';
import { eq, and, asc, sql } from 'drizzle-orm';
import {
  characters,
  characterSkills,
  characterSavingThrows,
  characterItems,
  characterAttacks,
  characterFeatures,
  characterSpellSlots,
  races,
  classes,
} from '../../config/schema.js';
import {
  enrichCharacterStats,
  type EnrichedCharacter,
  type RawCharacterRow,
} from '../../domain/character/CharacterEntity.js';
import { CharacterKitProvider } from '../../domain/factories/CharacterKitProvider.js';
import type {
  ICharacterRepository,
  CharacterDetailResult,
  CreateCharacterDTO,
  UpdateCharacterDTO,
  AttackRow,
  FeatureRow,
  ItemRow,
  SpellSlotRow,
  SpellRow,
  DMRosterItem,
} from '../../domain/character/ICharacterRepository.js';
import type { AbilityKey } from '../../types/dnd5e.js';

function withResult<T>(fn: () => T): Result<T, Error> {
  return Result.fromThrowable(
    fn,
    (e) => (e instanceof Error ? e : new Error(String(e)))
  )();
}

function withTransaction<T>(work: (tx: DbExecutor) => T): Result<T, Error> {
  return withResult(() => (db.transaction as (cb: (tx: DbExecutor) => T) => T)((tx) => work(tx)));
}

interface DrizzleCharacterSelect {
  id: number;
  userId: number;
  name: string;
  raceId: number | null;
  classId: number | null;
  level: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  speed: number;
  initiativeBonus: number;
  hitDiceTotal: string | null;
  hitDiceCurrent: number | null;
  deathSuccesses: number;
  deathFailures: number;
  inspiration: number;
  spellcastingAbility: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  coinsCp: number | null;
  coinsSp: number | null;
  coinsEp: number | null;
  coinsGp: number | null;
  coinsPp: number | null;
  background: string | null;
  alignment: string | null;
  personalityTraits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  proficienciesLanguages: string | null;
  conditions: string | null;
  currentInitiative: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  race?: { name: string } | null;
  class?: { name: string } | null;
}

function toAbilityKey(value?: string | null): AbilityKey {
  switch (value) {
    case 'strength':
    case 'dexterity':
    case 'constitution':
    case 'intelligence':
    case 'wisdom':
    case 'charisma':
      return value;
    default:
      return 'intelligence';
  }
}

function toRawCharacterRow(char: DrizzleCharacterSelect): RawCharacterRow {
  return {
    id: char.id,
    user_id: char.userId,
    name: char.name,
    race_id: char.raceId,
    class_id: char.classId,
    race_name: char.race?.name ?? null,
    class_name: char.class?.name ?? null,
    level: char.level,
    max_hp: char.maxHp,
    current_hp: char.currentHp,
    temp_hp: char.tempHp,
    armor_class: char.armorClass,
    speed: char.speed,
    initiative_bonus: char.initiativeBonus,
    hit_dice_total: char.hitDiceTotal,
    hit_dice_current: char.hitDiceCurrent,
    death_successes: char.deathSuccesses,
    death_failures: char.deathFailures,
    inspiration: char.inspiration,
    spellcasting_ability: toAbilityKey(char.spellcastingAbility),
    strength: char.strength,
    dexterity: char.dexterity,
    constitution: char.constitution,
    intelligence: char.intelligence,
    wisdom: char.wisdom,
    charisma: char.charisma,
    coins_cp: char.coinsCp,
    coins_sp: char.coinsSp,
    coins_ep: char.coinsEp,
    coins_gp: char.coinsGp,
    coins_pp: char.coinsPp,
    background: char.background,
    alignment: char.alignment,
    personality_traits: char.personalityTraits,
    ideals: char.ideals,
    bonds: char.bonds,
    flaws: char.flaws,
    proficiencies_languages: char.proficienciesLanguages,
    conditions: char.conditions || '[]',
    current_initiative: char.currentInitiative,
    created_at: char.createdAt,
    updated_at: char.updatedAt,
  };
}

function buildCharacterUpdateSet(dto: UpdateCharacterDTO): Record<string, unknown> {
  const updatableFields: Record<string, unknown> = {
    name: dto.name,
    level: dto.level,
    currentHp: dto.current_hp,
    maxHp: dto.max_hp,
    tempHp: dto.temp_hp,
    armorClass: dto.armor_class,
    initiativeBonus: dto.initiative_bonus,
    speed: dto.speed,
    hitDiceTotal: dto.hit_dice_total,
    hitDiceCurrent: dto.hit_dice_current,
    deathSuccesses: dto.death_successes,
    deathFailures: dto.death_failures,
    inspiration: dto.inspiration,
    spellcastingAbility: dto.spellcasting_ability,
    background: dto.background,
    alignment: dto.alignment,
    personalityTraits: dto.personality_traits,
    ideals: dto.ideals,
    bonds: dto.bonds,
    flaws: dto.flaws,
    proficienciesLanguages: dto.proficiencies_languages,
    coinsCp: dto.coins_cp,
    coinsSp: dto.coins_sp,
    coinsEp: dto.coins_ep,
    coinsGp: dto.coins_gp,
    coinsPp: dto.coins_pp,
    strength: dto.strength,
    dexterity: dto.dexterity,
    constitution: dto.constitution,
    intelligence: dto.intelligence,
    wisdom: dto.wisdom,
    charisma: dto.charisma,
    conditions: dto.conditions,
    currentInitiative: dto.current_initiative,
  };

  const setObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updatableFields)) {
    if (value !== undefined) {
      setObj[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    }
  }
  return setObj;
}

function enrichChar(characterId: number, executor: DbExecutor = db): EnrichedCharacter {
  const char = executor.query.characters.findFirst({
    where: { id: characterId },
    with: {
      race: true,
      class: true,
      skills: true,
      savingThrows: true,
    },
  }).sync();

  if (!char) throw new Error('Character not found after write');

  const raw = toRawCharacterRow(char);
  const skills = char.skills.map((s) => s.skillKey);
  const savingThrows = char.savingThrows.map((s) => s.abilityKey);

  return enrichCharacterStats(raw, skills, savingThrows);
}

function getSpellSlots(characterId: number, executor: DbExecutor = db): SpellSlotRow[] {
  const rows = executor
    .select()
    .from(characterSpellSlots)
    .where(eq(characterSpellSlots.characterId, characterId))
    .orderBy(asc(characterSpellSlots.slotLevel))
    .all();

  return rows.map((r) => ({
    id: r.id,
    character_id: r.characterId,
    slot_level: r.slotLevel,
    max_slots: r.maxSlots,
    used_slots: r.usedSlots,
  }));
}

export const sqliteCharacterRepository: ICharacterRepository = {
  findAllByUser(userId) {
    return withResult(() => {
      const chars = db.query.characters.findMany({
        where: { userId },
        with: {
          race: true,
          class: true,
          skills: true,
          savingThrows: true,
        },
        orderBy: (characters, { desc }) => [desc(characters.updatedAt)],
      }).sync();

      return chars.map((char) => {
        const raw = toRawCharacterRow(char);
        return enrichCharacterStats(
          raw,
          char.skills.map((s) => s.skillKey),
          char.savingThrows.map((s) => s.abilityKey)
        );
      });
    });
  },

  findDetailById(characterId, userId) {
    return withTransaction((tx) => {
      const char = tx.query.characters.findFirst({
        where: { id: characterId, userId },
        with: {
          race: true,
          class: true,
          skills: true,
          savingThrows: true,
          items: {
            orderBy: (items, { desc }) => [desc(items.id)],
          },
          attacks: {
            orderBy: (attacks, { asc }) => [asc(attacks.id)],
          },
          features: {
            orderBy: (features, { asc }) => [asc(features.id)],
          },
          spellSlots: {
            orderBy: (slots, { asc }) => [asc(slots.slotLevel)],
          },
          spells: {
            with: { spell: true },
          },
        },
      }).sync();
      if (!char) return null;

      const raw = toRawCharacterRow(char);

      const mappedItems: ItemRow[] = char.items.map((i) => ({
        id: i.id,
        character_id: i.characterId,
        name: i.name,
        quantity: i.quantity ?? 1,
        description: i.description,
        effect: i.effect ?? '',
        weight: i.weight ?? 0,
        equipped: i.equipped ?? 0,
      }));

      const mappedAttacks: AttackRow[] = char.attacks.map((a) => ({
        id: a.id,
        character_id: a.characterId,
        name: a.name,
        bonus: a.bonus,
        damage_type: a.damageType,
      }));

      const mappedFeatures: FeatureRow[] = char.features.map((f) => ({
        id: f.id,
        character_id: f.characterId,
        name: f.name,
        description: f.description ?? '',
        uses_max: f.usesMax ?? 0,
        uses_current: f.usesCurrent ?? 0,
      }));

      const mappedSlots: SpellSlotRow[] = char.spellSlots.map((s) => ({
        id: s.id,
        character_id: s.characterId,
        slot_level: s.slotLevel,
        max_slots: s.maxSlots,
        used_slots: s.usedSlots,
      }));

      const mappedSpells: SpellRow[] = char.spells
        .filter((s): s is typeof s & { spell: NonNullable<typeof s.spell> } => s.spell !== null)
        .map((s) => ({
          id: s.spell.id,
          name: s.spell.name,
          level: s.spell.level,
          school: s.spell.school,
          image_filename: s.spell.imageFilename,
          image_path: s.spell.imagePath,
          casting_time: s.spell.castingTime,
          range: s.spell.range,
          components: s.spell.components,
          duration: s.spell.duration,
          description: s.spell.description,
        }));
      mappedSpells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

      return {
        character: enrichCharacterStats(
          raw,
          char.skills.map((s) => s.skillKey),
          char.savingThrows.map((s) => s.abilityKey)
        ),
        items: mappedItems,
        attacks: mappedAttacks,
        features: mappedFeatures,
        spell_slots: mappedSlots,
        spells: mappedSpells,
      };
    });
  },

  findRawById(characterId, userId) {
    return withResult(() => {
      const char = db
        .select()
        .from(characters)
        .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
        .get();
      if (!char) return null;
      return toRawCharacterRow(char);
    });
  },

  create(dto: CreateCharacterDTO) {
    return withTransaction((tx) => {
      const level = Number(dto.level) || 1;
      const max_hp = Number(dto.max_hp) || 10;

      let resolvedClassName = dto.class_name ?? null;
      if (!resolvedClassName && dto.class_id) {
        const cls = tx.select({ name: classes.name }).from(classes).where(eq(classes.id, Number(dto.class_id))).get();
        resolvedClassName = cls?.name ?? null;
      }

      const classMeta = CharacterKitProvider.getClassMetadata(resolvedClassName);
      const hitDiceTotal = dto.hit_dice_total?.trim() || `${level}${classMeta.hitDie}`;
      const spellcastingAbility = dto.spellcasting_ability ?? classMeta.spellcastingAbility;

      const result = tx
        .insert(characters)
        .values({
          userId: dto.userId,
          name: dto.name.trim(),
          raceId: dto.race_id ?? null,
          classId: dto.class_id ?? null,
          level,
          maxHp: max_hp,
          currentHp: max_hp,
          armorClass: Number(dto.armor_class) || 10,
          initiativeBonus: Number(dto.initiative_bonus) || 0,
          speed: Number(dto.speed) || 9,
          hitDiceCurrent: level,
          hitDiceTotal,
          strength: Number(dto.strength) || 10,
          dexterity: Number(dto.dexterity) || 10,
          constitution: Number(dto.constitution) || 10,
          intelligence: Number(dto.intelligence) || 10,
          wisdom: Number(dto.wisdom) || 10,
          charisma: Number(dto.charisma) || 10,
          background: (dto.background ?? '').trim(),
          alignment: (dto.alignment ?? '').trim(),
          spellcastingAbility,
        })
        .returning({ id: characters.id })
        .get();

      return enrichChar(result.id, tx);
    });
  },

  update(characterId, userId, dto: UpdateCharacterDTO) {
    return withTransaction((tx) => {
      const char = tx
        .select()
        .from(characters)
        .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
        .get();
      if (!char) return null;

      const setObj = buildCharacterUpdateSet(dto);
      if (Object.keys(setObj).length > 0) {
        tx.update(characters)
          .set(setObj)
          .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
          .run();
      }

      return enrichChar(characterId, tx);
    });
  },

  longRest(characterId, userId) {
    return withTransaction((tx) => {
      const char = tx
        .select({ maxHp: characters.maxHp, level: characters.level })
        .from(characters)
        .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
        .get();
      if (!char) return false;

      tx.update(characters)
        .set({
          currentHp: char.maxHp,
          tempHp: 0,
          deathSuccesses: 0,
          deathFailures: 0,
          hitDiceCurrent: char.level,
        })
        .where(eq(characters.id, characterId))
        .run();

      tx.update(characterSpellSlots)
        .set({ usedSlots: 0 })
        .where(eq(characterSpellSlots.characterId, characterId))
        .run();

      tx.update(characterFeatures)
        .set({ usesCurrent: sql`${characterFeatures.usesMax}` })
        .where(eq(characterFeatures.characterId, characterId))
        .run();

      return true;
    });
  },

  delete(characterId, userId) {
    return withResult(() => {
      const result = db
        .delete(characters)
        .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
        .run();
      return result.changes > 0;
    });
  },

  toggleSkill(characterId, skillKey) {
    return withTransaction((tx) => {
      const existing = tx
        .select()
        .from(characterSkills)
        .where(and(eq(characterSkills.characterId, characterId), eq(characterSkills.skillKey, skillKey)))
        .get();
      if (existing) {
        tx.delete(characterSkills).where(eq(characterSkills.id, existing.id)).run();
      } else {
        tx.insert(characterSkills).values({ characterId, skillKey }).run();
      }
      return enrichChar(characterId, tx);
    });
  },

  toggleSavingThrow(characterId, abilityKey) {
    return withTransaction((tx) => {
      const existing = tx
        .select()
        .from(characterSavingThrows)
        .where(and(eq(characterSavingThrows.characterId, characterId), eq(characterSavingThrows.abilityKey, abilityKey)))
        .get();
      if (existing) {
        tx.delete(characterSavingThrows).where(eq(characterSavingThrows.id, existing.id)).run();
      } else {
        tx.insert(characterSavingThrows).values({ characterId, abilityKey }).run();
      }
      return enrichChar(characterId, tx);
    });
  },

  updateSpellSlot(characterId, slotLevel, data) {
    return withTransaction((tx) => {
      const setObj: Partial<{ usedSlots: number; maxSlots: number }> = {};
      if (data.used_slots !== undefined) setObj.usedSlots = Math.max(0, data.used_slots);
      if (data.max_slots !== undefined) setObj.maxSlots = Math.max(0, data.max_slots);

      if (Object.keys(setObj).length > 0) {
        tx.update(characterSpellSlots)
          .set(setObj)
          .where(and(eq(characterSpellSlots.characterId, characterId), eq(characterSpellSlots.slotLevel, slotLevel)))
          .run();
      }
      return getSpellSlots(characterId, tx);
    });
  },

  setSpellSlots(characterId, slots) {
    return withTransaction((tx) => {
      tx.delete(characterSpellSlots).where(eq(characterSpellSlots.characterId, characterId)).run();
      if (slots.length > 0) {
        const slotsToInsert = slots.map((slot) => ({
          characterId,
          slotLevel: slot.slot_level,
          maxSlots: slot.max_slots,
          usedSlots: 0,
        }));
        tx.insert(characterSpellSlots).values(slotsToInsert).run();
      }
      return getSpellSlots(characterId, tx);
    });
  },

  addAttack(characterId, data) {
    return withTransaction((tx) => {
      const trimmedName = data.name.trim();
      const trimmedBonus = data.bonus.trim();
      const trimmedDamage = data.damage_type.trim();

      const existingPlaceholder = tx
        .select()
        .from(characterAttacks)
        .where(
          and(
            eq(characterAttacks.characterId, characterId),
            eq(characterAttacks.name, trimmedName),
            eq(characterAttacks.bonus, '+0')
          )
        )
        .get();

      let result;
      if (existingPlaceholder) {
        result = tx
          .update(characterAttacks)
          .set({ bonus: trimmedBonus, damageType: trimmedDamage })
          .where(eq(characterAttacks.id, existingPlaceholder.id))
          .returning()
          .get();
      } else {
        result = tx
          .insert(characterAttacks)
          .values({
            characterId,
            name: trimmedName,
            bonus: trimmedBonus,
            damageType: trimmedDamage,
          })
          .returning()
          .get();
      }

      const existingItem = tx
        .select({ id: characterItems.id })
        .from(characterItems)
        .where(and(eq(characterItems.characterId, characterId), eq(characterItems.name, trimmedName)))
        .get();

      if (!existingItem) {
        tx.insert(characterItems)
          .values({
            characterId,
            name: trimmedName,
            quantity: 1,
            weight: 0,
            effect: `Arma/Ataque de Combate • Dano: ${trimmedDamage}`,
            equipped: 1,
          })
          .run();
      }

      return {
        id: result.id,
        character_id: result.characterId,
        name: result.name,
        bonus: result.bonus,
        damage_type: result.damageType,
      };
    });
  },

  deleteAttack(characterId, attackId) {
    return withResult(() => {
      const result = db
        .delete(characterAttacks)
        .where(and(eq(characterAttacks.id, attackId), eq(characterAttacks.characterId, characterId)))
        .run();
      return result.changes > 0;
    });
  },

  addFeature(characterId, data) {
    return withResult(() => {
      const result = db
        .insert(characterFeatures)
        .values({
          characterId,
          name: data.name.trim(),
          description: data.description.trim(),
          usesMax: data.uses_max,
          usesCurrent: data.uses_current,
        })
        .returning()
        .get();

      return {
        id: result.id,
        character_id: result.characterId,
        name: result.name,
        description: result.description ?? '',
        uses_max: result.usesMax ?? 0,
        uses_current: result.usesCurrent ?? 0,
      };
    });
  },

  updateFeature(characterId, featureId, data) {
    return withTransaction((tx) => {
      const setObj: Partial<{
        usesCurrent: number;
        usesMax: number;
        name: string;
        description: string;
      }> = {};
      if (data.uses_current !== undefined) setObj.usesCurrent = Number(data.uses_current);
      if (data.uses_max !== undefined) setObj.usesMax = Number(data.uses_max);
      if (data.name !== undefined) setObj.name = String(data.name).trim();
      if (data.description !== undefined) setObj.description = String(data.description);

      if (Object.keys(setObj).length > 0) {
        tx.update(characterFeatures)
          .set(setObj)
          .where(and(eq(characterFeatures.id, featureId), eq(characterFeatures.characterId, characterId)))
          .run();
      }

      const result = tx.select().from(characterFeatures).where(eq(characterFeatures.id, featureId)).get();
      if (!result) return null;
      return {
        id: result.id,
        character_id: result.characterId,
        name: result.name,
        description: result.description ?? '',
        uses_max: result.usesMax ?? 0,
        uses_current: result.usesCurrent ?? 0,
      };
    });
  },

  deleteFeature(characterId, featureId) {
    return withResult(() => {
      const result = db
        .delete(characterFeatures)
        .where(and(eq(characterFeatures.id, featureId), eq(characterFeatures.characterId, characterId)))
        .run();
      return result.changes > 0;
    });
  },

  addItem(characterId, data) {
    return withTransaction((tx) => {
      const result = tx
        .insert(characterItems)
        .values({
          characterId,
          name: data.name.trim(),
          quantity: data.quantity,
          weight: data.weight,
          effect: data.effect.trim(),
          equipped: data.equipped,
        })
        .returning()
        .get();

      if (data.effect && data.effect.toLowerCase().includes('dano:')) {
        const match = data.effect.match(/Dano:\s*([^•\n]+)/i);
        if (match) {
          tx.insert(characterAttacks)
            .values({
              characterId,
              name: data.name.trim(),
              bonus: '+0',
              damageType: match[1].trim(),
            })
            .run();
        }
      }

      return {
        id: result.id,
        character_id: result.characterId,
        name: result.name,
        quantity: result.quantity ?? 1,
        weight: result.weight ?? 0,
        description: result.description ?? '',
        effect: result.effect ?? '',
        equipped: result.equipped ?? 0,
      };
    });
  },

  updateItem(characterId, itemId, data) {
    return withTransaction((tx) => {
      const setObj: Partial<{
        name: string;
        quantity: number;
        weight: number;
        effect: string;
        equipped: number;
      }> = {};
      if (data.name !== undefined) setObj.name = String(data.name).trim();
      if (data.quantity !== undefined) setObj.quantity = Number(data.quantity) || 1;
      if (data.weight !== undefined) setObj.weight = Number(data.weight) || 0;
      if (data.effect !== undefined) setObj.effect = String(data.effect);
      if (data.equipped !== undefined) setObj.equipped = data.equipped ? 1 : 0;

      if (Object.keys(setObj).length > 0) {
        tx.update(characterItems)
          .set(setObj)
          .where(and(eq(characterItems.id, itemId), eq(characterItems.characterId, characterId)))
          .run();
      }

      const result = tx.select().from(characterItems).where(eq(characterItems.id, itemId)).get();
      if (!result) return null;
      return {
        id: result.id,
        character_id: result.characterId,
        name: result.name,
        quantity: result.quantity ?? 1,
        weight: result.weight ?? 0,
        description: result.description ?? '',
        effect: result.effect ?? '',
        equipped: result.equipped ?? 0,
      };
    });
  },

  deleteItem(characterId, itemId) {
    return withResult(() => {
      const result = db
        .delete(characterItems)
        .where(and(eq(characterItems.id, itemId), eq(characterItems.characterId, characterId)))
        .run();
      return result.changes > 0;
    });
  },

  getMetaOptions() {
    return withResult(() => {
      const r = db.select({ id: races.id, name: races.name }).from(races).orderBy(races.name).all();
      const c = db.select({ id: classes.id, name: classes.name }).from(classes).orderBy(classes.name).all();
      return { races: r, classes: c };
    });
  },

  findAllForDM(): Result<DMRosterItem[], Error> {
    return withResult(() => {
      const chars = db.query.characters.findMany({
        with: {
          race: true,
          class: true,
          user: true,
        },
        orderBy: (c, { asc }) => [asc(c.name)],
      }).sync();

      return chars.map((c) => ({
        id: c.id,
        name: c.name,
        level: c.level ?? 1,
        current_hp: c.currentHp,
        max_hp: c.maxHp,
        temp_hp: c.tempHp,
        armor_class: c.armorClass,
        speed: c.speed,
        initiative_bonus: c.initiativeBonus,
        death_successes: c.deathSuccesses,
        death_failures: c.deathFailures,
        inspiration: c.inspiration,
        conditions: c.conditions || '[]',
        current_initiative: c.currentInitiative,
        spellcasting_ability: c.spellcastingAbility,
        race_name: c.race?.name ?? null,
        class_name: c.class?.name ?? null,
        player_name: c.user?.name ?? null,
      }));
    });
  },

  updateAsDM(characterId, dto) {
    return withTransaction((tx) => {
      const setObj = buildCharacterUpdateSet(dto);
      if (Object.keys(setObj).length > 0) {
        tx.update(characters).set(setObj).where(eq(characters.id, characterId)).run();
      }
      return enrichChar(characterId, tx);
    });
  },
};
