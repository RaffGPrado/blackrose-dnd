# ✂️ SOLID 4 — Interface Segregation Principle (ISP)

> *"Clients should not be forced to depend upon interfaces that they do not use."*  
> — Robert C. Martin (Uncle Bob)

---

## 🎯 Conceito Central

O **Princípio da Segregação de Interfaces** preconiza que é preferível criar muitas interfaces pequenas, coesas e especializadas do que uma única interface gigantesca (*Fat Interface*). Clientes de uma interface nunca devem ser obrigados a conhecer ou implementar métodos que não têm relevância para seu funcionamento.

---

## 🎲 Aplicação no Domínio de D&D 5e

Na aplicação de ficha de RPG:
* Um componente de **Ajuste de PV** só precisa saber o valor atual, máximo e temporário de vida.
* Um componente de **Cartas de Magia** só precisa das cartas equipadas e dos círculos de magia.
* Se passarmos o objeto completo `CharacterDetailResponse` com 40 propriedades para um simples botão ou card secundário, criamos dependências desnecessárias e acoplamento rígido.

---

## ❌ Anti-Padrão (Violação do ISP)

### Interface "Gorda" / Monolítica:

```typescript
// ❌ Violando ISP: Interface inchada que força dependências espúrias
export interface ICharacterSheetViewProps {
  // Combate
  currentHp: number;
  maxHp: number;
  tempHp: number;
  armorClass: number;
  // Magias
  spells: SpellCard[];
  spellSlots: SpellSlot[];
  spellSaveDc: number;
  // Mochila
  items: InventoryItem[];
  coins: CoinPouch;
  // Biografia
  personalityTraits: string;
  ideals: string;
  flaws: string;
  // Métodos de ação
  onCastSpell: (id: number) => void;
  onTakeDamage: (amount: number) => void;
  onAddItem: (item: InventoryItem) => void;
  onSaveBio: () => void;
}

// Um componente simples de "Badge de CA" (Armor Class) é obrigado a receber essa interface:
export const ArmorClassBadge: React.FC<ICharacterSheetViewProps> = (props) => {
  // Usa apenas armorClass, mas depende de dezenas de outros campos irrelevantes!
  return <div>CA: {props.armorClass}</div>;
};
```

*Problema:* Qualquer alteração nas propriedades de biografia ou magias forçará a reavaliação ou até quebra de tipagem do componente de CA.

---

## ✅ Boa Prática (Solução com ISP em TypeScript)

Segregar em interfaces pontuais e granulares por responsabilidade funcional:

```typescript
// Interfaces focadas e autônomas:

export interface IHealthTrackable {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onAdjustHp: (delta: number) => void;
  onAdjustTempHp: (delta: number) => void;
}

export interface ICombatDefenses {
  armorClass: number;
  speed: number;
  initiativeBonus: number;
}

export interface ISpellcasterStats {
  spellSaveDc: number;
  spellAttackBonus: string;
  spellcastingAbility: AbilityKey;
}

// O componente consome apenas a fatia necessária:
export const ArmorClassBadge: React.FC<Pick<ICombatDefenses, 'armorClass'>> = ({ armorClass }) => {
  return (
    <div className="flex items-center gap-1 text-blue-400 font-black text-base">
      <Shield className="w-4 h-4" />
      <span>{armorClass}</span>
    </div>
  );
};

export const HealthTracker: React.FC<IHealthTrackable> = ({
  currentHp,
  maxHp,
  tempHp,
  onAdjustHp,
  onAdjustTempHp,
}) => {
  // Totalmente desacoplado de magias, inventário e biografia!
  return (
    <div>{/* UI de Pontos de Vida */}</div>
  );
};
```

---

## 📋 Checklist de Revisão ISP
- [ ] Componentes recebem `props` que nunca utilizam?
- [ ] As interfaces do domínio são pequenas o suficiente para serem reutilizadas em outros contextos (ex.: fichas de monstros/NPCs)?
- [ ] O uso de utilitários como `Pick<T, K>`, `Omit<T, K>` ou interfaces menores evita objetos inflados?
