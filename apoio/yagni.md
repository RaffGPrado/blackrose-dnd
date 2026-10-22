# 🚫 YAGNI — You Aren't Gonna Need It

> *"Always implement things when you actually need them, never when you just foresee that you might need them."*  
> — Ron Jeffries, *Extreme Programming*

---

## 🎯 Conceito Central

O princípio **YAGNI** alerta contra o desenvolvimento de funcionalidades, abstrações complexas ou infraestruturas hipotéticas baseadas em especulações sobre o futuro. Construir código antecipadamente consome tempo de desenvolvimento, aumenta a área de superfície de bugs, exige manutenção e frequentemente se mostra inadequado quando a necessidade real finalmente surge.

---

## 🎲 Aplicação no Domínio de D&D 5e

No desenvolvimento do **Black Rose D&D**:
* **Problema real agora:** Jogadores em smartphones em volta da mesa física precisam ver seus PV, rolar ataques em 1 toque e consultar suas cartas de magia sem lentidão.
* **Tentação especulativa (Overengineering):** Criar um sistema de chat P2P com WebRTC, um gerador procedural 3D de masmorras, suporte a 50 sistemas de RPG diferentes simultâneos (Tormenta20, Call of Cthulhu, Pathfinder) e um compilador customizado de fórmulas de dados antes mesmo de ter a ficha de D&D 5e redonda.

---

## ❌ Anti-Padrão (Violação do YAGNI)

### Criação de abstrações genéricas gigantescas "para o caso de um dia precisar":

```typescript
// ❌ Violando YAGNI: Tentativa de suportar qualquer RPG do universo quando o app é sobre D&D 5e
interface UniversalEntityRuleEngine<TSystemContext, TStatsConfig, TDicePhysics> {
  registerSystem(systemId: string, ruleParser: (input: string) => TSystemContext): void;
  calculateMultiverseOutcome(context: TSystemContext, physicsEngine: TDicePhysics): Promise<TStatsConfig>;
  exportToBlockchainOrCloud(storageProvider: 'aws' | 'gcp' | 'azure' | 'web3'): Promise<void>;
}
// Centenas de linhas de código abstrato que nunca serão usadas e atrasam a entrega do produto!
```

---

## ✅ Boa Prática (Solução YAGNI)

Construir com arquitetura limpa, direta e estritamente dimensionada para as necessidades atuais, mantendo o código fácil de refatorar no futuro:

```typescript
// ✅ Solução YAGNI: Tipagem clara, direta e focada no problema atual (D&D 5e)
export interface CharacterCore {
  id: number;
  name: string;
  level: number;
  current_hp: number;
  max_hp: number;
  armor_class: number;
  // ... campos reais de D&D 5e
}

// O banco de dados SQLite nativo (WAL mode) resolve 100% da necessidade de persistência
// rápida e local. Não é necessário orquestrar um cluster distribuído.
```

---

## 💡 Diretrizes Práticas de YAGNI
1. **Regra de Três:** Só crie uma abstração ou camada reutilizável quando você tiver pelo menos **três casos reais** de uso. Não abstraia na primeira ou segunda ocorrência.
2. **Delete Código Morto:** Se um componente, função ou endpoint foi substituído, remova-o. Não deixe trechos comentados "caso precisemos no futuro"; o histórico do Git existe para isso.
3. **Foco no MVP (Produto Mínimo Viável):** Priorize usabilidade em smartphones, performance em baixa conexão e velocidade durante o combate na mesa de jogo.
