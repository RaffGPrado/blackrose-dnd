import type { AbilityKey, SkillKey } from '../../types/dnd5e.js';
import {
  calculateModifier,
  formatModifier,
  calculateProficiencyBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculatePassivePerception,
} from '../../utils/dnd.js';

export {
  calculateModifier,
  formatModifier,
  calculateProficiencyBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculatePassivePerception,
};

export const DND_SKILLS: ReadonlyArray<{
  key: SkillKey;
  name: string;
  ability: AbilityKey;
}> = [
  { key: 'acrobatics', name: 'Acrobacia', ability: 'dexterity' },
  { key: 'animal_handling', name: 'Adestrar Animais', ability: 'wisdom' },
  { key: 'arcana', name: 'Arcanismo', ability: 'intelligence' },
  { key: 'athletics', name: 'Atletismo', ability: 'strength' },
  { key: 'performance', name: 'Atuação', ability: 'charisma' },
  { key: 'deception', name: 'Blefar', ability: 'charisma' },
  { key: 'stealth', name: 'Furtividade', ability: 'dexterity' },
  { key: 'history', name: 'História', ability: 'intelligence' },
  { key: 'intimidation', name: 'Intimidação', ability: 'charisma' },
  { key: 'insight', name: 'Intuição', ability: 'wisdom' },
  { key: 'investigation', name: 'Investigação', ability: 'intelligence' },
  { key: 'medicine', name: 'Medicina', ability: 'wisdom' },
  { key: 'nature', name: 'Natureza', ability: 'intelligence' },
  { key: 'perception', name: 'Percepção', ability: 'wisdom' },
  { key: 'persuasion', name: 'Persuasão', ability: 'charisma' },
  { key: 'sleight_of_hand', name: 'Prestidigitação', ability: 'dexterity' },
  { key: 'religion', name: 'Religião', ability: 'intelligence' },
  { key: 'survival', name: 'Sobrevivência', ability: 'wisdom' },
];

export const DND_SAVING_THROWS: ReadonlyArray<{
  key: AbilityKey;
  name: string;
  ability: AbilityKey;
}> = [
  { key: 'strength', name: 'Força', ability: 'strength' },
  { key: 'dexterity', name: 'Destreza', ability: 'dexterity' },
  { key: 'constitution', name: 'Constituição', ability: 'constitution' },
  { key: 'intelligence', name: 'Inteligência', ability: 'intelligence' },
  { key: 'wisdom', name: 'Sabedoria', ability: 'wisdom' },
  { key: 'charisma', name: 'Carisma', ability: 'charisma' },
];

export const FULL_CASTER_SLOTS: Readonly<Record<number, readonly number[]>> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export interface RawCharacterRow {
  id: number;
  user_id: number;
  name: string;
  race_id?: number | null;
  class_id?: number | null;
  race_name?: string | null;
  class_name?: string | null;
  level: number;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  armor_class?: number;
  speed?: number;
  initiative_bonus: number;
  hit_dice_total?: string | null;
  hit_dice_current?: number | null;
  death_successes?: number | null;
  death_failures?: number | null;
  inspiration?: number | null;
  spellcasting_ability: AbilityKey;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  coins_cp?: number | null;
  coins_sp?: number | null;
  coins_ep?: number | null;
  coins_gp?: number | null;
  coins_pp?: number | null;
  background?: string | null;
  alignment?: string | null;
  personality_traits?: string | null;
  ideals?: string | null;
  bonds?: string | null;
  flaws?: string | null;
  proficiencies_languages?: string | null;
  conditions?: string | null;
  current_initiative?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ComputedSkill {
  key: string;
  name: string;
  ability: AbilityKey;
  proficient: boolean;
  modifier: number;
  formatted_modifier: string;
}

export interface ComputedSavingThrow {
  key: AbilityKey;
  name: string;
  ability: AbilityKey;
  proficient: boolean;
  modifier: number;
  formatted_modifier: string;
}

export interface EnrichedCharacter extends RawCharacterRow {
  initiative: number;
  formatted_initiative: string;
  proficiency_bonus: number;
  spell_save_dc: number;
  spell_attack_bonus: number;
  formatted_spell_attack_bonus: string;
  modifiers: Record<AbilityKey, number>;
  formatted_modifiers: Record<AbilityKey, string>;
  saving_throws: Record<AbilityKey, ComputedSavingThrow>;
  skills: Record<string, ComputedSkill>;
  passive_perception: number;
}

export function enrichCharacterStats(
  character: RawCharacterRow,
  proficientSkillKeys: string[] = [],
  proficientSavingThrowKeys: string[] = [],
): EnrichedCharacter {
  const strMod = calculateModifier(character.strength);
  const dexMod = calculateModifier(character.dexterity);
  const conMod = calculateModifier(character.constitution);
  const intMod = calculateModifier(character.intelligence);
  const wisMod = calculateModifier(character.wisdom);
  const chaMod = calculateModifier(character.charisma);
  const profBonus = calculateProficiencyBonus(character.level);

  const modifiers: Record<AbilityKey, number> = {
    strength: strMod,
    dexterity: dexMod,
    constitution: conMod,
    intelligence: intMod,
    wisdom: wisMod,
    charisma: chaMod,
  };

  const formatted_modifiers: Record<AbilityKey, string> = {
    strength: formatModifier(strMod),
    dexterity: formatModifier(dexMod),
    constitution: formatModifier(conMod),
    intelligence: formatModifier(intMod),
    wisdom: formatModifier(wisMod),
    charisma: formatModifier(chaMod),
  };

  const stProfSet = new Set(proficientSavingThrowKeys);
  const saving_throws: Record<AbilityKey, ComputedSavingThrow> = {} as Record<AbilityKey, ComputedSavingThrow>;

  DND_SAVING_THROWS.forEach((st) => {
    const isProficient = stProfSet.has(st.key);
    const baseMod = modifiers[st.ability];
    const totalBonus = baseMod + (isProficient ? profBonus : 0);
    saving_throws[st.key] = {
      ...st,
      proficient: isProficient,
      modifier: totalBonus,
      formatted_modifier: formatModifier(totalBonus),
    };
  });

  const profSet = new Set(proficientSkillKeys);
  const skills: Record<string, ComputedSkill> = {};

  DND_SKILLS.forEach((skill) => {
    const isProficient = profSet.has(skill.key);
    const baseMod = modifiers[skill.ability];
    const totalBonus = baseMod + (isProficient ? profBonus : 0);
    skills[skill.key] = {
      ...skill,
      proficient: isProficient,
      modifier: totalBonus,
      formatted_modifier: formatModifier(totalBonus),
    };
  });

  const spellAbility = character.spellcasting_ability ?? 'intelligence';
  const spellMod = modifiers[spellAbility] ?? intMod;
  const spell_save_dc = calculateSpellSaveDC(profBonus, spellMod);
  const spell_attack_bonus = calculateSpellAttackBonus(profBonus, spellMod);
  const initiativeBonus = Number(character.initiative_bonus) || 0;
  const initiative = dexMod + initiativeBonus;

  return {
    ...character,
    initiative,
    formatted_initiative: formatModifier(initiative),
    proficiency_bonus: profBonus,
    spell_save_dc,
    spell_attack_bonus,
    formatted_spell_attack_bonus: formatModifier(spell_attack_bonus),
    modifiers,
    formatted_modifiers,
    saving_throws,
    skills,
    passive_perception: calculatePassivePerception(wisMod, profSet.has('perception'), profBonus),
  };
}

