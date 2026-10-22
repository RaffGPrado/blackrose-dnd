export interface IDamageCalculationStrategy {
  readonly mode: 'normal' | 'resistant' | 'vulnerable' | 'immune';
  calculate(rawDamage: number): number;
}

export class NormalDamageStrategy implements IDamageCalculationStrategy {
  public readonly mode = 'normal' as const;
  public calculate(rawDamage: number): number {
    return Math.max(0, Math.floor(rawDamage));
  }
}

export class ResistantDamageStrategy implements IDamageCalculationStrategy {
  public readonly mode = 'resistant' as const;
  public calculate(rawDamage: number): number {
    return Math.max(0, Math.floor(rawDamage / 2));
  }
}

export class VulnerableDamageStrategy implements IDamageCalculationStrategy {
  public readonly mode = 'vulnerable' as const;
  public calculate(rawDamage: number): number {
    return Math.max(0, Math.floor(rawDamage * 2));
  }
}

export class ImmuneDamageStrategy implements IDamageCalculationStrategy {
  public readonly mode = 'immune' as const;
  public calculate(_rawDamage: number): number {
    return 0;
  }
}

export interface CombatHealthState {
  readonly currentHp: number;
  readonly maxHp: number;
  readonly tempHp: number;
}

export interface CombatHealthResult {
  readonly currentHp: number;
  readonly tempHp: number;
  readonly damageTaken: number;
  readonly tempHpAbsorbed: number;
  readonly droppedToZero: boolean;
  readonly concentrationDc: number | null;
}

export function applyCombatHealthChange(
  state: CombatHealthState,
  delta: number,
  strategy: IDamageCalculationStrategy = new NormalDamageStrategy()
): CombatHealthResult {
  if (delta >= 0) {
    const healedHp = Math.min(state.maxHp, state.currentHp + Math.floor(delta));
    return {
      currentHp: healedHp,
      tempHp: state.tempHp,
      damageTaken: 0,
      tempHpAbsorbed: 0,
      droppedToZero: false,
      concentrationDc: null,
    };
  }

  const effectiveDamage = strategy.calculate(Math.abs(delta));
  const tempHpAbsorbed = Math.min(state.tempHp, effectiveDamage);
  const remainingDamage = effectiveDamage - tempHpAbsorbed;
  const nextTempHp = state.tempHp - tempHpAbsorbed;
  const nextCurrentHp = Math.max(0, state.currentHp - remainingDamage);
  const droppedToZero = state.currentHp > 0 && nextCurrentHp === 0;
  const concentrationDc =
    effectiveDamage > 0 ? Math.max(10, Math.floor(effectiveDamage / 2)) : null;

  return {
    currentHp: nextCurrentHp,
    tempHp: nextTempHp,
    damageTaken: effectiveDamage,
    tempHpAbsorbed,
    droppedToZero,
    concentrationDc,
  };
}
