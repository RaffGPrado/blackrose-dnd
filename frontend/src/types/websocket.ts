/**
 * WebSocket Protocol Types & Type Guards for Frontend
 * Adheres to TypeScript best practices (apoio/guia_boas_praticas_typescript.md):
 * Discriminated unions, runtime type guards, and exhaustive compile-time checking.
 */

import type { DMRosterItem } from './dnd5e';

export type CharacterDifferentialPatch = Partial<
  Pick<
    DMRosterItem,
    | 'current_hp'
    | 'temp_hp'
    | 'max_hp'
    | 'conditions'
    | 'current_initiative'
    | 'inspiration'
    | 'death_successes'
    | 'death_failures'
    | 'hit_dice_current'
  >
>;

// ── Outbound to Server ────────────────────────────────────────────────────────

export type ClientWebSocketMessage =
  | { readonly type: 'auth'; readonly token: string }
  | { readonly type: 'subscribe'; readonly characterIds: readonly number[] }
  | { readonly type: 'unsubscribe'; readonly characterIds: readonly number[] }
  | { readonly type: 'player:join'; readonly characterId: number }
  | { readonly type: 'ping' };

// ── Inbound from Server ───────────────────────────────────────────────────────

export type ServerWebSocketMessage =
  | { readonly type: 'connected'; readonly message: string; readonly timestamp: number }
  | { readonly type: 'auth:ok'; readonly userId: number }
  | { readonly type: 'auth:error'; readonly message: string }
  | { readonly type: 'subscribed'; readonly characterIds: readonly number[] }
  | { readonly type: 'presence'; readonly characterId: number; readonly online: boolean; readonly timestamp: number }
  | { readonly type: 'patch'; readonly characterId: number; readonly patch: CharacterDifferentialPatch; readonly timestamp: number }
  | { readonly type: 'pong'; readonly timestamp: number };

// ── Type Guard ────────────────────────────────────────────────────────────────

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isServerWebSocketMessage(value: unknown): value is ServerWebSocketMessage {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false;
  }

  switch (value.type) {
    case 'connected':
      return typeof value.message === 'string' && typeof value.timestamp === 'number';
    case 'auth:ok':
      return typeof value.userId === 'number';
    case 'auth:error':
      return typeof value.message === 'string';
    case 'subscribed':
      return Array.isArray(value.characterIds);
    case 'presence':
      return (
        typeof value.characterId === 'number' &&
        typeof value.online === 'boolean' &&
        typeof value.timestamp === 'number'
      );
    case 'patch':
      return (
        typeof value.characterId === 'number' &&
        isObject(value.patch) &&
        typeof value.timestamp === 'number'
      );
    case 'pong':
      return typeof value.timestamp === 'number';
    default:
      return false;
  }
}

export function assertNever(x: never, errorMsg = 'Unexpected value in exhaustive check'): never {
  throw new Error(`${errorMsg}: ${JSON.stringify(x)}`);
}
