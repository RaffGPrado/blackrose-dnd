# 🕹️ Design Pattern — Command (Comando com Undo/Redo)

> **Classificação:** Padrão Comportamental (GoF)  
> **Objetivo:** Encapsular uma solicitação como um objeto, permitindo parametrizar clientes com diferentes operações, enfileirar solicitações, manter logs de auditoria e implementar **operações reversíveis (*Undo / Redo*)**.

---

## 🎯 Por Que Usar no Black Rose D&D?

Em uma mesa presencial de RPG:
1. Um monstro ataca e o mestre diz: *"Tome 18 de dano cortante!"*.
2. O jogador clica no botão e perde 18 PV.
3. Dois segundos depois, outro jogador lembra: *"Espere! Eu conjurei Proteção contra Lâminas em você, você tem resistência a dano cortante! Eram só 9!"*.
4. Sem o **Command Pattern**, o jogador precisa recalcular de cabeça quantos PV tinha antes, descontando PV temporário e vida real.
5. Com o **Command Pattern**, basta tocar em **"Desfazer" (Undo)** e a ficha volta ao estado exato anterior.

---

## 📐 Diagrama Estrutural

```text
+------------------------+
|  <<interface>>         |
|  ICombatCommand        |
+------------------------+
| +execute(): Promise    |
| +undo(): Promise       |
+------------------------+
           ▲
           │
  +--------+------------------+
  |                           |
+-----------------------+   +-----------------------+
| ApplyDamageCommand    |   | HealCommand           |
+-----------------------+   +-----------------------+
| -previousHp           |   | -previousHp           |
| -previousTempHp       |   | +execute()            |
| +execute()            |   | +undo()               |
| +undo()               |   +-----------------------+
+-----------------------+
           ▲
           │
+------------------------------------+
|     CombatHistoryManager           |
+------------------------------------+
| -history: ICombatCommand[]         |
| -undone: ICombatCommand[]          |
| +executeCommand(cmd)               |
| +undoLast()                        |
| +redoLast()                        |
+------------------------------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
// 1. Interface Base do Comando
export interface ICombatCommand {
  readonly id: string;
  readonly description: string;
  readonly timestamp: Date;
  execute(): Promise<void>;
  undo(): Promise<void>;
}

export interface HpState {
  currentHp: number;
  tempHp: number;
}

// 2. Comando Concreto: Aplicar Dano (com absorção prévia de PV Temporário)
export class ApplyDamageCommand implements ICombatCommand {
  public readonly id = Math.random().toString(36).substring(2, 9);
  public readonly timestamp = new Date();
  public readonly description: string;

  private previousState: HpState = { currentHp: 0, tempHp: 0 };

  constructor(
    private getHpState: () => HpState,
    private setHpState: (state: HpState) => Promise<void>,
    private damageAmount: number,
    private damageType: string = 'Geral'
  ) {
    this.description = `Dano: -${damageAmount} PV (${damageType})`;
  }

  public async execute(): Promise<void> {
    const current = this.getHpState();
    this.previousState = { ...current };

    let remainingDamage = this.damageAmount;
    let nextTempHp = current.tempHp;
    let nextHp = current.currentHp;

    // PV Temporário absorve primeiro
    if (nextTempHp > 0) {
      if (nextTempHp >= remainingDamage) {
        nextTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= nextTempHp;
        nextTempHp = 0;
      }
    }

    nextHp = Math.max(0, nextHp - remainingDamage);
    await this.setHpState({ currentHp: nextHp, tempHp: nextTempHp });
  }

  public async undo(): Promise<void> {
    // Restaura fielmente os pontos anteriores
    await this.setHpState(this.previousState);
  }
}

// 3. Comando Concreto: Aplicar Cura
export class HealCommand implements ICombatCommand {
  public readonly id = Math.random().toString(36).substring(2, 9);
  public readonly timestamp = new Date();
  public readonly description: string;

  private previousState: HpState = { currentHp: 0, tempHp: 0 };

  constructor(
    private getHpState: () => HpState,
    private setHpState: (state: HpState) => Promise<void>,
    private healAmount: number,
    private maxHp: number
  ) {
    this.description = `Cura: +${healAmount} PV`;
  }

  public async execute(): Promise<void> {
    const current = this.getHpState();
    this.previousState = { ...current };

    const nextHp = Math.min(this.maxHp, current.currentHp + this.healAmount);
    await this.setHpState({ currentHp: nextHp, tempHp: current.tempHp });
  }

  public async undo(): Promise<void> {
    await this.setHpState(this.previousState);
  }
}

// 4. Invocador e Histórico (Invoker / History Manager)
export class CombatActionHistory {
  private historyStack: ICombatCommand[] = [];
  private redoStack: ICombatCommand[] = [];

  public async execute(command: ICombatCommand): Promise<void> {
    await command.execute();
    this.historyStack.push(command);
    this.redoStack = []; // Nova ação invalida histórico de redo
  }

  public async undo(): Promise<ICombatCommand | null> {
    const cmd = this.historyStack.pop();
    if (!cmd) return null;

    await cmd.undo();
    this.redoStack.push(cmd);
    return cmd;
  }

  public async redo(): Promise<ICombatCommand | null> {
    const cmd = this.redoStack.pop();
    if (!cmd) return null;

    await cmd.execute();
    this.historyStack.push(cmd);
    return cmd;
  }

  public getHistory(): readonly ICombatCommand[] {
    return this.historyStack;
  }

  public canUndo(): boolean {
    return this.historyStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** Permite aos jogadores desfazer toques acidentais em botões de dano durante o calor do combate.
* **Vantagem:** Gera automaticamente um *Log de Combate* com hora e descrição de cada ação tomada.
* **Cuidado:** Limite a profundidade da pilha de histórico (ex.: últimas 20 ações) para não reter estados obsoletos em memória por tempo indefinido.
