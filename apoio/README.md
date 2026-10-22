# 📚 Black Rose D&D 5e — Documentos de Apoio & Engenharia

Bem-vindo à base de conhecimento técnico do projeto **Black Rose D&D 5e**. Aqui você encontra referências detalhadas e autocontidas para princípios de engenharia, padrões de projeto aplicados, padrões de tipagem e o roadmap de melhorias da aplicação.

> 🌟 **Navegação Rápida:** Acesse o [**Sumário Completo das Boas Práticas (`SUMARIO.md`)**](./SUMARIO.md) para uma visão tabular consolidada com links diretos.

---

## 🏛️ 1. Princípios de Engenharia de Software (Arquivos Individuais)

* [**`dry.md`**](./dry.md) — **DRY (Don't Repeat Yourself):** Regras matemáticas canônicas de D&D 5e em fonte única.
* [**`solid_srp.md`**](./solid_srp.md) — **Single Responsibility Principle (SRP):** Desacoplamento da ficha em componentes especializados.
* [**`solid_ocp.md`**](./solid_ocp.md) — **Open/Closed Principle (OCP):** Registro aberto de classes e regras sem alterar o núcleo.
* [**`solid_lsp.md`**](./solid_lsp.md) — **Liskov Substitution Principle (LSP):** Ações polimórficas (Truques vs Magias com Slots).
* [**`solid_isp.md`**](./solid_isp.md) — **Interface Segregation Principle (ISP):** Interfaces enxutas e props granulares.
* [**`solid_dip.md`**](./solid_dip.md) — **Dependency Inversion Principle (DIP):** Desacoplamento de rede e banco via contratos.
* [**`yagni.md`**](./yagni.md) — **YAGNI (You Aren't Gonna Need It):** Foco estrito na necessidade real de mesa física.
* [**`kiss.md`**](./kiss.md) — **KISS (Keep It Simple, Stupid):** Funções puras no código e botões táteis na interface.

---

## 🎨 2. Design Patterns Aplicados a D&D & TypeScript

* [**`pattern_abstract_factory.md`**](./pattern_abstract_factory.md) — **Abstract Factory:** Criação de kits de heróis (Marcial vs Conjurador).
* [**`pattern_facade.md`**](./pattern_facade.md) — **Facade:** `CharacterSheetFacade` simplificando operações de combate e descanso para a UI.
* [**`pattern_singleton_proxy.md`**](./pattern_singleton_proxy.md) — **Singleton + Proxy:** Conexão SQLite com telemetria e auditoria automática.
* [**`pattern_command.md`**](./pattern_command.md) — **Command Pattern:** Ações reversíveis com pilha de **Desfazer / Refazer (*Undo/Redo*)**.
* [**`pattern_strategy.md`**](./pattern_strategy.md) — **Strategy Pattern:** Resolução dinâmica de danos (Normal, Resistência, Vulnerabilidade, Imunidade).
* [**`pattern_observer.md`**](./pattern_observer.md) — **Observer Pattern:** Barramento tipado de eventos de combate (`GameEventBus`).

---

## 🚀 3. Visão Estratégica & Roadmap

* [**`propostas_de_melhoria.md`**](./propostas_de_melhoria.md) — **Propostas de Evolução e Novas Features:**
  * Modo Offline PWA com IndexedDB.
  * Mesa Conectada para o Mestre via WebSockets.
  * Rastreador de Condições e Concentração de Magia.
  * Calculadora de Descanso Curto com Dados de Vida.
  * Temas visuais alternativos e exportação de PDF oficial.

---

## ✨ 4. Guias de Governança, Persistência & Clean Code

* [**`regras_abstracao_e_qualidade.md`**](./regras_abstracao_e_qualidade.md) — Fronteiras de camadas (DIP), proibição de *hardcode* e pipeline `typecheck`, `eslint`, `prettier` e `knip`.
* [**`drizzle_orm_e_persistencia.md`**](./drizzle_orm_e_persistencia.md) — Arquitetura Drizzle ORM + `drizzle-zod`, schema *data-driven* de D&D 5e e transações `UnitOfWork` reais com `tx`.
* [**`catalogo_bibliotecas_e_padroes_ui.md`**](./catalogo_bibliotecas_e_padroes_ui.md) — Catálogo de bibliotecas sem *hardcode* (`ts-pattern`, `rpg-dice-roller`, `cva`, `vaul`, `sonner`, `dnd-kit`, `react-zoom-pan-pinch`) e padrões Modern Web.
* [**`fp_and_patterns.md`**](./fp_and_patterns.md) — Programação funcional (`neverthrow`), `GameEventBus` e proibição de comentários explicativos.
* [**`guia_boas_praticas_typescript.md`**](./guia_boas_praticas_typescript.md) — Guia definitivo de TypeScript: strictness, Uniões Discriminadas, Type Guards, checagem exaustiva (`never`) e DTOs compartilhados.
* [**`guia_typescript_clean_code.md`**](./guia_typescript_clean_code.md) — Convenções de Clean Code em TypeScript e ergonomia móvel.
* [**`principios_engenharia.md`**](./principios_engenharia.md) — Artigo unificado dos princípios fundamentais.
* [**`design_patterns.md`**](./design_patterns.md) — Artigo unificado dos padrões de projeto.
