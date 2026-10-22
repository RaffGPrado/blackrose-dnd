# 📖 Sumário Central de Boas Práticas & Design Patterns

Este sumário serve como mapa de navegação rápido para todos os documentos de referência técnica do projeto **Black Rose D&D 5e**.

---

## 🏛️ 1. Princípios Fundamentais de Engenharia de Software

| Documento | Princípio | Resumo Rápido |
| :--- | :--- | :--- |
| [**`dry.md`**](./dry.md) | **DRY (Don't Repeat Yourself)** | Centralização de regras canônicas de D&D 5e (modificadores, proficiência, magias) em uma única fonte da verdade (`utils/dnd.ts`). |
| [**`solid_srp.md`**](./solid_srp.md) | **Single Responsibility (SRP)** | Desacoplamento do monólito da ficha em componentes especializados (vida, armas, status, mochila) com apenas uma razão para mudar. |
| [**`solid_ocp.md`**](./solid_ocp.md) | **Open/Closed (OCP)** | Extensão aberta para novas classes e raças sem precisar alterar o código central ou editar longos `switch/case`. |
| [**`solid_lsp.md`**](./solid_lsp.md) | **Liskov Substitution (LSP)** | Ações e feitiços polimórficos intercambiáveis (ex.: Truques vs Magias de Círculo Alto) que honram o mesmo contrato sem exceções inesperadas. |
| [**`solid_isp.md`**](./solid_isp.md) | **Interface Segregation (ISP)** | Interfaces pequenas e específicas por componente em vez de props e contratos monolíticos inflados. |
| [**`solid_dip.md`**](./solid_dip.md) | **Dependency Inversion (DIP)** | Componentes e regras de negócio dependem de interfaces abstratas (`ICharacterService`), facilitando testes e troca de drivers de rede. |
| [**`yagni.md`**](./yagni.md) | **YAGNI** | Construir para a dor real da mesa física móvel atual; evitar complexidade especulativa e arquiteturas hipotéticas. |
| [**`kiss.md`**](./kiss.md) | **KISS** | Soluções simples e diretas: funções puras matemáticas no código e botões táteis de 1 toque (`-5`, `+1`) na interface. |

---

## 🎨 2. Design Patterns (Padrões de Projeto)

| Documento | Padrão | Tipo | Aplicação no Projeto |
| :--- | :--- | :--- | :--- |
| [**`pattern_abstract_factory.md`**](./pattern_abstract_factory.md) | **Abstract Factory** | Criacional | Criação de kits de heróis (Combatentes Marciais vs Conjuradores Arcanos) com armas, talentos e slots consistentes. |
| [**`pattern_facade.md`**](./pattern_facade.md) | **Facade** | Estrutural | `CharacterSheetFacade` unificando rotinas complexas (Descanso Longo, gasto de slots, orquestração de rede) para a UI. |
| [**`pattern_singleton_proxy.md`**](./pattern_singleton_proxy.md) | **Singleton + Proxy** | Composto | Conexão única ao SQLite encapsulada em um Proxy para medição de latência, alerta de queries lentas e logs sem poluir a classe. |
| [**`pattern_command.md`**](./pattern_command.md) | **Command** | Comportamental | Ações de combate (`ApplyDamageCommand`, `HealCommand`) com pilha de histórico e suporte a **Desfazer/Refazer (*Undo/Redo*)**. |
| [**`pattern_strategy.md`**](./pattern_strategy.md) | **Strategy** | Comportamental | Algoritmos intercambiáveis de resolução de dano (Dano Normal, Resistência dividindo à metade, Vulnerabilidade dobrando, Imunidade). |
| [**`pattern_observer.md`**](./pattern_observer.md) | **Observer** | Comportamental | `GameEventBus` tipado para eventos críticos (PV zerado ➔ ativação de Death Saves, término de descanso, animação de dados). |

---

## ✨ 3. Código Limpo, Persistência, UI & Tipagem

| Documento | Tópico | Resumo Rápido |
| :--- | :--- | :--- |
| [**`regras_abstracao_e_qualidade.md`**](./regras_abstracao_e_qualidade.md) | **Abstrações & Gate de Qualidade** | Fronteiras de camadas (DIP), política estrita Anti-Hardcode (Data-Driven) e pipeline `typecheck`, `eslint`, `prettier` e `knip`. |
| [**`drizzle_orm_e_persistencia.md`**](./drizzle_orm_e_persistencia.md) | **Drizzle ORM & Unit of Work** | Schema-first (`schema.ts`), migrações `drizzle-kit`, validação automática com `drizzle-zod`, batch inserts e transações reais com `tx`. |
| [**`catalogo_bibliotecas_e_padroes_ui.md`**](./catalogo_bibliotecas_e_padroes_ui.md) | **Bibliotecas, CVA & Modern Web** | Stack sem hardcode (`ts-pattern`, `rpg-dice-roller`, `cva`, `vaul`, `sonner`, `dnd-kit`, `react-zoom-pan-pinch`) e ergonomia mobile. |
| [**`fp_and_patterns.md`**](./fp_and_patterns.md) | **FP & Arquitetura** | Padrões ativos: Error handling com Result Monad (`neverthrow`), Observer pattern (`GameEventBus`) e proibição de comentários arbitrários. |
| [**`guia_boas_praticas_typescript.md`**](./guia_boas_praticas_typescript.md) | **Boas Práticas TypeScript** | Padrões de produção: strictness no compilador, Uniões Discriminadas, Type Guards, checagem exaustiva (`never`), Branded Types e DTOs compartilhados. |
| [**`guia_typescript_clean_code.md`**](./guia_typescript_clean_code.md) | **Clean Code TypeScript** | Eliminação de `any`, *Discriminated Unions*, Custom Hooks e padrões de ergonomia tátil (touch targets ≥ 48px). |
| [**`propostas_de_melhoria.md`**](./propostas_de_melhoria.md) | **Propostas de Evolução** | Visão estratégica de novas funcionalidades, melhorias técnicas e roadmap de curto e médio prazo. |

---

## 🤖 4. Padrões Operacionais & Agentic Coding

| Documento | Tópico | Resumo Rápido |
| :--- | :--- | :--- |
| [**`team_management_squads.md`**](./team_management_squads.md) | **Team Management Squads** | Padrões operacionais, arquitetura de esquadrões, protocolos de comunicação e restrições de ferramentas para Agentes. |
