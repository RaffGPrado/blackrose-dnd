# 📘 Guia Definitivo de Boas Práticas em TypeScript — Black Rose D&D 5e

> **Objetivo:** Estabelecer padrões de excelência em TypeScript para eliminar fragilidades (`any`, `as T` cegos, estados impossíveis e divergências de contratos) e garantir que o compilador trabalhe a nosso favor tanto no Backend quanto no Frontend.

---

## 🧭 Sumário das Boas Práticas

1. [Configuração Estrita do Compilador (`tsconfig.json`)](#1-configuração-estrita-do-compilador)
2. [Uniões Discriminadas (*Discriminated Unions*)](#2-uniões-discriminadas-discriminated-unions)
3. [Segurança de Fronteiras: *Type Guards* vs Type Assertions (`as T`)](#3-segurança-de-fronteiras-type-guards-vs-type-assertions)
4. [Checagem Exaustiva em Tempo de Compilação (`never`)](#4-checagem-exaustiva-em-tempo-de-compilação-never)
5. [Modelagem de Domínio e Tipos Marcados (*Branded Types*)](#5-modelagem-de-domínio-e-tipos-marcados-branded-types)
6. [Modelagem de Estados Assíncronos sem Estados Impossíveis](#6-modelagem-de-estados-assíncronos-sem-estados-impossíveis)
7. [Contratos Compartilhados (*Single Source of Truth*)](#7-contratos-compartilhados-single-source-of-truth)
8. [Eliminação Total de Arquivos `.js` em Projetos TypeScript](#8-eliminação-total-de-arquivos-js)

---

## 1. Configuração Estrita do Compilador

Um dos erros mais comuns que causam a sensação de "estamos ruins em TypeScript" é manter o compilador com opções permissivas (`allowJs: true`, `checkJs: false`, `noImplicitAny: false`).

### Configuração Recomendada (`tsconfig.json` de Produção):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,                         /* Ativa todas as verificações estritas */
    "noImplicitAny": true,                  /* Erro se inferir any */
    "strictNullChecks": true,               /* null e undefined tratados explicitamente */
    "strictFunctionTypes": true,            /* Verificação contravariante de parâmetros */
    "noUncheckedIndexedAccess": true,       /* Acessos a objetos/arrays podem ser undefined */
    "exactOptionalPropertyTypes": true,     /* Diferencia { a?: number } de { a: undefined } */
    "noImplicitReturns": true,              /* Garante que todas as ramificações retornem valor */
    "noFallthroughCasesInSwitch": true,     /* Evita esquecer 'break' em switch */
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

> [!IMPORTANT]
> A flag `"noUncheckedIndexedAccess": true` força o desenvolvedor a checar se `map.get(key)` ou `array[0]` retornou `undefined`, eliminando a maior causa de erros `Cannot read properties of undefined` em tempo de execução.

---

## 2. Uniões Discriminadas (*Discriminated Unions*)

Em vez de usar estruturas com campos opcionais ambíguos ou `Record<string, unknown>`, utilize **Uniões Discriminadas** com uma propriedade literal comum (geralmente `type` ou `kind`).

### ❌ Anti-padrão (Objeto "Saco de Gatos"):
```typescript
// Ambiguidade total: quais campos existem quando type === 'patch'?
interface WebSocketMessage {
  type: string;
  characterId?: number;
  patch?: any;
  token?: string;
  online?: boolean;
  message?: string;
}
```

### ✅ Recomendado (Uniões Discriminadas):
```typescript
export type WebSocketMessage =
  | { readonly type: 'connected'; readonly message: string; readonly timestamp: number }
  | { readonly type: 'auth'; readonly token: string }
  | { readonly type: 'auth:ok'; readonly userId: number }
  | { readonly type: 'subscribe'; readonly characterIds: readonly number[] }
  | { readonly type: 'presence'; readonly characterId: number; readonly online: boolean; readonly timestamp: number }
  | { readonly type: 'patch'; readonly characterId: number; readonly patch: CharacterDifferentialPatch; readonly timestamp: number };
```

**Vantagens:**
- O compilador afunila automaticamente os tipos dentro de `switch(msg.type)` ou `if (msg.type === 'patch')`.
- O autocompletion no IDE sabe exatamente quais propriedades existem em cada caso.

---

## 3. Segurança de Fronteiras: *Type Guards* vs Type Assertions (`as T`)

O operador `as` (Type Assertion) é perigoso porque silencia o compilador sem fazer nenhuma verificação em runtime. Se a API externa, o WebSocket ou o IndexedDB retornar dados com estrutura inesperada, a aplicação quebra em silêncio.

### ❌ Anti-padrão (Casting Cego):
```typescript
// O compilador acredita cegamente, mas e se 'data' for null ou string?
const msg = JSON.parse(rawMessage) as WebSocketMessage;
console.log(msg.type.toUpperCase()); // CRASH se rawMessage não for JSON válido!
```

### ✅ Recomendado (Predicado de Tipo / Type Guard):
```typescript
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isWebSocketMessage(value: unknown): value is WebSocketMessage {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false;
  }

  switch (value.type) {
    case 'auth':
      return typeof value.token === 'string';
    case 'subscribe':
      return Array.isArray(value.characterIds) && value.characterIds.every((id) => typeof id === 'number');
    case 'presence':
      return typeof value.characterId === 'number' && typeof value.online === 'boolean';
    case 'patch':
      return typeof value.characterId === 'number' && isObject(value.patch);
    case 'connected':
      return typeof value.message === 'string';
    default:
      return false;
  }
}
```

---

## 4. Checagem Exaustiva em Tempo de Compilação (`never`)

Ao processar mensagens ou ações de domínio com `switch`, garanta que o TypeScript avise se um novo tipo for adicionado e esquecido de ser tratado.

```typescript
export function assertNever(value: never, message = 'Unreachable branch executed'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}

// No roteador de mensagens:
function handleMessage(msg: WebSocketMessage): void {
  switch (msg.type) {
    case 'connected':
      console.log(msg.message);
      break;
    case 'auth':
      authenticate(msg.token);
      break;
    case 'presence':
      updatePresence(msg.characterId, msg.online);
      break;
    case 'patch':
      applyPatch(msg.characterId, msg.patch);
      break;
    default:
      // Se um novo tipo for adicionado em WebSocketMessage e não tiver case,
      // ESTA LINHA DÁ ERRO DE COMPILAÇÃO IMEDIATO!
      assertNever(msg);
  }
}
```

---

## 5. Modelagem de Domínio e Tipos Marcados (*Branded Types*)

Em jogos e RPGs, misturar números primitivos (ex.: passar `userId` onde se espera `characterId`, ou `maxHp` onde se espera `deltaHp`) é fonte recorrente de bugs lógicos silenciosos.

### ❌ Anti-padrão (Obsessão por Primitivos):
```typescript
function healCharacter(characterId: number, userId: number, hp: number): void { ... }
// Chamada com parâmetros invertidos — o compilador não percebe:
healCharacter(userId, characterId, 10);
```

### ✅ Recomendado (Tipos Nominais / Branded Types):
```typescript
declare const __brand: unique symbol;
export type Brand<K, T> = K & { readonly [__brand]: T };

export type CharacterId = Brand<number, 'CharacterId'>;
export type UserId = Brand<number, 'UserId'>;
export type SpellId = Brand<number, 'SpellId'>;

export function asCharacterId(id: number): CharacterId {
  if (id <= 0 || !Number.isInteger(id)) throw new Error('ID de personagem inválido');
  return id as CharacterId;
}

export function asUserId(id: number): UserId {
  if (id <= 0 || !Number.isInteger(id)) throw new Error('ID de usuário inválido');
  return id as UserId;
}

// Agora isto gera ERRO DE COMPILAÇÃO se invertido:
function healCharacter(characterId: CharacterId, userId: UserId, hp: number): void { ... }
```

---

## 6. Modelagem de Estados Assíncronos sem Estados Impossíveis

Em hooks do React, usar múltiplos booleanos independentes cria **estados impossíveis** (como `loading: true` e `error: 'Erro!'` simultaneamente).

### ❌ Anti-padrão:
```typescript
const [data, setData] = useState<Character | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
// Permite 2³ = 8 estados possíveis, incluindo { loading: true, error: 'falha', data: { ... } }!
```

### ✅ Recomendado (Estado Discriminado):
```typescript
export type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: string };
```

---

## 7. Contratos Compartilhados (*Single Source of Truth*)

Quando o Backend e o Frontend definem seus tipos separadamente, eles inevitavelmente divergem ao longo do projeto (ex.: `modifiers` vs `ability_modifiers`).

### Padrão de Projeto Recomendado:
- Ter um módulo centralizado de contratos (`types/dnd5e.ts` e `types/websocket.ts`).
- Definir DTOs estritamente desacoplados das tabelas brutas de banco de dados.
- O DTO de resposta HTTP e o DTO de mensageria WebSocket são idênticos em ambos os lados.

---

## 8. Eliminação Total de Arquivos `.js`

Em uma aplicação TypeScript profissional:
- **Zero arquivos `.js` ou `.jsx`** no código-fonte (`backend/src` e `frontend/src`).
- Testes automatizados escritos diretamente em `.ts` ou `.tsx`.
- Compilação limpa (`tsc --noEmit`) sem necessidade de flags permissivas (`allowJs: false`).

---

## 📊 Matriz de Maturidade TypeScript

| Nível | Características no Projeto | Ação Tomada no Black Rose |
|---|---|---|
| **Nível 1 (Frágil)** | Uso de `any`, `.js` misturado, sem `strict`, `as T` em respostas de API | ❌ Superado |
| **Nível 2 (Básico)** | TypeScript ativo com `strict: true`, mas com casting `cast<T>` e objetos com campos opcionais ambíguos | ⚠️ Fase de Transição |
| **Nível 3 (Robusto - Alvo)** | 100% TS, Uniões discriminadas no WebSocket, Type Guards nas fronteiras, DTOs compartilhados, `assertNever` em roteadores de eventos | ✅ Implementado na Fase 3 |
