# 🎨 Catálogo de Design Patterns Aplicados (D&D 5e & TypeScript)

Este documento detalha a implementação de padrões de projeto (*Design Patterns*) modernos em **TypeScript**, aplicados aos desafios específicos do **Black Rose D&D 5e**.

---

## 1. Abstract Factory (Fábrica Abstrata)

### 🎯 Intenção:
Fornecer uma interface para criar famílias de objetos relacionados ou dependentes sem especificar suas classes concretas.

### 🎲 Contexto em D&D:
Ao criar um personagem novo (Nível 1), classes diferentes requerem configurações completamente distintas de:
* Armas iniciais
* Espaços de magia
* Recursos de classe (Fúria, Slots, Ki)
* Atributo chave de conjuração

### 💻 Implementação TypeScript:

```typescript
import { AttackItem, ClassFeature, SpellSlot } from '../types/dnd5e';

// Produto Abstrato
export interface CharacterClassKit {
  startingAttacks: Omit<AttackItem, 'id' | 'character_id'>[];
  startingFeatures: Omit<ClassFeature, 'id' | 'character_id'>[];
  startingSpellSlots: SpellSlot[];
}

// Fábrica Abstrata
export interface CharacterKitFactory {
  createClassKit(): CharacterClassKit;
}

// Fábrica Concreta 1: Combatente Marcial (Bárbaro / Guerreiro)
export class MartialKitFactory implements CharacterKitFactory {
  createClassKit(): CharacterClassKit {
    return {
      startingAttacks: [
        { name: 'Espada Grande', bonus: '+5', damage_type: '2d6+3 Cortante' },
        { name: 'Javelim', bonus: '+5', damage_type: '1d6+3 Perfurante' },
      ],
      startingFeatures: [
        { name: 'Fúria', description: 'Vantagem em testes de FOR, +2 dano e resistência.', uses_max: 2, uses_current: 2 },
      ],
      startingSpellSlots: [], // Marciais não iniciam com slots
    };
  }
}

// Fábrica Concreta 2: Conjurador Pleno (Mago / Feiticeiro)
export class SpellcasterKitFactory implements CharacterKitFactory {
  createClassKit(): CharacterClassKit {
    return {
      startingAttacks: [
        { name: 'Adaga', bonus: '+4', damage_type: '1d4+2 Perfurante' },
        { name: 'Dardo Mágico', bonus: '+5', damage_type: '1d10 Fogo' },
      ],
      startingFeatures: [
        { name: 'Recuperação Arcana', description: 'Recupera slots de magia em descanso curto.', uses_max: 1, uses_current: 1 },
      ],
      startingSpellSlots: [
        { slot_level: 1, max_slots: 2, used_slots: 0 },
      ],
    };
  }
}

// Uso no Cliente (CreateCharacter):
export function createCharacterKit(classType: 'martial' | 'caster'): CharacterClassKit {
  const factory: CharacterKitFactory =
    classType === 'martial' ? new MartialKitFactory() : new SpellcasterKitFactory();

  return factory.createClassKit();
}
```

---

## 2. Facade (Fachada)

### 🎯 Intenção:
Fornecer uma interface unificada e simplificada para um conjunto de interfaces em um subsistema complexo, reduzindo o acoplamento do cliente.

### 🎲 Contexto em D&D:
Quando o jogador clica em "Descanso Longo" ou "Lançar Magia", o frontend precisaria executar múltiplas requisições (atualizar HP, restaurar dados de vida, redefinir usos de habilidades, zerar slots de magia gastos e registrar no log). O componente React não deve conhecer todas essas rotas; ele conversa com a **Fachada**.

### 💻 Implementação TypeScript:

```typescript
import { api } from '../services/api';
import { EnrichedCharacter, SpellCard, SpellSlot } from '../types/dnd5e';

export class CharacterSheetFacade {
  /**
   * Executa a rotina completa de Descanso Longo:
   * 1. Chama endpoint de descanso no servidor.
   * 2. Recarrega dados consolidados.
   * 3. Garante retorno de estado pronto para a UI.
   */
  public static async performLongRest(characterId: number): Promise<{
    character: EnrichedCharacter;
    message: string;
  }> {
    const res = await api.longRest(characterId);
    return {
      character: res.character,
      message: 'Descanso longo concluído: PV, Dados de Vida e Espaços de Magia restaurados!',
    };
  }

  /**
   * Lança uma magia: valida slot disponível, desconta o slot e devolve o estado atualizado.
   */
  public static async castSpell(
    characterId: number,
    spell: SpellCard,
    currentSlots: SpellSlot[]
  ): Promise<{ updatedSlots: SpellSlot[]; success: boolean; error?: string }> {
    if (spell.level === 0) {
      // Truque não gasta slot!
      return { updatedSlots: currentSlots, success: true };
    }

    const slot = currentSlots.find((s) => s.slot_level === spell.level);
    if (!slot || slot.used_slots >= slot.max_slots) {
      return { updatedSlots: currentSlots, success: false, error: `Sem espaços de ${spell.level}º círculo disponíveis!` };
    }

    const newUsed = slot.used_slots + 1;
    await api.updateSpellSlot(characterId, spell.level, { used_slots: newUsed });

    const updatedSlots = currentSlots.map((s) =>
      s.slot_level === spell.level ? { ...s, used_slots: newUsed } : s
    );

    return { updatedSlots, success: true };
  }
}
```

---

## 3. Singleton with Proxy (Instância Única com Interceptação)

### 🎯 Intenção:
Garantir que uma classe tenha apenas uma instância, combinada com o padrão **Proxy** para interceptar chamadas de método de forma transparente (logging, telemetria, medição de performance e validação de segurança) sem poluir a implementação da classe.

### 🎲 Contexto em D&D:
No backend ou em serviços de estado centralizados, queremos apenas uma instância do gerenciador de banco de dados (`DatabaseService`), mas precisamos que todas as execuções de SQL sejam cronometradas e registradas contra consultas lentas (*slow queries*).

### 💻 Implementação TypeScript:

```typescript
export interface IDatabaseService {
  query<T>(sql: string, params?: any[]): T[];
  execute(sql: string, params?: any[]): { changes: number };
}

// Classe Concreta (Sem poluição de logs externos)
class DatabaseServiceCore implements IDatabaseService {
  public query<T>(sql: string, params: any[] = []): T[] {
    // Exemplo de execução real no SQLite
    return [] as T[];
  }

  public execute(sql: string, params: any[] = []): { changes: number } {
    return { changes: 1 };
  }
}

// Singleton Manager com Proxy Handler
export class DatabaseManager {
  private static instance: IDatabaseService | null = null;

  private constructor() {}

  public static getInstance(): IDatabaseService {
    if (!DatabaseManager.instance) {
      const core = new DatabaseServiceCore();

      // Envolve a instância única em um Proxy interceptador
      DatabaseManager.instance = new Proxy(core, {
        get(target: any, propKey: string | symbol, receiver: any) {
          const originalMethod = target[propKey];

          if (typeof originalMethod === 'function') {
            return function (...args: any[]) {
              const start = performance.now();
              console.log(`📡 [SQL PROXY] Invocando método: ${String(propKey)} | Query: ${args[0]}`);

              try {
                const result = originalMethod.apply(target, args);
                const duration = (performance.now() - start).toFixed(2);
                console.log(`⏱️ [SQL PROXY] ${String(propKey)} concluído em ${duration}ms`);
                return result;
              } catch (error) {
                console.error(`❌ [SQL PROXY ERROR] Falha no método ${String(propKey)}:`, error);
                throw error;
              }
            };
          }

          return Reflect.get(target, propKey, receiver);
        },
      });
    }

    return DatabaseManager.instance;
  }
}

// Uso:
const db = DatabaseManager.getInstance();
db.query('SELECT * FROM spells WHERE level = ?', [3]);
```

---

## 4. Command Pattern (Padrão de Comando)

### 🎯 Intenção:
Encapsular uma solicitação como um objeto, permitindo parametrizar clientes com diferentes solicitações, enfileirar pedidos, manter histórico e **suportar operações reversíveis (*Undo/Redo*)**.

### 🎲 Contexto em D&D:
Durante o combate em mesa:
* O mestre declara: *"Você tomou 14 de dano de fogo!"* ➔ Jogador aplica `-14 PV`.
* Em seguida o mestre corrige: *"Espere, você tinha resistência a fogo, eram só 7 de dano!"*.
* Com o **Command Pattern**, o jogador pode simplesmente tocar em **Desfazer (Undo)** para reverter a última alteração com precisão cirúrgica.

### 💻 Implementação TypeScript:

```typescript
// Interface do Comando Reversível
export interface ICombatCommand {
  name: string;
  timestamp: Date;
  execute(): Promise<void>;
  undo(): Promise<void>;
}

// Comando Concreto 1: Aplicar Dano com PV Temporário
export class ApplyDamageCommand implements ICombatCommand {
  public name = 'Aplicar Dano';
  public timestamp = new Date();
  private previousHp: number = 0;
  private previousTempHp: number = 0;

  constructor(
    private getHpState: () => { hp: number; tempHp: number },
    private setHpState: (hp: number, tempHp: number) => Promise<void>,
    private damageAmount: number
  ) {}

  public async execute(): Promise<void> {
    const { hp, tempHp } = this.getHpState();
    this.previousHp = hp;
    this.previousTempHp = tempHp;

    let remainingDamage = this.damageAmount;
    let newTempHp = tempHp;
    let newHp = hp;

    if (newTempHp > 0) {
      if (newTempHp >= remainingDamage) {
        newTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newTempHp;
        newTempHp = 0;
      }
    }

    newHp = Math.max(0, newHp - remainingDamage);
    await this.setHpState(newHp, newTempHp);
  }

  public async undo(): Promise<void> {
    // Reverte exatamente para os valores anteriores
    await this.setHpState(this.previousHp, this.previousTempHp);
  }
}

// Invocador e Gerenciador de Histórico (Undo/Redo)
export class CombatHistoryManager {
  private history: ICombatCommand[] = [];
  private undone: ICombatCommand[] = [];

  public async executeCommand(command: ICombatCommand): Promise<void> {
    await command.execute();
    this.history.push(command);
    this.undone = []; // Limpa fila de redo ao realizar nova ação
  }

  public async undoLast(): Promise<ICombatCommand | null> {
    const command = this.history.pop();
    if (!command) return null;

    await command.undo();
    this.undone.push(command);
    return command;
  }

  public async redoLast(): Promise<ICombatCommand | null> {
    const command = this.undone.pop();
    if (!command) return null;

    await command.execute();
    this.history.push(command);
    return command;
  }

  public getHistory(): readonly ICombatCommand[] {
    return this.history;
  }
}
```

---

## 5. Strategy Pattern (Estratégia)

### 🎯 Intenção:
Definir uma família de algoritmos, encapsular cada um deles e torná-los intercambiáveis. O padrão Strategy permite que o algoritmo varie independentemente dos clientes que o utilizam.

### 🎲 Contexto em D&D:
Regras de dano em D&D 5e dependem de condições:
* Dano normal: 100%
* Resistência: 50% (arredondado para baixo)
* Vulnerabilidade: 200%
* Imunidade: 0%

### 💻 Implementação TypeScript:

```typescript
export interface DamageCalculationStrategy {
  calculate(incomingDamage: number): number;
}

export class NormalDamageStrategy implements DamageCalculationStrategy {
  calculate(damage: number): number {
    return Math.max(0, damage);
  }
}

export class ResistanceDamageStrategy implements DamageCalculationStrategy {
  calculate(damage: number): number {
    return Math.floor(Math.max(0, damage) / 2);
  }
}

export class VulnerabilityDamageStrategy implements DamageCalculationStrategy {
  calculate(damage: number): number {
    return Math.max(0, damage) * 2;
  }
}

export class ImmunityDamageStrategy implements DamageCalculationStrategy {
  calculate(): number {
    return 0;
  }
}

// Contexto
export class DamageProcessor {
  constructor(private strategy: DamageCalculationStrategy) {}

  public setStrategy(strategy: DamageCalculationStrategy) {
    this.strategy = strategy;
  }

  public processDamage(rawDamage: number): number {
    return this.strategy.calculate(rawDamage);
  }
}
```
