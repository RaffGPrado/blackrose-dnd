/**
 * Canonical D&D 5th Edition TypeScript Types & API Data Contracts
 * Black Rose D&D Mobile Character Sheet & Grimoire
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

export interface SkillData {
  name: string;
  ability: AbilityKey;
  modifier: number;
  proficient: boolean;
}

export interface SavingThrowData {
  name: string;
  modifier: number;
  proficient: boolean;
}

export interface CharacterCore extends AbilityScores, CoinPouch {
  id: number;
  user_id: number;
  name: string;
  race_name?: string;
  class_name?: string;
  race_id?: number | null;
  class_id?: number | null;
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

export interface AttackItem {
  id: number;
  character_id: number;
  name: string;
  bonus: string;
  damage_type: string;
}

export interface ClassFeature {
  id: number;
  character_id: number;
  name: string;
  description: string;
  uses_max: number;
  uses_current: number;
}

export interface InventoryItem {
  id: number;
  character_id: number;
  name: string;
  quantity: number;
  weight: number;
  effect: string;
}

export interface SpellSlot {
  slot_level: number;
  max_slots: number;
  used_slots: number;
}

export interface SpellCard {
  id: number;
  name: string;
  level: number;
  school: string;
  image_filename: string;
  image_path: string;
  image_url?: string;
  casting_time?: string;
  range?: string;
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

export interface EnrichedCharacter extends CharacterCore {
  modifiers: Record<AbilityKey, number>;
  formatted_modifiers: Record<AbilityKey, string>;
  proficiency_bonus: number;
  formatted_initiative: string;
  spell_save_dc: number;
  spell_attack_bonus: string;
  skills: Record<SkillKey, SkillData>;
  saving_throws: Record<AbilityKey, SavingThrowData>;
}

export interface CharacterDetailResponse {
  character: EnrichedCharacter;
  items: InventoryItem[];
  attacks: AttackItem[];
  features: ClassFeature[];
  spell_slots: SpellSlot[];
  spells: SpellCard[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface MetaOptionsResponse {
  races: { id: number; name: string }[];
  classes: { id: number; name: string }[];
}

export interface SpellsResponse {
  spells: SpellCard[];
  total?: number;
}

export interface SchoolsResponse {
  schools: string[];
}

export type DND5eCondition =
  | 'Abalado'
  | 'Agarrado'
  | 'Amedrontado'
  | 'Atordoado'
  | 'Caído'
  | 'Cego'
  | 'Confinado'
  | 'Enfeitiçado'
  | 'Envenenado'
  | 'Incapacitado'
  | 'Inconsciente'
  | 'Invisível'
  | 'Paralisado'
  | 'Petrificado'
  | 'Surdo'
  | 'Exaustão';

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
  spellcasting_ability: AbilityKey;
  race_name?: string;
  class_name?: string;
  player_name?: string;
  hit_dice_total?: string;
  hit_dice_current?: number;
  conditions: string; // JSON serialized string e.g. "[\"Envenenado\"]"
  online?: boolean; // real-time presence
}
