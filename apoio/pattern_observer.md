# 🔔 Design Pattern — Observer (Eventos de Combate & Reatividade)

> **Classificação:** Padrão Comportamental (GoF)  
> **Objetivo:** Definir uma dependência um-para-muitos entre objetos de modo que, quando um objeto muda de estado, todos os seus dependentes são notificados e atualizados automaticamente.

---

## 🎯 Por Que Usar no Black Rose D&D?

Durante o combate de RPG de mesa, certas transições de estado geram reações em cadeia:
1. **PV chega a 0:** O personagem cai inconsciente ➔ Deve ativar imediatamente os **Testes contra a Morte (*Death Saves*)** e cancelar magias de concentração ativas.
2. **Descanso Longo Concluído:** Todos os componentes abertos (Health Tracker, Magias, Recursos) devem sincronizar seus contadores.
3. **Rolagem de D20:** Quando um ataque ou magia é rolado, a gaveta de histórico de dados deve exibir a animação sem que os botões de ação precisem conhecer a gaveta diretamente.

O **Observer Pattern** (ou Event Bus tipado) desacopla os emissores de eventos dos seus ouvintes.

---

## 📐 Diagrama Estrutural

```text
+-----------------------+               +-----------------------+
|   HealthTracker       |               |    GrimoireSheet      |
|  (Emite 'HP_ZERO')    |               |  (Emite 'SPELL_CAST') |
+-----------------------+               +-----------------------+
           │                                        │
           ▼                                        ▼
+---------------------------------------------------------------+
|                 CombatEventBus (Observer Hub)                 |
+---------------------------------------------------------------+
| +on(event, listener)                                          |
| +emit(event, payload)                                         |
+---------------------------------------------------------------+
           │                                        │
           ▼                                        ▼
+-----------------------+               +-----------------------+
|    DeathSavesCard     |               |    DiceRollerModal    |
| (Reage a 'HP_ZERO')   |               | (Reage a 'SPELL_CAST')|
+-----------------------+               +-----------------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
// 1. Tipagem Estrita dos Eventos do Jogo
export interface GameEventsMap {
  'CHARACTER_HP_CHANGED': { currentHp: number; maxHp: number; delta: number };
  'CHARACTER_UNCONSCIOUS': { characterId: number; message: string };
  'SPELL_SLOT_EXPENDED': { slotLevel: number; remaining: number };
  'DICE_ROLLED': { diceSides: number; result: number; modifier: number; total: number; isCrit: boolean };
}

export type GameEventKey = keyof GameEventsMap;
export type GameEventListener<K extends GameEventKey> = (payload: GameEventsMap[K]) => void;

// 2. Event Bus Tipado Seguro
export class GameEventBus {
  private static instance: GameEventBus;
  private listeners: { [K in GameEventKey]?: Set<GameEventListener<K>> } = {};

  private constructor() {}

  public static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  public on<K extends GameEventKey>(event: K, listener: GameEventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as any;
    }
    (this.listeners[event] as Set<GameEventListener<K>>).add(listener);

    // Retorna função de desinscrição para ser usada no cleanup de useEffect()
    return () => {
      (this.listeners[event] as Set<GameEventListener<K>>)?.delete(listener);
    };
  }

  public emit<K extends GameEventKey>(event: K, payload: GameEventsMap[K]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`Erro ao processar evento [${event}]:`, err);
        }
      });
    }
  }
}

// 3. Exemplo de Uso no React:
// No componente HealthTracker.tsx quando PV chega a zero:
if (newHp === 0) {
  GameEventBus.getInstance().emit('CHARACTER_UNCONSCIOUS', {
    characterId: character.id,
    message: `${character.name} caiu inconsciente! Testes contra a morte iniciados.`,
  });
}

// No componente DeathSavesCard.tsx (Ouvinte):
useEffect(() => {
  const unsubscribe = GameEventBus.getInstance().on('CHARACTER_UNCONSCIOUS', (event) => {
    console.warn(event.message);
    // Ativa alerta visual ou rola para a seção de testes de morte
  });

  return () => unsubscribe();
}, []);
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** Componentes que não têm relação direta de pai-filho podem reagir a eventos globais sem "prop drilling".
* **Vantagem:** Totalmente tipado com TypeScript, impossibilitando emitir ou escutar eventos com nomes ou payloads errados.
* **Cuidado:** Sempre retorne e invoque a função de desinscrição (`unsubscribe`) dentro de `useEffect` no React para evitar vazamentos de memória (*memory leaks*).
