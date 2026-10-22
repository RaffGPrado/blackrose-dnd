# 🚀 Propostas de Evolução — Black Rose D&D 5e

Este documento reúne um roadmap estratégico de propostas de implementação para elevar o **Black Rose D&D** ao patamar dos melhores companions comerciais de RPG do mercado (como D&D Beyond e Demiplane), com foco em inovação técnica, ergonomia de mesa e experiência do usuário.

---

## 🏛️ Pilar 1: Inovações Técnicas (Arquitetura & Engenharia)

### ✅ Já Implementado (Novos Padrões Ativos)
* **Functional Error Handling:** Substituição do `try/catch` imperativo pelo padrão Result Monad usando `neverthrow`.
* **Observer Pattern (`GameEventBus`):** Desacoplamento da reatividade do frontend, garantindo que componentes reajam a eventos de domínio de forma limpa.
* **Clean Code Estrito:** Banimento de comentários arbitrários; o código e os tipos devem servir como documentação viva.
*(Consulte [`fp_and_patterns.md`](./fp_and_patterns.md) para detalhes).*


### 1.1 Offline-First com PWA (Progressive Web App) & IndexedDB
* **O Problema:** Sessões de RPG frequentemente ocorrem em locais com sinal de celular instável (garagens, salas com pouca cobertura, chácaras, convenções).
* **A Solução:**
  * Configurar Service Workers com `vite-plugin-pwa` para cache de todos os assets e das 375+ imagens de cartas.
  * Usar `idb` (IndexedDB) como réplica local no cliente. Todas as alterações de PV, moedas e slots acontecem instantaneamente no IndexedDB local e entram em uma fila de sincronização em segundo plano (*background sync*) com o SQLite do backend assim que a conexão retornar.
* **Benefício:** Zero travamentos ou mensagens de erro de rede no meio de uma batalha épica.

### 1.2 WebSockets / SSE para "Mesa Conectada" (Live Combat Sync)
* **O Problema:** O Mestre (DM) precisa perguntar constantemente: *"Quanto de vida você tem agora?"* ou controlar a iniciativa manualmente no papel.
* **A Solução:**
  * Adicionar canal WebSocket leve (`ws`) no backend Node.js.
  * Criar o modo **"Mestre da Mesa"**: uma tela de dashboard onde o DM visualiza em tempo real as barras de PV de todos os jogadores conectados, testes de morte e condições ativas.
  * Quando o mestre lança um efeito em área, ele pode disparar dano direto para os personagens da sessão com aprovação em 1 toque.

### 1.3 Audio FX Web Audio API (Imersão Tátil)
* **A Solução:** Adicionar micro-efeitos sonoros táteis (opcionais com toggle nas configurações):
  * Som de rolagem de d20 na madeira ao tocar em ataques ou perícias.
  * Som de espada (*schwing*) ou impacto místico ao tirar **Nat 20**.
  * Som sombrio de osso quebrando em **Falha Crítica (Nat 1)**.
  * Som de líquido borbulhante ao beber uma poção de cura.

### 1.4 Validação de Schemas com `zod` + `drizzle-zod` (Zero Hardcode)
* **A Solução:** Derivar contratos de validação diretamente do schema Drizzle (`backend/src/config/schema.ts`):
  * Validar payloads de criação e edição garantindo que valores numéricos (atributos 1-30, níveis 1-20) nunca recebam tipos inválidos.
  * Inferência automática de tipos TypeScript a partir do schema (`z.infer<typeof InsertCharacterSchema>`), eliminando `as T` cegos nas fronteiras HTTP/WebSocket.
  * *(Consulte [`drizzle_orm_e_persistencia.md`](./drizzle_orm_e_persistencia.md)).*

### 1.5 Migração Completa para Drizzle ORM & Compêndio Data-Driven
* **A Solução:**
  * Remover todo DDL SQL manual de `db.ts` em favor de migrações versionadas pelo `drizzle-kit`.
  * Enriquecer as tabelas `classes`, `spells` e `character_features` com metadados reais do compêndio (`hit_die`, `caster_progression`, `concentration`, `ritual`, `recovery`) para eliminar listas e regras *hardcoded* no código.
  * Garantir transações atômicas (`UnitOfWork`) propagando `tx` e usando inserções em lote (`.values(array)`).

### 1.6 Governança Automatizada (Typecheck, ESLint Boundaries, Prettier & CVA)
* **A Solução:**
  * Gate de qualidade com `tsc --noEmit`, `eslint` (bloqueando `any`, arquivos > 250 linhas e acoplamento indevido entre camadas), `prettier-plugin-tailwindcss` e `knip`.
  * Primitivos de UI com `class-variance-authority` (`cva`), `vaul`, `sonner`, `@dnd-kit/sortable` e `react-zoom-pan-pinch`.
  * *(Consulte [`regras_abstracao_e_qualidade.md`](./regras_abstracao_e_qualidade.md) e [`catalogo_bibliotecas_e_padroes_ui.md`](./catalogo_bibliotecas_e_padroes_ui.md)).*

---

## ⚔️ Pilar 2: Novas Funcionalidades (Gameplay Features)

### 2.1 Rastreador de Condições de D&D 5e (Conditions Tracker)
* **Descrição:** Seletor rápido de condições clássicas com efeitos visuais na ficha:
  * 🟢 **Concentração:** Badge pulsante com o nome da magia concentrada. Se o personagem tomar dano, o app abre automaticamente um modal: *"Faça um teste de salvaguarda de CON (CD calculada: metade do dano sofrido ou 10)!"*.
  * 🔴 **Condições Oficiais:** Cego, Enfeitiçado, Surdo, Amedrontado, Agarrado, Incapacitado, Invisível, Paralisado, Petrificado, Envenenado, Caído (*Prone*), Contido, Atordoado, Inconsciente.
  * Tocar na condição exibe em 1 linha o resumo das regras (ex.: *"Ataques contra você têm vantagem"*).

### 2.2 Calculadora de Descanso Curto (Short Rest)
* **Descrição:** Atualmente temos apenas o Descanso Longo. O Descanso Curto é vital para classes como Bruxo, Monge e Guerreiro:
  * Modal interativo onde o jogador escolhe quantos Dados de Vida quer gastar (ex.: `2d8`).
  * O app rola os dados, soma o modificador de Constituição em cada um e cura o personagem, descontando os dados gastos do limite.
  * Classes com recursos que recarregam em descanso curto (como *Fôlego do Guerreiro*, *Pontos de Ki* e *Espaços de Pacto do Bruxo*) são restauradas automaticamente.

### 2.3 Histórico de Ações com Botão Desfazer (Undo/Redo)
* **Descrição:** Implementação prática na interface do padrão **Command** (ver [`pattern_command.md`](./pattern_command.md)):
  * Botão de relógio/histórico no topo.
  * Tocar nele abre uma lista das últimas 10 ações (ex.: *"14:22 - Dano: -12 PV"*, *"14:20 - Usou slot 2º círculo"*).
  * Botão **"Desfazer"** restaura o estado anterior instantaneamente caso o mestre ou jogador tenham errado o cálculo.

### 2.4 Temas Visuais Alternativos
* **Black Rose (Padrão):** Obsidiana profunda, acentos dourados e rubi.
* **Pergaminho Antigo (Old Parchment):** Tema claro com textura de pergaminho clássico de RPG para sessões diurnas ao ar livre.
* **Arcane Void:** Tons de roxo profundo e ciano mágico para magos e feiticeiros.
* **Verdant Wilds:** Tons de couro envelhecido e verde musgo para druidas e rangers.

### 2.5 Exportação e Compartilhamento de Fichas
* **Backup JSON:** Exportar e importar personagens via arquivo `.json` com 1 clique (para trocar de aparelho ou mandar para o mestre).
* **Exportação para PDF Oficial:** Gerar o PDF diagramado oficial de D&D 5e preenchido com todos os dados e perícias para impressão física.

---

## 🎨 Pilar 3: Refinamento de Funcionalidades Existentes (UX & Performance)

### 3.1 Filtros Avançados no Catálogo de 375+ Cartas de Magia
* Adicionar tags táteis rápidas:
  * `[Concentração]` (para não equipar muitas magias conflitantes).
  * `[Ritual]` (magias que podem ser conjuradas sem slot).
  * `[Ação Bônus]` / `[Reação]` (essencial para escolher magias ágeis como *Passo Nebuloso* ou *Escudo Arcano*).
* Busca em tempo real no texto da descrição das cartas (não apenas no título).

### 3.2 Visualizador de Cartas com Zoom Tátil (Pinch-to-Zoom)
* Em smartphones, adicionar suporte a gestos de pinça para ampliar os detalhes das ilustrações e textos em alta resolução das cartas diagramadas em português.

### 3.3 Reordenação por Arrastar (Drag & Drop) na Mochila
* Permitir organizar armas e itens mais usados no topo da mochila com gestos táteis simples.

---

## 🗺️ Matriz de Priorização (Esforço vs. Valor)

```text
ALTO VALOR  │  [Offline PWA]           [Conditions Tracker]
            │  [Short Rest Calc]       [Filtros de Magias (Ritual/Conc)]
            │  [Undo/Redo de Combate]  [Mesa Conectada DM WebSockets]
            │
BAIXO VALOR │  [Audio FX]              [3D Dice Physics]
            └───────────────────────────────────────────────
               BAIXO ESFORÇO           ALTO ESFORÇO
```

### 🎯 Roadmap Recomendado para Próximos Sprints:
1. **Sprint A (Combate Ágil):** Rastreador de Condições (com Concentração) + Calculadora de Descanso Curto.
2. **Sprint B (Robustez Offline):** PWA + Cache das 375 imagens de cartas de magias.
3. **Sprint C (Imersão & Controle):** Histórico de Ações com Desfazer (Undo) + Efeitos Sonoros Sutis de Rolagem.
4. **Sprint D (Social & Mesa):** Modo Mestre (Dashboard sincronizado via WebSockets).
