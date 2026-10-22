import { Result } from 'neverthrow';
import type { EnrichedCharacter, RawCharacterRow } from './CharacterEntity.js';

export interface AttackRow {
  id: number;
  character_id: number;
  name: string;
  bonus: string;
  damage_type: string;
  created_at?: string;
}

export interface FeatureRow {
  id: number;
  character_id: number;
  name: string;
  description: string;
  uses_max: number;
  uses_current: number;
  created_at?: string;
}

export interface ItemRow {
  id: number;
  character_id: number;
  name: string;
  quantity: number;
  weight: number;
  description?: string | null;
  effect: string;
  equipped: number;
  created_at?: string;
}

export interface SpellSlotRow {
  id: number;
  character_id: number;
  slot_level: number;
  max_slots: number;
  used_slots: number;
}

export interface SpellRow {
  id: number;
  name: string;
  level: number;
  school: string;
  image_filename?: string;
  image_path?: string;
  casting_time?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
}

export interface CharacterDetailResult {
  character: EnrichedCharacter;
  items: ItemRow[];
  attacks: AttackRow[];
  features: FeatureRow[];
  spell_slots: SpellSlotRow[];
  spells: SpellRow[];
}

export interface CreateCharacterDTO {
  userId: number;
  name: string;
  race_id?: number | null;
  class_id?: number | null;
  class_name?: string | null;
  level?: number;
  max_hp?: number;
  armor_class?: number;
  initiative_bonus?: number;
  speed?: number;
  hit_dice_total?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  background?: string;
  alignment?: string;
  spellcasting_ability?: string;
}

export type UpdateCharacterDTO = Partial<{
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
  temp_hp: number;
  armor_class: number;
  initiative_bonus: number;
  speed: number;
  hit_dice_total: string;
  hit_dice_current: number;
  death_successes: number;
  death_failures: number;
  inspiration: number;
  spellcasting_ability: string;
  background: string;
  alignment: string;
  personality_traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  proficiencies_languages: string;
  coins_cp: number;
  coins_sp: number;
  coins_ep: number;
  coins_gp: number;
  coins_pp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  conditions: string;
  current_initiative: number | null;
}>;

export interface ICharacterRepository {
  findAllByUser(userId: number): Result<EnrichedCharacter[], Error>;
  findDetailById(characterId: number, userId: number): Result<CharacterDetailResult | null, Error>;
  findRawById(characterId: number, userId: number): Result<RawCharacterRow | null, Error>;
  create(dto: CreateCharacterDTO): Result<EnrichedCharacter, Error>;
  update(characterId: number, userId: number, dto: UpdateCharacterDTO): Result<EnrichedCharacter | null, Error>;
  longRest(characterId: number, userId: number): Result<boolean, Error>;
  delete(characterId: number, userId: number): Result<boolean, Error>;

  toggleSkill(characterId: number, skillKey: string): Result<EnrichedCharacter, Error>;
  toggleSavingThrow(characterId: number, abilityKey: string): Result<EnrichedCharacter, Error>;

  updateSpellSlot(
    characterId: number,
    slotLevel: number,
    data: { used_slots?: number; max_slots?: number },
  ): Result<SpellSlotRow[], Error>;

  setSpellSlots(characterId: number, slots: { slot_level: number; max_slots: number }[]): Result<SpellSlotRow[], Error>;

  addAttack(characterId: number, data: { name: string; bonus: string; damage_type: string }): Result<AttackRow, Error>;
  deleteAttack(characterId: number, attackId: number): Result<boolean, Error>;

  addFeature(characterId: number, data: { name: string; description: string; uses_max: number; uses_current: number }): Result<FeatureRow, Error>;
  updateFeature(characterId: number, featureId: number, data: Partial<FeatureRow>): Result<FeatureRow | null, Error>;
  deleteFeature(characterId: number, featureId: number): Result<boolean, Error>;

  addItem(characterId: number, data: { name: string; quantity: number; weight: number; effect: string; equipped: number }): Result<ItemRow, Error>;
  updateItem(characterId: number, itemId: number, data: Partial<ItemRow>): Result<ItemRow | null, Error>;
  deleteItem(characterId: number, itemId: number): Result<boolean, Error>;

  getMetaOptions(): Result<{ races: { id: number; name: string }[]; classes: { id: number; name: string }[] }, Error>;

  findAllForDM(): Result<DMRosterItem[], Error>;
  updateAsDM(characterId: number, dto: UpdateCharacterDTO): Result<EnrichedCharacter | null, Error>;
}

export interface DMRosterItem {
  id: number;
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
  temp_hp: number;
  armor_class: number;
  speed: number;
  initiative_bonus: number;
  current_initiative: number | null;
  death_successes: number;
  death_failures: number;
  inspiration: number;
  spellcasting_ability: string;
  race_name?: string | null;
  class_name?: string | null;
  player_name?: string | null;
  conditions: string;
}

