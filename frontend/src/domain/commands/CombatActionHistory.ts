import {
  applyCombatHealthChange,
  NormalDamageStrategy,
  type CombatHealthState,
  type IDamageCalculationStrategy,
} from '../combat/DamageStrategy';

export interface ICombatCommand {
  readonly description: string;
  readonly timestamp: number;
  execute(state: CombatHealthState): CombatHealthState;
  undo(state: CombatHealthState): CombatHealthState;
}

export class ApplyDamageCommand implements ICombatCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private previousState: CombatHealthState | null = null;

  constructor(
    private readonly rawDamage: number,
    private readonly strategy: IDamageCalculationStrategy = new NormalDamageStrategy()
  ) {
    this.timestamp = Date.now();
    this.description = `Dano (${this.strategy.mode}): -${Math.abs(rawDamage)} PV`;
  }

  public execute(state: CombatHealthState): CombatHealthState {
    this.previousState = { ...state };
    const res = applyCombatHealthChange(state, -Math.abs(this.rawDamage), this.strategy);
    return {
      currentHp: res.currentHp,
      maxHp: state.maxHp,
      tempHp: res.tempHp,
    };
  }

  public undo(state: CombatHealthState): CombatHealthState {
    return this.previousState ? { ...this.previousState } : state;
  }
}

export class HealCommand implements ICombatCommand {
  public readonly description: string;
  public readonly timestamp: number;
  private previousState: CombatHealthState | null = null;

  constructor(private readonly amount: number) {
    this.timestamp = Date.now();
    this.description = `Cura: +${Math.abs(amount)} PV`;
  }

  public execute(state: CombatHealthState): CombatHealthState {
    this.previousState = { ...state };
    const res = applyCombatHealthChange(state, Math.abs(this.amount));
    return {
      currentHp: res.currentHp,
      maxHp: state.maxHp,
      tempHp: res.tempHp,
    };
  }

  public undo(state: CombatHealthState): CombatHealthState {
    return this.previousState ? { ...this.previousState } : state;
  }
}

export class CombatActionHistory {
  private readonly undoStack: ICombatCommand[] = [];
  private readonly redoStack: ICombatCommand[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory = 20) {
    this.maxHistory = maxHistory;
  }

  public executeCommand(command: ICombatCommand, state: CombatHealthState): CombatHealthState {
    const nextState = command.execute(state);
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack.length = 0;
    return nextState;
  }

  public undo(state: CombatHealthState): CombatHealthState | null {
    const command = this.undoStack.pop();
    if (!command) return null;
    this.redoStack.push(command);
    return command.undo(state);
  }

  public redo(state: CombatHealthState): CombatHealthState | null {
    const command = this.redoStack.pop();
    if (!command) return null;
    this.undoStack.push(command);
    return command.execute(state);
  }

  public getHistory(): ReadonlyArray<ICombatCommand> {
    return this.undoStack;
  }

  public clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}

export const combatActionHistory = new CombatActionHistory();
