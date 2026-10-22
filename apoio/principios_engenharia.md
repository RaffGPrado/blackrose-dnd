# 🛡️ Princípios Fundamentais de Engenharia de Software

Este guia estabelece as diretrizes práticas para aplicação dos princípios **DRY**, **SOLID**, **YAGNI** e **KISS** no projeto **Black Rose D&D 5e**.

---

## 1. DRY — Don't Repeat Yourself (Não se Repita)

> *"Toda porção de conhecimento deve ter uma representação única, não ambígua e definitiva dentro do sistema."* — Andy Hunt & Dave Thomas

### O que NÃO é DRY:
DRY não significa apenas "não ter duas linhas de código idênticas". Duplicação de código acidental é tolerável quando dois domínios evoluem separadamente. A verdadeira violação de DRY ocorre quando uma **regra de negócio** (conhecimento do domínio) está espalhada em múltiplos lugares.

### Exemplo em D&D 5e:

#### ❌ Violação de DRY:
Cálculo de modificador de atributo duplicado no backend, no frontend e nos testes manuais.

```typescript
// No componente da Ficha:
const strMod = Math.floor((char.strength - 10) / 2);

// No serviço de Ataques:
const attackBonus = Math.floor((char.strength - 10) / 2) + char.proficiency;

// Na rota de Salvaguardas do Backend:
const saveBonus = Math.floor((char.strength - 10) / 2) + (isProf ? pb : 0);
```
*Se a regra do jogo mudar ou se houver tratamento para pontuações inválidas (ex.: `NaN` ou score < 1), o desenvolvedor precisará alterar múltiplos arquivos.*

#### ✅ Solução DRY:
Centralizar a regra matemática pura em um módulo canônico compartilhado:

```typescript
// src/utils/dnd.ts
export const calculateModifier = (score: number = 10): number => {
  if (isNaN(score)) return 0;
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (mod: number): string => {
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
```

---

## 2. SOLID — Os 5 Princípios da Orientação a Objetos e Design Limpo

### 2.1 S — Single Responsibility Principle (Princípio da Responsabilidade Única)
> *"Um módulo, classe ou componente deve ter apenas um, e somente um, motivo para mudar."*

* **No Frontend:** Um componente React não deve, ao mesmo tempo, orquestrar chamadas HTTP, gerenciar regras matemáticas de dados de vida, lidar com a persistência de moedas e renderizar tabelas complexas (como ocorria no antigo monolito `CharacterView.jsx` com 1.084 linhas).
* **Solução:**
  * `HealthTracker.tsx` cuida exclusivamente da interface de pontos de vida e botões de dano/cura.
  * `AttacksList.tsx` cuida exclusivamente da listagem de armas e disparo de eventos de rolagem.
  * `api.ts` cuida da comunicação HTTP com o servidor.

---

### 2.2 O — Open/Closed Principle (Princípio Aberto/Fechado)
> *"Entidades de software devem estar abertas para extensão, mas fechadas para modificação."*

Você deve ser capaz de adicionar novas classes, raças ou tipos de magias sem precisar alterar os algoritmos centrais que processam personagens.

#### ❌ Violação de OCP:
Um `switch` gigante que precisa ser editado a cada nova classe adicionada ao jogo.

```typescript
function getHitDieByClass(className: string): string {
  switch (className.toLowerCase()) {
    case 'barbarian': return '1d12';
    case 'fighter':
    case 'paladin':
    case 'ranger': return '1d10';
    case 'bard':
    case 'cleric':
    case 'druid':
    case 'monk':
    case 'rogue':
    case 'warlock': return '1d8';
    case 'sorcerer':
    case 'wizard': return '1d6';
    default: throw new Error('Classe desconhecida');
  }
}
```

#### ✅ Solução OCP (Polimorfismo ou Registro Aberto):
```typescript
interface CharacterClassDefinition {
  name: string;
  hitDie: string;
  primaryAbility: AbilityKey;
  savingThrowProficiencies: AbilityKey[];
}

// O dicionário pode ser estendido por plugins ou módulos adicionais sem tocar na função:
const CLASS_REGISTRY: Map<string, CharacterClassDefinition> = new Map();

export function registerClass(def: CharacterClassDefinition) {
  CLASS_REGISTRY.set(def.name.toLowerCase(), def);
}

export function getClassDefinition(name: string): CharacterClassDefinition | undefined {
  return CLASS_REGISTRY.get(name.toLowerCase());
}
```

---

### 2.3 L — Liskov Substitution Principle (Princípio da Substituição de Liskov)
> *"Subtipos devem ser substituíveis pelos seus tipos base sem alterar o comportamento correto do sistema."*

Se você possui uma abstração `Action` ou `Spell`, qualquer subtipo de magia (ex.: Truque / Cantrip, Magia com Ritual, Magia de Círculo Alto) deve honrar o mesmo contrato esperado por quem invoca a ação.

#### Exemplo prático:
Um `Cantrip` (Truque) é uma magia de nível 0. Se a interface de lançamento exigir um `consumeSpellSlot(level)`, o Truque não deve estourar um erro de exceção ou quebrar o fluxo. Ele deve honrar o contrato de lançamento sem custo de slot de forma previsível e segura.

---

### 2.4 I — Interface Segregation Principle (Princípio da Segregação de Interfaces)
> *"Clientes não devem ser forçados a depender de interfaces que não utilizam."*

Evite interfaces gigantescas que obrigam componentes a receber dezenas de propriedades que não lhes dizem respeito.

#### ❌ Violação de ISP:
```typescript
interface GiantCharacterSheetProps {
  character: Character;
  items: InventoryItem[];
  attacks: AttackItem[];
  spells: SpellCard[];
  spellSlots: SpellSlot[];
  onRollInitiative: () => void;
  onCastSpell: (id: number) => void;
  onEquipItem: (id: number) => void;
  onLongRest: () => void;
  onToggleSkill: (k: string) => void;
  // ... 40 outras propriedades passadas para um simples botão
}
```

#### ✅ Solução ISP:
Interfaces segregadas e focadas em cada contexto:

```typescript
// Apenas o necessário para o rastreador de vida:
interface HealthTrackerProps {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  onAdjustHp: (delta: number) => void;
  onAdjustTempHp: (delta: number) => void;
}

// Apenas o necessário para a lista de ataques:
interface AttacksListProps {
  attacks: AttackItem[];
  onOpenAddModal: () => void;
  onDeleteAttack: (id: number) => void;
  onRollAttack?: (attack: AttackItem) => void;
}
```

---

### 2.5 D — Dependency Inversion Principle (Princípio da Inversão de Dependência)
> *"Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."*

O frontend não deve acoplar seus componentes diretamente à biblioteca de requisições ou a detalhes de armazenamento local (`localStorage` solto em todo componente). Uma camada de serviço ou repositório abstrai o canal de dados.

```typescript
// Abstração (Contrato)
export interface ICharacterRepository {
  getById(id: number): Promise<CharacterDetailResponse>;
  update(id: number, data: Partial<CharacterCore>): Promise<EnrichedCharacter>;
}

// Implementação via API REST
export class ApiCharacterRepository implements ICharacterRepository {
  async getById(id: number) {
    return api.getCharacter(id);
  }
  async update(id: number, data: Partial<CharacterCore>) {
    const res = await api.updateCharacter(id, data);
    return res.character;
  }
}
```

---

## 3. YAGNI — You Aren't Gonna Need It (Você Não Vai Precisar Disso)

> *"Implemente sempre as coisas no momento exato em que você realmente precisa delas, nunca quando você apenas prevê que pode vir a precisar."*

### Como aplicar no Black Rose D&D:
* **Não criar microsserviços antecipadamente:** A aplicação roda com excelência em um servidor Node.js monólito modular com SQLite local em WAL. Não adicione filas Kafka, Redis distribuído ou Kubernetes antes que o volume de usuários exija.
* **Não construir sistemas genéricos abstratos para casos únicos:** Se o jogo só precisa rolar dados e ajustar PV na mesa móvel, não construa uma engine abstrata de física de colisão 3D ou um parser genérico de scripts de dados customizados antes da necessidade real.
* **Código deletado é código seguro:** Se um recurso ou componente legado não é mais usado, remova-o do repositório em vez de comentar e deixá-lo gerando ruído.

---

## 4. KISS — Keep It Simple, Stupid (Mantenha Simples e Direto)

> *"A simplicidade é o grau supremo da sofisticação."* — Leonardo da Vinci

### Como aplicar no Black Rose D&D:
* **Funções Puras:** Regras de D&D 5e são puramente determinísticas (dados score e proficiência ➔ resultado numérico). Evite criar árvores de herança de 5 níveis quando uma simples função pura TypeScript resolve em 3 linhas legíveis.
* **Controle de Estado Local Claro:** Prefira `useState` e `useMemo` para fluxos locais antes de introduzir bibliotecas pesadas de gerenciamento de estado global.
* **Thumb-Friendly e Autoexplicativo na Interface:** Se o jogador tomou 5 de dano, um botão vermelho `-5` visível resolve em 1 toque. Não o obrigue a abrir um teclado virtual, focar um campo de texto e digitar `-5`.
