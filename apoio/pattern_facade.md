# 🏛️ Design Pattern — Facade (Fachada)

> **Classificação:** Padrão Estrutural (GoF)  
> **Objetivo:** Fornecer uma interface unificada para um conjunto de interfaces em um subsistema, tornando o subsistema mais fácil de usar.

---

## 🎯 Por Que Usar no Black Rose D&D?

A ficha de D&D possui múltiplos subsistemas interdependentes:
* **Sistema de Saúde:** PV atual, PV máximo, PV temporário, testes de morte.
* **Sistema de Magias:** Espaços de magia de círculos 1 a 9, cartas equipadas.
* **Sistema de Recursos:** Dados de vida, habilidades com usos diários.
* **Camada de Rede:** Endpoints REST `/characters/:id/long-rest`, `/characters/:id/spell-slots/:level`, etc.

Se um botão de interface no React tiver que chamar individualmente 4 ou 5 endpoints, tratar múltiplos erros de rede e sincronizar 5 estados locais, o componente se tornará frágil e acoplado. A **Fachada** esconde essa orquestração interna e oferece métodos de alto nível de 1 linha.

---

## 📐 Diagrama Estrutural

```text
+-----------------------+
|  React UI Components  | (HealthTracker, GrimoireSheet, TopBar)
+-----------------------+
           │
           ▼
+-------------------------------------------------------+
|              CharacterSheetFacade                     |
+-------------------------------------------------------+
| +performLongRest(id)                                  |
| +castSpellWithSlot(charId, spell, slots)              |
| +takeDamageWithShield(charId, amount)                 |
+-------------------------------------------------------+
      │                    │                    │
      ▼                    ▼                    ▼
+------------+      +---------------+      +----------------+
| api.ts     |      | dnd.ts utils  |      | storage/cache  |
+------------+      +---------------+      +----------------+
```

---

## 💻 Implementação Completa em TypeScript

```typescript
import { api } from '../services/api';
import type { EnrichedCharacter, SpellCard, SpellSlot } from '../types/dnd5e';

export interface CastSpellResult {
  success: boolean;
  message: string;
  updatedSlots: SpellSlot[];
}

export class CharacterSheetFacade {
  /**
   * Executa a rotina completa de Descanso Longo (Long Rest):
   * Restaura todos os PV, recupera dados de vida e reseta todos os slots de magia.
   */
  public static async executeLongRest(characterId: number): Promise<{
    character: EnrichedCharacter;
    notification: string;
  }> {
    const res = await api.longRest(characterId);

    return {
      character: res.character,
      notification: 'Descanso Longo concluído! PV, dados de vida e magias restaurados.',
    };
  }

  /**
   * Orquestra o lançamento de uma magia com dedução atômica de slots:
   */
  public static async castSpell(
    characterId: number,
    spell: SpellCard,
    currentSlots: SpellSlot[]
  ): Promise<CastSpellResult> {
    // 1. Truques (nível 0) não consomem slots
    if (spell.level === 0) {
      return {
        success: true,
        message: `${spell.name} (Truque) conjurado sem gasto de espaços!`,
        updatedSlots: currentSlots,
      };
    }

    // 2. Validação de slots disponíveis
    const slot = currentSlots.find((s) => s.slot_level === spell.level);
    if (!slot || slot.used_slots >= slot.max_slots) {
      return {
        success: false,
        message: `Não há espaços de ${spell.level}º círculo disponíveis!`,
        updatedSlots: currentSlots,
      };
    }

    // 3. Atualização no servidor
    const newUsed = slot.used_slots + 1;
    await api.updateSpellSlot(characterId, spell.level, { used_slots: newUsed });

    // 4. Retorno do estado computado para a interface
    const updatedSlots = currentSlots.map((s) =>
      s.slot_level === spell.level ? { ...s, used_slots: newUsed } : s
    );

    return {
      success: true,
      message: `${spell.name} lançada! Espaço de ${spell.level}º círculo consumido.`,
      updatedSlots,
    };
  }
}

// Uso simples e limpo no componente React:
const handleCast = async (spell: SpellCard) => {
  const result = await CharacterSheetFacade.castSpell(character.id, spell, spellSlots);
  if (result.success) {
    setSpellSlots(result.updatedSlots);
    alert(result.message);
  } else {
    alert(result.message);
  }
};
```

---

## ⚖️ Vantagens e Cuidados
* **Vantagem:** O componente React fica focado puramente na renderização e experiência do usuário.
* **Vantagem:** Mudanças no protocolo de rede ou formato de resposta da API são corrigidas apenas na Facade.
* **Cuidado:** Não transforme a Facade em uma classe monolítica que acumula regras de outros domínios não relacionados.
