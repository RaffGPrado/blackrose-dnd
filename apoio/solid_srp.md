# 🧩 SOLID 1 — Single Responsibility Principle (SRP)

> *"A class or module should have one, and only one, reason to change."*  
> — Robert C. Martin (Uncle Bob)

---

## 🎯 Conceito Central

O **Princípio da Responsabilidade Única** determina que cada módulo, classe ou componente React deve ter apenas uma responsabilidade bem delimitada. Quando uma unidade de código acumula múltiplas responsabilidades (por exemplo: renderização de UI + cálculo de regras + chamadas HTTP + persistência local), qualquer alteração em um desses requisitos corre o risco de quebrar os outros.

---

## 🎲 Aplicação no Domínio de D&D 5e

Na ficha de personagem:
* A gestão de **Pontos de Vida (HP)** muda quando a regra de dano/cura ou a ergonomia do botão mudar.
* A gestão de **Ataques e Armas** muda quando o jogador ganha novas propriedades de arma ou rolagens.
* A camada de **Rede/API** muda quando o formato das rotas do backend mudar.

---

## ❌ Anti-Padrão (Violação do SRP)

### Componente "Deus" (God Component):
O arquivo monolítico original `CharacterView.jsx` (com 1.084 linhas) continha:
1. Chamadas diretas `fetch()` e headers JWT.
2. Cálculos de modificadores de habilidade.
3. Gerenciamento de estado de 4 modais diferentes.
4. Lógica de incremento/decremento de moedas e peso.
5. Renderização de todas as abas e formulários em um único retorno JSX.

```tsx
// ❌ Violando SRP: Um único componente gerenciando tudo
export const GodCharacterView = () => {
  // 30 estados diferentes misturados...
  const [hp, setHp] = useState(10);
  const [coins, setCoins] = useState({ gp: 0 });
  const [attacks, setAttacks] = useState([]);
  const [newAttackModal, setNewAttackModal] = useState(false);

  // Regras de negócio misturadas com chamadas HTTP
  const handleAttack = async () => {
    const res = await fetch('/api/characters/1/attacks', { ... });
    // calcula dano, formata string, altera estado...
  };

  return (
    <div>
      {/* 1000 linhas de JSX com cabeçalho, tabelas, modais e rodapés */}
    </div>
  );
};
```

---

## ✅ Boa Prática (Solução com SRP)

Decompor em componentes e módulos coesos, onde cada um possui apenas uma responsabilidade:

```text
frontend/src/
├── services/
│   └── api.ts               // Responsabilidade ÚNICA: Comunicação HTTP e contratos
├── utils/
│   └── dnd.ts               // Responsabilidade ÚNICA: Matemática e regras puras de D&D
└── components/sheet/
    ├── HealthTracker.tsx    // Responsabilidade ÚNICA: Visualização e ajuste de HP/Morte
    ├── CombatSummary.tsx    // Responsabilidade ÚNICA: Exibição de status táticos (CA, Inic.)
    ├── AttacksList.tsx      // Responsabilidade ÚNICA: Gestão visual de armas e rolagens
    └── InventoryTab.tsx     // Responsabilidade ÚNICA: Gestão de moedas e peso da mochila
```

### Exemplo do Componente com Responsabilidade Única:

```typescript
// src/components/sheet/HealthTracker.tsx
interface HealthTrackerProps {
  character: EnrichedCharacter;
  onAdjustHp: (delta: number) => void;
  onAdjustTempHp: (delta: number) => void;
  onAdjustHitDice: (delta: number) => void;
  onToggleDeathSave: (type: 'success' | 'failure', index: number) => void;
}

export const HealthTracker: React.FC<HealthTrackerProps> = ({
  character,
  onAdjustHp,
  onAdjustTempHp,
  onAdjustHitDice,
  onToggleDeathSave,
}) => {
  // Cuida exclusivamente de apresentar o PV e fornecer botões ergonômicos de dano/cura
  return (
    <div className="bg-[#141522] rounded-2xl p-4">
      {/* Barra de progresso e botões táteis -5/-1/+1/+5 */}
    </div>
  );
};
```

---

## 📋 Checklist de Revisão SRP
- [ ] O componente tem menos de 250 linhas?
- [ ] A lógica de acesso à rede está isolada em `api.ts` ou custom hooks?
- [ ] Regras de cálculo estão fora do JSX em funções utilitárias puras?
- [ ] Se o design do botão de cura mudar, preciso mexer no código das armas? (Se sim, SRP foi violado).
