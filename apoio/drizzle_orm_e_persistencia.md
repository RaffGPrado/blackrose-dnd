# 🗄️ Arquitetura de Banco de Dados com Drizzle ORM, `drizzle-zod` & Unit of Work

> **Objetivo:** Eliminar todo SQL *hardcoded* (`CREATE TABLE`, `ALTER TABLE` manual e conversões repetitivas `camelCase <-> snake_case`), consolidando o **Drizzle ORM** sobre `node:sqlite` (`DatabaseSync`) como única fonte da verdade para schema, migrações, inferência de tipos e transações atômicas.

---

## 1. Diagnóstico do Anti-Padrão Atual vs. Padrão Alvo

| Aspecto | ❌ Estado Legado Híbrido | ✅ Padrão Drizzle ORM Full |
| :--- | :--- | :--- |
| **DDL & Migrações** | 200 linhas de `sqlite.exec('CREATE TABLE...')` e `try { ALTER TABLE } catch {}` em `db.ts`. | Schema declarativo em `src/config/schema.ts` + migrações geradas via `drizzle-kit generate` e aplicadas com `migrate()`. |
| **Inferência de Tipos** | Interfaces duplicadas em `types/dnd5e.ts` e `ICharacterRepository.ts` com *drift* de colunas. | Tipos derivados diretamente das tabelas via `typeof table.$inferSelect` e `typeof table.$inferInsert`. |
| **Validação de Payload** | Casts cegos `req.body as any` nos Controllers. | Schemas gerados automaticamente via `drizzle-zod` (`createInsertSchema`, `createUpdateSchema`). |
| **Mapeamento de Colunas** | Conversão manual repetida 4x em `SqliteCharacterRepository.ts`. | Mapper canônico único tipado ou alinhamento direto do schema com os DTOs de domínio. |
| **Transações (`UnitOfWork`)** | `db.transaction((tx) => work())` ignorando `tx` e fazendo 20 queries em 8 transações separadas. | Propagação explícita do contexto `tx` (`DbExecutor = typeof db \| SQLiteTransaction`) e inserções em lote (`tx.insert(table).values(items)`). |

---

## 2. Modelagem Data-Driven no `schema.ts` (Zero Hardcode de Regras D&D 5e)

Para que o código não contenha arrays *hardcoded* de classes, dados de vida ou magias, o schema do Drizzle deve persistir os metadados canônicos vindos do compêndio (`compendium_pt_br.json`):

```typescript
// backend/src/config/schema.ts
import { sqliteTable, integer, text, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(), // ex: 'wizard', 'barbarian' (suporte bilíngue EN/PT)
  name: text('name').notNull().unique(), // ex: 'Mago', 'Bárbaro'
  hitDie: text('hit_die').notNull().default('1d8'), // '1d6' | '1d8' | '1d10' | '1d12'
  spellcastingAbility: text('spellcasting_ability'), // 'intelligence' | 'wisdom' | 'charisma' | null
  casterProgression: text('caster_progression').notNull().default('none'), // 'full' | 'half' | 'third' | 'pact' | 'none'
  savingThrowsJson: text('saving_throws_json').notNull().default('[]'), // ex: '["intelligence","wisdom"]'
});

export const spells = sqliteTable('spells', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  level: integer('level').notNull(),
  school: text('school').notNull(),
  castingTime: text('casting_time').notNull().default('1 Ação'),
  actionType: text('action_type').notNull().default('action'), // 'action' | 'bonus_action' | 'reaction' | 'minute'
  concentration: integer('concentration', { mode: 'boolean' }).notNull().default(false),
  ritual: integer('ritual', { mode: 'boolean' }).notNull().default(false),
  description: text('description').default(''),
  imageFilename: text('image_filename').notNull(),
  imagePath: text('image_path').notNull(),
});

export const characterFeatures = sqliteTable('character_features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: integer('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  usesMax: integer('uses_max').notNull().default(0),
  usesCurrent: integer('uses_current').notNull().default(0),
  recovery: text('recovery').notNull().default('long_rest'), // 'short_rest' | 'long_rest' | 'none'
});
```

---

## 3. Contratos Automáticos com `drizzle-zod`

Em vez de escrever validações manuais para cada rota REST ou mensagem WebSocket, derivamos os schemas direto do Drizzle:

```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { characters, characterAttacks, characterItems, characterFeatures } from '../config/schema.js';

export const InsertCharacterSchema = createInsertSchema(characters, {
  name: z.string().trim().min(1, 'Nome do personagem é obrigatório').max(80),
  level: z.number().int().min(1).max(20).default(1),
  strength: z.number().int().min(1).max(30).default(10),
  dexterity: z.number().int().min(1).max(30).default(10),
  constitution: z.number().int().min(1).max(30).default(10),
  intelligence: z.number().int().min(1).max(30).default(10),
  wisdom: z.number().int().min(1).max(30).default(10),
  charisma: z.number().int().min(1).max(30).default(10),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const UpdateCharacterPatchSchema = InsertCharacterSchema.partial().omit({ userId: true });
export type CreateCharacterInput = z.infer<typeof InsertCharacterSchema>;
export type UpdateCharacterPatch = z.infer<typeof UpdateCharacterPatchSchema>;
```

---

## 4. Unit of Work Real (`tx` Propagation) & Batch Inserts

Toda operação que altera múltiplas tabelas (como **Criar Personagem com Kit Inicial**, **Descanso Longo** ou **Descanso Curto**) deve executar em uma **única transação SQLite** repassando `tx` e usando inserção em lote (`.values(array)`):

```typescript
import { Result, ok, err } from 'neverthrow';
import { db } from '../../config/db.js';
import { characters, characterItems, characterAttacks, characterFeatures, characterSpellSlots } from '../../config/schema.js';

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbExecutor = typeof db | DbTransaction;

export function executeInTransaction<T>(
  work: (tx: DbTransaction) => T
): Result<T, Error> {
  return Result.fromThrowable(
    () => db.transaction((tx) => work(tx)),
    (e) => (e instanceof Error ? e : new Error(String(e)))
  )();
}

// Exemplo: Criação Atômica de Personagem + Kit Inicial em 1 Transação (Batch Insert)
export function createCharacterWithKit(
  input: CreateCharacterInput,
  kit: CharacterClassKit
): Result<number, Error> {
  return executeInTransaction((tx) => {
    const [created] = tx.insert(characters).values(input).returning({ id: characters.id }).all();

    if (kit.items.length > 0) {
      tx.insert(characterItems)
        .values(kit.items.map((item) => ({ ...item, characterId: created.id })))
        .run();
    }

    if (kit.attacks.length > 0) {
      tx.insert(characterAttacks)
        .values(kit.attacks.map((atk) => ({ ...atk, characterId: created.id })))
        .run();
    }

    if (kit.features.length > 0) {
      tx.insert(characterFeatures)
        .values(kit.features.map((feat) => ({ ...feat, characterId: created.id })))
        .run();
    }

    if (kit.spellSlots.length > 0) {
      tx.insert(characterSpellSlots)
        .values(kit.spellSlots.map((slot) => ({ ...slot, characterId: created.id })))
        .run();
    }

    return created.id;
  });
}
```

---

## 5. Telemetria com Singleton + Proxy no Drizzle (`DatabaseManager`)

Combinamos o cliente Drizzle com o padrão **Singleton + Proxy** (ver [`pattern_singleton_proxy.md`](./pattern_singleton_proxy.md)) para interceptar métodos (`select`, `insert`, `update`, `delete`, `transaction`, `query`), medir a latência via `performance.now()` e emitir alertas `⚠️ [SLOW DB OP: >50ms]` sem poluir os repositórios com `console.log`.

---

## 6. Seed Data-Driven via `compendium_pt_br.json` & `drizzle.config.ts`

### 6.1 Correção do Loop de Seed no Boot (`seed.ts` & `index.ts`)
* **Problema Identificado:** `index.ts` verifica `SELECT COUNT(*) FROM reference_items`, mas `seed.ts` nunca populava `reference_items` nem `reference_features` (que residem em `backend/src/data/compendium_pt_br.json` com 237 itens e 407 habilidades), fazendo o servidor apagar e recriar a tabela `spells` em **todo boot**, além de gravar `school = 'Geral'` hardcoded.
* **Padrão Obrigatório de Seed:**
  1. Executar dentro de `db.transaction((tx) => ...)` usando `tx.insert(...).values(...)` em lote (zero `db.$client.prepare` raw).
  2. Popular `classes` com metadados bilíngues (`name`, `nameEn`, `hitDie`, `spellcastingAbility`, `casterType`, `savingThrows`).
  3. Popular `reference_items` (237 itens com `category`, `damage`, `armorClass`, `properties`) e `reference_features` (407 habilidades com `className`, `level`, `usesMax`, `recovery`) diretamente de `compendium_pt_br.json`.
  4. Cruzar os 375+ cards de `assets/magic_cards` com `original/dnd5e.spells.json` para preencher a escola de magia real (`Evocação`, `Abjuração`, etc.), `concentration`, `ritual` e `description`.

### 6.2 Configuração do `drizzle.config.ts` (`backend/drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/config/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: './data/black_rose.db',
  },
});
```

---

## 7. Padrão de Execução Síncrona (`.sync()`) no Drizzle v1 com `node:sqlite`

### 7.1 Relational Queries com `DatabaseSync`
No driver nativo `node:sqlite` (`drizzle-orm/node-sqlite`), as operações I/O de banco de dados são síncronas.
* **Construção de Query**: `db.query.characters.findMany(...)` ou `findFirst(...)` retornam uma instância de `SQLiteSyncRelationalQuery<T>`.
* **Execução**: Para executar a consulta e obter os dados tipados de forma síncrona sem recorrer a `await` dentro de repositórios síncronos, invoca-se explicitamente `.sync()`:
  ```typescript
  const char = tx.query.characters.findFirst({
    where: { id: characterId, userId },
    with: {
      race: true,
      class: true,
      skills: true,
      savingThrows: true,
      items: { orderBy: (items, { desc }) => [desc(items.id)] },
    },
  }).sync();
  ```
* **Filtros Relacionais (`RelationsFilter`)**: Em consultas relacionais do Drizzle v1, a cláusula `where` aceita diretamente a estrutura de objeto de colunas (`where: { userId }` ou `where: { id: characterId, userId }`), garantindo type-safety e clareza sem operadores manuais redundantes.

### 7.2 Garantia de Qualidade e Testes Automatizados (Zero Chamadas Ad-Hoc)
Nunca execute chamadas ad-hoc via `node -e` no terminal. Todo comportamento esperado deve ser codificado em suites de testes automatizados com `vitest`:
* `test/character_repository.test.ts`: Validação de CRUD completo, transações atômicas, restauração em Descanso Longo (`longRest`), e integridade do cálculo de bônus e perícias.
* `test/character_controller.test.ts`: Verificação dos códigos de status HTTP (200, 201, 400, 404, 500) e reação a erros monádicos (`Result.match`).
* `test/websocket.test.ts`: Verificação do payload diferencial do `GameServer` (<150 bytes por micro-patch).
* `test/api.test.ts`: Integridade do schema SQLite e progressão matemática canônica do D&D 5e.


