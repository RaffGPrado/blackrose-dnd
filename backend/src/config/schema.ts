import { sqliteTable, integer, text, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { defineRelations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const races = sqliteTable('races', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  nameEn: text('name_en').notNull().default(''),
  hitDie: text('hit_die').notNull().default('1d8'),
  spellcastingAbility: text('spellcasting_ability'),
  casterType: text('caster_type').notNull().default('none'),
  savingThrows: text('saving_throws').notNull().default('[]'),
});

export const spells = sqliteTable('spells', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  nameEn: text('name_en'),
  level: integer('level').notNull(),
  school: text('school').notNull(),
  imageFilename: text('image_filename').notNull(),
  imagePath: text('image_path').notNull(),
  castingTime: text('casting_time').notNull().default('1 Ação'),
  range: text('range').notNull().default('Pessoal'),
  components: text('components').notNull().default('V, S'),
  duration: text('duration').notNull().default('Instantânea'),
  concentration: integer('concentration').notNull().default(0),
  ritual: integer('ritual').notNull().default(0),
  description: text('description').notNull().default(''),
}, (table) => ({
  nameIdx: index('spells_name_idx').on(table.name),
  levelIdx: index('spells_level_idx').on(table.level),
  schoolIdx: index('spells_school_idx').on(table.school),
}));

export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  raceId: integer('race_id').references(() => races.id),
  classId: integer('class_id').references(() => classes.id),
  level: integer('level').notNull().default(1),
  maxHp: integer('max_hp').notNull().default(10),
  currentHp: integer('current_hp').notNull().default(10),
  tempHp: integer('temp_hp').notNull().default(0),
  armorClass: integer('armor_class').notNull().default(10),
  speed: integer('speed').notNull().default(30),
  initiativeBonus: integer('initiative_bonus').notNull().default(0),
  hitDiceTotal: text('hit_dice_total').default('1d8'),
  hitDiceCurrent: integer('hit_dice_current').default(1),
  deathSuccesses: integer('death_successes').notNull().default(0),
  deathFailures: integer('death_failures').notNull().default(0),
  inspiration: integer('inspiration').notNull().default(0),
  spellcastingAbility: text('spellcasting_ability').notNull().default('intelligence'),
  
  strength: integer('strength').notNull().default(10),
  dexterity: integer('dexterity').notNull().default(10),
  constitution: integer('constitution').notNull().default(10),
  intelligence: integer('intelligence').notNull().default(10),
  wisdom: integer('wisdom').notNull().default(10),
  charisma: integer('charisma').notNull().default(10),

  coinsCp: integer('coins_cp').notNull().default(0),
  coinsSp: integer('coins_sp').notNull().default(0),
  coinsEp: integer('coins_ep').notNull().default(0),
  coinsGp: integer('coins_gp').notNull().default(0),
  coinsPp: integer('coins_pp').notNull().default(0),

  background: text('background'),
  alignment: text('alignment'),
  personalityTraits: text('personality_traits'),
  ideals: text('ideals'),
  bonds: text('bonds'),
  flaws: text('flaws'),
  proficienciesLanguages: text('proficiencies_languages'),

  conditions: text('conditions').default('[]'),
  currentInitiative: integer('current_initiative'),

  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
}, (table) => ({
  userIdx: index('characters_user_id_idx').on(table.userId)
}));

export const characterSkills = sqliteTable('character_skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  skillKey: text('skill_key').notNull(),
}, (table) => ({
  charIdx: uniqueIndex('char_skills_unique_idx').on(table.characterId, table.skillKey)
}));

export const characterSavingThrows = sqliteTable('character_saving_throws', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  abilityKey: text('ability_key').notNull(),
}, (table) => ({
  charIdx: uniqueIndex('char_saves_unique_idx').on(table.characterId, table.abilityKey)
}));

export const characterSpells = sqliteTable('character_spells', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  spellId: integer('spell_id').notNull().references(() => spells.id, { onDelete: 'cascade' }),
  prepared: integer('prepared').default(1),
}, (table) => ({
  charIdx: index('idx_char_spells').on(table.characterId)
}));

export const characterSpellSlots = sqliteTable('character_spell_slots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  slotLevel: integer('slot_level').notNull(),
  maxSlots: integer('max_slots').notNull().default(0),
  usedSlots: integer('used_slots').notNull().default(0),
}, (table) => ({
  charIdx: index('idx_char_slots').on(table.characterId)
}));

export const characterAttacks = sqliteTable('character_attacks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  bonus: text('bonus').notNull(),
  damageType: text('damage_type').notNull(),
}, (table) => ({
  charIdx: index('char_attacks_character_id_idx').on(table.characterId)
}));

export const characterFeatures = sqliteTable('character_features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  usesMax: integer('uses_max').default(0),
  usesCurrent: integer('uses_current').default(0),
  recovery: text('recovery').default('Descanso Longo'),
}, (table) => ({
  charIdx: index('char_features_character_id_idx').on(table.characterId)
}));

export const characterItems = sqliteTable('character_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').default('Equipamento'),
  quantity: integer('quantity').default(1),
  description: text('description'),
  effect: text('effect'),
  damage: text('damage'),
  properties: text('properties'),
  weight: real('weight').default(0.0),
  equipped: integer('equipped').default(0),
}, (table) => ({
  charIdx: index('char_items_character_id_idx').on(table.characterId)
}));

export const referenceItems = sqliteTable('reference_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  weight: real('weight').default(0.0),
  cost: text('cost'),
  damage: text('damage'),
  armorClass: text('armor_class'),
  properties: text('properties'),
  description: text('description'),
});

export const referenceFeatures = sqliteTable('reference_features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sourceType: text('source_type').notNull().default('Classe'),
  className: text('class_name'),
  level: integer('level').default(1),
  usesMax: integer('uses_max').default(0),
  recovery: text('recovery').default('Descanso Longo'),
  description: text('description'),
});

export const schemaRelations = defineRelations(
  {
    users,
    races,
    classes,
    characters,
    characterSkills,
    characterSavingThrows,
    characterSpells,
    characterSpellSlots,
    characterAttacks,
    characterFeatures,
    characterItems,
    spells,
  },
  (helpers) => ({
    characters: {
      user: helpers.one.users({
        from: helpers.characters.userId,
        to: helpers.users.id,
      }),
      race: helpers.one.races({
        from: helpers.characters.raceId,
        to: helpers.races.id,
      }),
      class: helpers.one.classes({
        from: helpers.characters.classId,
        to: helpers.classes.id,
      }),
      skills: helpers.many.characterSkills({
        from: helpers.characters.id,
        to: helpers.characterSkills.characterId,
      }),
      savingThrows: helpers.many.characterSavingThrows({
        from: helpers.characters.id,
        to: helpers.characterSavingThrows.characterId,
      }),
      spells: helpers.many.characterSpells({
        from: helpers.characters.id,
        to: helpers.characterSpells.characterId,
      }),
      spellSlots: helpers.many.characterSpellSlots({
        from: helpers.characters.id,
        to: helpers.characterSpellSlots.characterId,
      }),
      attacks: helpers.many.characterAttacks({
        from: helpers.characters.id,
        to: helpers.characterAttacks.characterId,
      }),
      features: helpers.many.characterFeatures({
        from: helpers.characters.id,
        to: helpers.characterFeatures.characterId,
      }),
      items: helpers.many.characterItems({
        from: helpers.characters.id,
        to: helpers.characterItems.characterId,
      }),
    },
    characterSkills: {
      character: helpers.one.characters({
        from: helpers.characterSkills.characterId,
        to: helpers.characters.id,
      }),
    },
    characterSavingThrows: {
      character: helpers.one.characters({
        from: helpers.characterSavingThrows.characterId,
        to: helpers.characters.id,
      }),
    },
    characterSpells: {
      character: helpers.one.characters({
        from: helpers.characterSpells.characterId,
        to: helpers.characters.id,
      }),
      spell: helpers.one.spells({
        from: helpers.characterSpells.spellId,
        to: helpers.spells.id,
      }),
    },
    characterSpellSlots: {
      character: helpers.one.characters({
        from: helpers.characterSpellSlots.characterId,
        to: helpers.characters.id,
      }),
    },
    characterAttacks: {
      character: helpers.one.characters({
        from: helpers.characterAttacks.characterId,
        to: helpers.characters.id,
      }),
    },
    characterFeatures: {
      character: helpers.one.characters({
        from: helpers.characterFeatures.characterId,
        to: helpers.characters.id,
      }),
    },
    characterItems: {
      character: helpers.one.characters({
        from: helpers.characterItems.characterId,
        to: helpers.characters.id,
      }),
    },
  })
);
