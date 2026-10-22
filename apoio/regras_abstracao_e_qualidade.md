# 🏛️ Regras de Abstração, Fronteiras Arquiteturais & Gate de Qualidade

> **Objetivo:** Estabelecer contratos invioláveis de separação de camadas, proibição de *hardcode* e verificação automatizada via **Typecheck (`tsc`)**, **ESLint**, **Prettier** e **Knip** no ecossistema **Black Rose D&D 5e**.

---

## 1. Fronteiras de Abstração e Camadas (Clean Architecture & DIP)

Toda comunicação entre módulos deve respeitar o sentido unidirecional de dependências: **UI / HTTP ➔ Application / Facade ➔ Domain (Interfaces & Regras Puras) ⬅ Infrastructure (Drizzle / HTTP / IndexedDB / WebSocket)**.

### 1.1 Regras de Importação no Frontend (`frontend/src/`)

| Camada | Diretório | Pode Importar De | **Proibido Importar De** (`no-restricted-imports`) |
| :--- | :--- | :--- | :--- |
| **Apresentação (UI Pura)** | `components/**`, `pages/**` | `components/ui/**`, `hooks/**`, `context/**`, `utils/dnd.ts`, `types/**` | `services/api.ts`, `offline/**`, `localStorage`, `idb`, `WebSocket` |
| **Orquestração (Hooks / Context)** | `hooks/**`, `context/**`, `store/**` | `facade/**`, `domain/**`, `services/**`, `utils/**`, `types/**` | Componentes visuais (`pages/**`, `components/sheet/**`) |
| **Fachada & Domínio Cliente** | `facade/**`, `domain/**`, `offline/**` | `services/**`, `utils/dnd.ts`, `types/**`, `neverthrow`, `ts-pattern`, `zod` | `react`, `react-dom`, `pages/**`, `components/**` |
| **Infraestrutura Cliente** | `services/api.ts`, `offline/storage.ts` | `types/**`, `zod`, `neverthrow`, `idb` | `react`, `hooks/**`, `components/**` |

### 1.2 Regras de Importação no Backend (`backend/src/`)

| Camada | Diretório | Pode Importar De | **Proibido Importar De** (`no-restricted-imports`) |
| :--- | :--- | :--- | :--- |
| **Domínio Puro** | `domain/**` | `types/**`, `neverthrow`, `ts-pattern`, `zod` | `express`, `drizzle-orm`, `node:sqlite`, `ws`, `infrastructure/**`, `config/db.ts` |
| **Aplicação / Controllers** | `application/**` | `domain/**`, `types/**`, `zod`, `neverthrow` | `infrastructure/database/**`, `node:sqlite`, `ws` concreto (usar `GameEventBus` / interfaces) |
| **Rotas HTTP & WS** | `routes/**`, `websocket/**` | `application/**`, `domain/**`, `middleware/**`, `types/**`, `zod` | Queries SQL/Drizzle diretas (`db.select()`, `sql\`...\``) |
| **Infraestrutura (Persistência)** | `infrastructure/database/**` | `domain/**`, `config/db.ts`, `config/schema.ts`, `drizzle-orm`, `neverthrow` | `express`, `routes/**`, `websocket/**` |

---

## 2. Política Estrita Anti-Hardcode (Data-Driven D&D 5e)

É **estritamente proibido** codificar valores literais de regras mutáveis ou catálogos de D&D 5e dentro de controladores, repositórios ou componentes React:

1. **Zero Listas de Classes Hardcoded:**
   * ❌ Proibido: `const spellcasters = ['mago', 'feiticeiro', 'bruxo']` ou `hit_dice_total = '1d8'`.
   * ✅ Obrigatório: Consultar metadados da tabela `classes` (`hitDie`, `spellcastingAbility`, `casterProgression`, `savingThrowProficiencies`) via `ClassRuleStrategy` alimentada pelo seed do compêndio.
2. **Zero Regex de Efeitos na Persistência:**
   * ❌ Proibido: Inferir ataques fazendo parse regex `/Dano:\s*([^•\n]+)/i` em strings de descrição dentro do repositório SQLite.
   * ✅ Obrigatório: Estruturar colunas tipadas (`damage`, `properties`, `category`) no schema Drizzle e usar `createAttacks()` explícito nas fábricas (`CharacterKitFactory`).
3. **Zero Rolagens Manuais Ad-Hoc:**
   * ❌ Proibido: `Math.floor(Math.random() * 8) + 1` espalhado na UI.
   * ✅ Obrigatório: Avaliar expressões canônicas de dados (`1d8+3`, `2d20kh1`, `4d6dl1`) através de motor declarativo (`@dice-roller/rpg-dice-roller`) encapsulado em `IDiceRollerService`.
4. **Zero Cores Hexadecimais Arbitrárias em Componentes:**
   * ❌ Proibido: `className="bg-[#191b29] text-[#e2e8f0]"`.
   * ✅ Obrigatório: Usar exclusivamente tokens semânticos mapeados em CSS Custom Properties (`bg-dnd-surface`, `text-dnd-text`, `border-dnd-border`) compatíveis com múltiplos temas.

---

## 3. Regras para Contratos, Abstrações e Tratamento de Erros

1. **Assinatura Funcional com `neverthrow`:**
   * Todo método de Repositório (`I*Repository`), Fachada (`*Facade`), Comando (`ICombatCommand`) e Cliente HTTP (`requestSafe`) **deve** retornar `Result<T, DomainError>` ou `ResultAsync<T, ApiError>`.
   * É proibido usar `Result.match(d => d, e => { throw e })` na camada de domínio; o desempacotamento para exceção só é permitido no adaptador interno exigido pelo `@tanstack/react-query`.
2. **Validação em Fronteiras com `zod` + `drizzle-zod`:**
   * Nenhum dado vindo de `req.body`, `req.query`, `res.json()`, `WebSocket.onmessage` ou `localStorage` pode sofrer cast `as T`.
   * Deve passar por `Schema.safeParse(raw)` convertido em `Result<T, ValidationError>`.
3. **Limites de SRP e ISP:**
   * **Limite de Arquivo:** Máximo de **250 linhas** (excluindo linhas em branco). Modais e páginas acima desse limite devem extrair Custom Hooks (`useCompendiumCatalog<T>`) e subcomponentes Presenter.
   * **Segregação de Props:** Componentes em `components/sheet/` e `components/layout/` nunca recebem `EnrichedCharacter` inteiro; devem definir fatias com `Pick<EnrichedCharacter, ...>`.

---

## 4. Pipeline Automatizado: Typecheck, Lint, Prettier & Knip

### 4.1 Scripts Padronizados (`package.json`)

Tanto `backend/package.json` quanto `frontend/package.json` devem expor:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.{ts,tsx}\" --max-warnings=0",
    "lint:fix": "eslint \"src/**/*.{ts,tsx}\" --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\"",
    "deadcode": "knip",
    "check": "npm run format:check && npm run typecheck && npm run lint && npm run test"
  }
}
```

### 4.2 Regras Obrigatórias do ESLint (`eslint.config.ts`)

* `@typescript-eslint/no-explicit-any`: `"error"`
* `@typescript-eslint/consistent-type-imports`: `["error", { "prefer": "type-imports" }]`
* `@typescript-eslint/no-unused-vars`: `["error", { "argsIgnorePattern": "^_" }]`
* `max-lines`: `["error", { "max": 250, "skipBlankLines": true, "skipComments": true }]`
* `no-restricted-imports`: Bloqueia importação direta de `services/api` em `components/**` e `pages/**`, e bloqueia `infrastructure/database/**` ou `config/db` em `domain/**` e `application/**`.
* `no-restricted-syntax` (Proibição de `try/catch` e `throw` imperativos no domínio/hooks/serviços):
  ```typescript
  'no-restricted-syntax': [
    'error',
    {
      selector: 'TryStatement',
      message: 'Proibido try/catch imperativo. Use neverthrow Result / ResultAsync.',
    },
    {
      selector: 'ThrowStatement',
      message: 'Proibido throw em camadas de domínio/serviço/hook. Retorne err(AppError) via neverthrow.',
    },
  ]
  ```

### 4.3 Configuração do Prettier (`.prettierrc.json`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./frontend/tailwind.config.ts"
}
```

### 4.4 Detecção de Código Morto e Duplicatas (`knip.json`)

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "workspaces": {
    "backend": {
      "entry": ["src/index.ts", "src/scripts/seed.ts", "src/scripts/reset_password.ts"],
      "project": ["src/**/*.ts", "test/**/*.ts"]
    },
    "frontend": {
      "entry": ["src/main.tsx"],
      "project": ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"]
    }
  }
}
```

