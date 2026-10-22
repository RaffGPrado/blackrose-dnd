export const calculateModifier = (score: number = 10): number => {
  const num = Number(score);
  if (Number.isNaN(num)) return 0;
  return Math.floor((num - 10) / 2);
};

export const formatModifier = (mod: number): string => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const calculateProficiencyBonus = (level: number = 1): number => {
  const lvl = Math.max(1, Math.min(20, Number(level) || 1));
  return Math.floor((lvl - 1) / 4) + 2;
};

export const calculateSpellSaveDC = (proficiencyBonus: number, spellMod: number): number => {
  return 8 + proficiencyBonus + spellMod;
};

export const calculateSpellAttackBonus = (proficiencyBonus: number, spellMod: number): number => {
  return proficiencyBonus + spellMod;
};

export const calculatePassivePerception = (
  wisdomMod: number,
  isProficient: boolean,
  proficiencyBonus: number,
): number => {
  return 10 + wisdomMod + (isProficient ? proficiencyBonus : 0);
};

export const calculateCarryCapacityKg = (strength: number = 10): number => {
  const str = Math.max(1, Number(strength) || 10);
  return str * 7.5;
};

export const clampHitPoints = (currentHp: number, maxHp: number, delta: number): number => {
  return Math.max(0, Math.min(maxHp, currentHp + delta));
};

export const compareByInitiative = (
  a: { current_initiative?: number | null; name: string },
  b: { current_initiative?: number | null; name: string },
): number => {
  const initA = a.current_initiative ?? -99;
  const initB = b.current_initiative ?? -99;
  if (initB !== initA) return initB - initA;
  return a.name.localeCompare(b.name);
};
