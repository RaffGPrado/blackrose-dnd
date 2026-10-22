/**
 * Canonical D&D 5th Edition TypeScript Types for Black Rose Backend
 */

export type AbilityKey =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export type SkillKey =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'performance'
  | 'deception'
  | 'stealth'
  | 'history'
  | 'intimidation'
  | 'insight'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'persuasion'
  | 'sleight_of_hand'
  | 'religion'
  | 'survival';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CoinPouch {
  coins_cp: number;
  coins_sp: number;
  coins_ep: number;
  coins_gp: number;
  coins_pp: number;
}

export interface SkillDefinition {
  key: SkillKey;
  name: string;
  ability: AbilityKey;
}

export interface SavingThrowDefinition {
  key: AbilityKey;
  name: string;
  ability: AbilityKey;
}

export interface CharacterRow extends AbilityScores, CoinPouch {
  id: number;
  user_id: number;
  name: string;
  race_id?: number | null;
  class_id?: number | null;
  race_name?: string;
  class_name?: string;
  level: number;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  armor_class: number;
  initiative_bonus: number;
  speed: number;
  hit_dice_total: string;
  hit_dice_current: number;
  death_successes: number;
  death_failures: number;
  inspiration: 0 | 1;
  spellcasting_ability: AbilityKey;
  background?: string;
  alignment?: string;
  personality_traits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  proficiencies_languages?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttackRow {
  id: number;
  character_id: number;
  name: string;
  bonus: string;
  damage_type: string;
}

export interface FeatureRow {
  id: number;
  character_id: number;
  name: string;
  description: string;
  uses_max: number;
  uses_current: number;
}

export interface InventoryItemRow {
  id: number;
  character_id: number;
  name: string;
  quantity: number;
  weight: number;
  effect: string;
}

export interface SpellSlotRow {
  slot_level: number;
  max_slots: number;
  used_slots: number;
}

export interface SpellRow {
  id: number;
  name: string;
  level: number;
  school: string;
  image_filename: string;
  image_path: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at?: string;
}

export type SpellCard = SpellRow;

export interface DMRosterItem {
  id: number;
  user_id: number;
  player_name?: string;
  name: string;
  race_name?: string;
  class_name?: string;
  level: number;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  armor_class: number;
  speed: number;
  hit_dice_total: string;
  hit_dice_current: number;
  current_initiative?: number | null;
  conditions?: string;
  death_successes: number;
  death_failures: number;
  inspiration: 0 | 1;
  online?: boolean;
}

export interface ReferenceItem {
  id: number;
  name: string;
  category: string;
  weight: number;
  cost?: string | null;
  damage?: string | null;
  armor_class?: string | null;
  properties?: string | null;
  description: string;
}

export interface ReferenceFeature {
  id: number;
  name: string;
  source_type: 'Classe' | 'Talento';
  class_name?: string | null;
  level: number;
  uses_max: number;
  recovery: string;
  description: string;
}

