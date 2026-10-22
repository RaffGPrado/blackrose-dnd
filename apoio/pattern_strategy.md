# ⚡ Design Pattern — Strategy (Estratégia de Cálculo)

> **Classificação:** Padrão Comportamental (GoF)  
> **Objetivo:** Definir uma família de algoritmos, encapsular cada um deles e torná-los intercambiáveis em tempo de execução sem alterar o código do cliente.

---

## 🎯 Por Que Usar no Black Rose D&D?

Em D&D 5e, a forma como o dano é computado varia drasticamente dependendo das resistências, fraquezas ou habilidades ativas do personagem:
1. **Dano Normal:** 100% do valor.
2. **Resistência:** Reduz o dano pela metade ($\lfloor \text{dano} / 2 \rfloor$).
3. **Vulnerabilidade:** Dobra o dano sofrido ($\text{dano} \times 2$).
4. **Imunidade:** 0 de dano.
5. **Fúria do Bárbaro:** Resistência automática e simultânea a danos Cortante, Perfurante e Concussão.

O **Strategy Pattern** permite aplicar o algoritmo de dano correto dinamicamente com base nas condições ativas.

---

## 📐 Diagrama Estrutural

```text
               +----------------------------------+
               |  <<interface>>                   |
               |  IDamageCalculationStrategy      |
               +----------------------------------+
               | +compute(rawDamage): number      |
               +----------------------------------+
                                ▲
        +-----------------------+-----------------------+
        |                       |                       |
+---------------------+ +---------------------+ +---------------------+
| NormalStrategy      | | ResistanceStrategy  | | ImmunityStrategy    |
+---------------------+ +---------------------+ +---------------------+
| compute(): damage   | | compute(): floor/2  | | compute(): 0        |
+---------------------+ +---------------------+ +---------------------+
                                ▲
                                │ usa
               +----------------------------------+
               |  DamageResolverContext           |
               +----------------------------------+
               | -strategy: IDamageStrategy       |
               | +setStrategy(strategy)           |
               | +resolve(incomingDamage)         |
               +----------------------------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
// 1. Interface da Estratégia
export interface IDamageCalculationStrategy {
  readonly label: string;
  compute(rawDamage: number): number;
}

// 2. Estratégias Concretas
export class NormalDamageStrategy implements IDamageCalculationStrategy {
  readonly label = 'Normal (100%)';
  compute(rawDamage: number): number {
    return Math.max(0, rawDamage);
  }
}

export class ResistanceDamageStrategy implements IDamageCalculationStrategy {
  readonly label = 'Resistente (50%)';
  compute(rawDamage: number): number {
    return Math.floor(Math.max(0, rawDamage) / 2);
  }
}

export class VulnerabilityDamageStrategy implements IDamageCalculationStrategy {
  readonly label = 'Vulnerável (200%)';
  compute(rawDamage: number): number {
    return Math.max(0, rawDamage) * 2;
  }
}

export class ImmunityDamageStrategy implements IDamageCalculationStrategy {
  readonly label = 'Imune (0%)';
  compute(): number {
    return 0;
  }
}

// 3. Contexto de Resolução de Dano
export class DamageResolverContext {
  private strategy: IDamageCalculationStrategy;

  constructor(initialStrategy: IDamageCalculationStrategy = new NormalDamageStrategy()) {
    this.strategy = initialStrategy;
  }

  public setStrategy(strategy: IDamageCalculationStrategy): void {
    this.strategy = strategy;
  }

  public resolve(incomingDamage: number): { finalDamage: number; strategyApplied: string } {
    const finalDamage = this.strategy.compute(incomingDamage);
    return {
      finalDamage,
      strategyApplied: this.strategy.label,
    };
  }
}

// 4. Exemplo Prático de Uso:
const resolver = new DamageResolverContext();

// Turno 1: Dano de Fogo normal (18)
console.log(resolver.resolve(18)); // { finalDamage: 18, strategyApplied: 'Normal (100%)' }

// Turno 2: Jogador toma poção de resistência a fogo
resolver.setStrategy(new ResistanceDamageStrategy());
console.log(resolver.resolve(18)); // { finalDamage: 9, strategyApplied: 'Resistente (50%)' }

// Turno 3: Feitiço de Imunidade total
resolver.setStrategy(new ImmunityDamageStrategy());
console.log(resolver.resolve(50)); // { finalDamage: 0, strategyApplied: 'Imune (0%)' }
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** Evita cadeias gigantescas de `if (isResistant) else if (isVulnerable)` no meio do código de combate.
* **Vantagem:** Facilita a criação de testes de unidade isolados para cada tipo de modificação de dano.
* **Cuidado:** Se a variação de cálculo for trivial e estática em um único ponto, uma função direta pode ser suficiente (respeitando o princípio KISS).
