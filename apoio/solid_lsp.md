# ⚖️ SOLID 3 — Liskov Substitution Principle (LSP)

> *"Subtypes must be substitutable for their base types without altering the correctness of the program."*  
> — Barbara Liskov

---

## 🎯 Conceito Central

O **Princípio da Substituição de Liskov** afirma que se uma função espera um tipo base `T`, ela deve funcionar perfeitamente com qualquer subtipo ou implementação derivada de `T`, sem quebrar premissas, lançar exceções inesperadas ou exigir checagens de tipo em tempo de execução (`instanceof` ou `typeof`).

---

## 🎲 Aplicação no Domínio de D&D 5e

Considere o conceito de uma **Ação em Combate** ou **Magia**:
* Um personagem pode realizar uma `WeaponAttack` (Ataque com Arma).
* Um conjurador pode lançar um `Cantrip` (Truque - Magia nível 0 que não gasta espaços).
* Um mago pode lançar uma `LeveledSpell` (Magia com custo de espaço de magia).

Todas são ações que podem ser executadas no turno do jogador. O invocador de ações não deve quebrar ao tentar descontar espaços de um Truque.

---

## ❌ Anti-Padrão (Violação do LSP)

### Subclasse ou implementação que quebra o contrato base:

```typescript
// ❌ Violando LSP:
interface SpellAction {
  name: string;
  cast(character: CharacterCore, slotLevel: number): void;
}

export class LeveledSpellAction implements SpellAction {
  name = 'Bola de Fogo';
  cast(character: CharacterCore, slotLevel: number): void {
    if (slotLevel < 3) throw new Error('Slot insuficiente!');
    // Consome o slot...
  }
}

export class CantripAction implements SpellAction {
  name = 'Raio de Fogo';
  cast(character: CharacterCore, slotLevel: number): void {
    // Truque não tem slot! Se o chamador passar slotLevel 0 ou esperar validação, quebra a premissa:
    throw new Error('Truques não usam slots! Não chame este método assim!');
  }
}
```

*Problema:* O chamador que itera sobre a lista de magias e invoca `.cast(...)` precisa verificar com `if (spell instanceof CantripAction)` para não quebrar a aplicação com uma exceção.

---

## ✅ Boa Prática (Solução com LSP em TypeScript)

Projetar o contrato base para expressar o custo de forma segura e polimórfica:

```typescript
export interface ICastResult {
  success: boolean;
  slotsExpended: number;
  slotLevelUsed: number;
  effectDescription: string;
}

export interface ICombatAction {
  readonly name: string;
  readonly actionType: 'action' | 'bonus_action' | 'reaction';
  canExecute(character: EnrichedCharacter, availableSlots: SpellSlot[]): boolean;
  execute(character: EnrichedCharacter, availableSlots: SpellSlot[]): Promise<ICastResult>;
}

// Subtipo 1: Magia de Círculo Alto (Consome Slot)
export class LeveledSpell implements ICombatAction {
  constructor(
    public readonly name: string,
    public readonly level: number,
    public readonly actionType: 'action' = 'action'
  ) {}

  canExecute(character: EnrichedCharacter, availableSlots: SpellSlot[]): boolean {
    const slot = availableSlots.find((s) => s.slot_level === this.level);
    return !!slot && slot.used_slots < slot.max_slots;
  }

  async execute(character: EnrichedCharacter, availableSlots: SpellSlot[]): Promise<ICastResult> {
    if (!this.canExecute(character, availableSlots)) {
      return { success: false, slotsExpended: 0, slotLevelUsed: this.level, effectDescription: 'Sem slots disponíveis' };
    }

    return {
      success: true,
      slotsExpended: 1,
      slotLevelUsed: this.level,
      effectDescription: `${this.name} lançada consumindo 1 espaço de ${this.level}º círculo.`,
    };
  }
}

// Subtipo 2: Truque (Cantrip - Custo Zero)
export class CantripSpell implements ICombatAction {
  constructor(
    public readonly name: string,
    public readonly actionType: 'action' = 'action'
  ) {}

  canExecute(): boolean {
    return true; // Truques sempre podem ser conjurados à vontade
  }

  async execute(): Promise<ICastResult> {
    return {
      success: true,
      slotsExpended: 0,
      slotLevelUsed: 0,
      effectDescription: `${this.name} conjurada à vontade sem custo de slot.`,
    };
  }
}

// O orquestrador trata ambos de forma 100% intercambiável:
export async function executeTurnAction(action: ICombatAction, char: EnrichedCharacter, slots: SpellSlot[]) {
  if (action.canExecute(char, slots)) {
    return await action.execute(char, slots); // Funciona tanto para Truque quanto para Magia Nível 9!
  }
}
```

---

## 📋 Checklist de Revisão LSP
- [ ] Implementações derivadas lançam exceções do tipo "Método não suportado"?
- [ ] O código cliente precisa fazer `if (item.type === '...')` antes de chamar métodos comuns?
- [ ] Todos os subtipos respeitam as pré-condições e pós-condições da interface pai?
