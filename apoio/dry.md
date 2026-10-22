# 🔄 DRY — Don't Repeat Yourself

> *"Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."*  
> — Andy Hunt & Dave Thomas, *The Pragmatic Programmer*

---

## 🎯 Conceito Central

O princípio **DRY** (Não se Repita) não é meramente sobre evitar linhas de código duplicadas visualmente. O foco é a **duplicação de conhecimento e regras de negócio**. Quando uma mesma lógica de domínio existe em mais de um lugar, qualquer evolução ou correção exige sincronização manual em múltiplos arquivos, criando vetores de bugs silenciosos.

---

## 🎲 Aplicação no Domínio de D&D 5e

Em D&D 5ª Edição, várias regras matemáticas são universais:
1. **Modificador de Habilidade:** $\lfloor(\text{valor} - 10) / 2\rfloor$
2. **Bônus de Proficiência:** $\lfloor(\text{nível} - 1) / 4\rfloor + 2$
3. **CD de Magia (Spell Save DC):** $8 + \text{proficiência} + \text{modificador de atributo}$
4. **Bônus de Ataque Mágico:** $\text{proficiência} + \text{modificador de atributo}$

---

## ❌ Anti-Padrão (Violação do DRY)

### Cálculos repetidos em múltiplos componentes e rotas:

```typescript
// No componente HealthTracker.tsx:
const conMod = Math.floor((char.constitution - 10) / 2);

// No componente AttacksList.tsx:
const strMod = Math.floor((char.strength - 10) / 2);
const attackRoll = Math.floor(Math.random() * 20) + 1 + strMod + Math.floor((char.level - 1) / 4) + 2;

// No backend characters.js:
const pb = Math.floor((char.level - 1) / 4) + 2;
const spellDC = 8 + pb + Math.floor((char[char.spellcasting_ability] - 10) / 2);
```

*Problema:* Se for necessário adicionar suporte a itens mágicos que modificam o cálculo ou tratar valores `null`/`undefined`, todas as instâncias do código precisarão ser localizadas e corrigidas.

---

## ✅ Boa Prática (Solução DRY em TypeScript)

Centralizar as regras puras em um módulo único reutilizável (`src/utils/dnd.ts`) com testes automatizados:

```typescript
// src/utils/dnd.ts

export const calculateModifier = (score: number = 10): number => {
  const num = Number(score);
  if (isNaN(num)) return 0;
  return Math.floor((num - 10) / 2);
};

export const formatModifier = (mod: number): string => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const calculateProficiencyBonus = (level: number = 1): number => {
  const lvl = Math.max(1, Math.min(20, Number(level) || 1));
  return Math.floor((lvl - 1) / 4) + 2;
};

export const calculateSpellStats = (
  level: number,
  spellcastingScore: number
): { spellSaveDc: number; spellAttackBonus: number; formattedSpellAttack: string } => {
  const pb = calculateProficiencyBonus(level);
  const mod = calculateModifier(spellcastingScore);
  const dc = 8 + pb + mod;
  const attack = pb + mod;

  return {
    spellSaveDc: dc,
    spellAttackBonus: attack,
    formattedSpellAttack: formatModifier(attack),
  };
};
```

---

## 📋 Checklist de Revisão DRY
- [ ] Regras matemáticas de D&D 5e estão centralizadas em `utils/dnd.ts`?
- [ ] Tipos de dados e contratos de API estão unificados em `types/dnd5e.ts`?
- [ ] Códigos de cores e estilos repetidos estão mapeados em tokens ou classes utilitárias do Tailwind?
- [ ] Constantes estáticas (ex.: lista de perícias, dados de vida por classe) têm uma única fonte de verdade?
