# 🏭 Design Pattern — Abstract Factory

> **Classificação:** Padrão Criacional (GoF)  
> **Objetivo:** Fornecer uma interface para criar famílias de objetos relacionados ou dependentes sem especificar suas classes concretas.

---

## 🎯 Por Que Usar no Black Rose D&D?

Ao criar um personagem em D&D 5e (nível 1), as classes pertencem a famílias conceituais distintas:
1. **Combatentes Marciais (Bárbaro, Guerreiro, Ladino):**
   * Armas físicas corpo a corpo e à distância.
   * Recursos de fôlego/fúria.
   * Zero espaços de magia.
2. **Conjuradores Plenos (Mago, Clérigo, Bruxo):**
   * Foco de conjuração / armas leves (adaga, cajado).
   * Espaços de magia de 1º círculo configurados.
   * Livro de magias ou truques preparados.

A **Abstract Factory** permite gerar conjuntos consistentes de equipamentos, habilidades e slots iniciais de acordo com o arquétipo do herói.

---

## 📐 Diagrama Estrutural

```text
               +-----------------------------+
               |  <<interface>>              |
               |  CharacterKitFactory        |
               +-----------------------------+
               | +createStartingAttacks()    |
               | +createStartingFeatures()   |
               | +createStartingSpellSlots() |
               +-----------------------------+
                              ▲
              +---------------+---------------+
              |                               |
+-----------------------------+ +-----------------------------+
| MartialKitFactory           | | SpellcasterKitFactory       |
+-----------------------------+ +-----------------------------+
| +createStartingAttacks()    | | +createStartingAttacks()    |
| +createStartingFeatures()   | | +createStartingFeatures()   |
| +createStartingSpellSlots() | | +createStartingSpellSlots() |
+-----------------------------+ +-----------------------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
import type { AttackItem, ClassFeature, SpellSlot } from '../types/dnd5e';

// 1. Interfaces dos Produtos Relacionados
export type NewAttackData = Omit<AttackItem, 'id' | 'character_id'>;
export type NewFeatureData = Omit<ClassFeature, 'id' | 'character_id'>;

export interface CharacterClassKit {
  attacks: NewAttackData[];
  features: NewFeatureData[];
  spellSlots: SpellSlot[];
}

// 2. A Fábrica Abstrata
export interface ICharacterKitFactory {
  createClassKit(): CharacterClassKit;
}

// 3. Fábrica Concreta A: Combatente Marcial
export class MartialKitFactory implements ICharacterKitFactory {
  createClassKit(): CharacterClassKit {
    return {
      attacks: [
        { name: 'Espada Longa', bonus: '+5', damage_type: '1d8+3 Cortante' },
        { name: 'Arco Curto', bonus: '+4', damage_type: '1d6+2 Perfurante' },
      ],
      features: [
        {
          name: 'Retomar o Fôlego',
          description: 'Recupera 1d10 + nível em PV com uma Ação Bônus.',
          uses_max: 1,
          uses_current: 1,
        },
      ],
      spellSlots: [], // Sem slots de magia
    };
  }
}

// 4. Fábrica Concreta B: Conjurador Pleno
export class SpellcasterKitFactory implements ICharacterKitFactory {
  createClassKit(): CharacterClassKit {
    return {
      attacks: [
        { name: 'Adaga de Prata', bonus: '+4', damage_type: '1d4+2 Perfurante' },
        { name: 'Cajado Arcano', bonus: '+3', damage_type: '1d6 Concussão' },
      ],
      features: [
        {
          name: 'Recuperação Arcana',
          description: 'Recupera espaços de magia gastos durante um descanso curto.',
          uses_max: 1,
          uses_current: 1,
        },
      ],
      spellSlots: [
        { slot_level: 1, max_slots: 2, used_slots: 0 },
      ],
    };
  }
}

// 5. Código Cliente
export function buildStartingHeroKit(archetype: 'martial' | 'caster'): CharacterClassKit {
  const factory: ICharacterKitFactory =
    archetype === 'martial' ? new MartialKitFactory() : new SpellcasterKitFactory();

  return factory.createClassKit();
}
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** Garante que armas marciais pesadas não sejam dadas por engano com pacotes de slots arcanos inválidos.
* **Vantagem:** Facilita a introdução de um terceiro arquétipo (ex.: `HalfCasterKitFactory` para Paladino/Ranger) sem alterar os consumidores.
* **Cuidado:** Não utilize se o sistema tiver poucas variações ou se a criação de kits for puramente orientada a tabelas estáticas no banco de dados.
