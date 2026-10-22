import type { DMRosterItem } from '../types/dnd5e.js';

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

export type ClientWebSocketMessage =
  | { readonly type: 'auth'; readonly token: string }
  | { readonly type: 'subscribe'; readonly characterIds: readonly number[] }
  | { readonly type: 'unsubscribe'; readonly characterIds: readonly number[] }
  | { readonly type: 'player:join'; readonly characterId: number }
  | { readonly type: 'ping' };

export type ServerWebSocketMessage =
  | { readonly type: 'connected'; readonly message: string; readonly timestamp: number }
  | { readonly type: 'auth:ok'; readonly userId: number }
  | { readonly type: 'auth:error'; readonly message: string }
  | { readonly type: 'subscribed'; readonly characterIds: readonly number[] }
  | { readonly type: 'presence'; readonly characterId: number; readonly online: boolean; readonly timestamp: number }
  | { readonly type: 'patch'; readonly characterId: number; readonly patch: CharacterDifferentialPatch; readonly timestamp: number }
  | { readonly type: 'pong'; readonly timestamp: number };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isClientWebSocketMessage(value: unknown): value is ClientWebSocketMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }

  switch (value.type) {
    case 'auth':
      return typeof value.token === 'string';

    case 'subscribe':
    case 'unsubscribe':
      return Array.isArray(value.characterIds) && value.characterIds.every((id) => typeof id === 'number');

    case 'player:join':
      return typeof value.characterId === 'number' && !Number.isNaN(value.characterId);

    case 'ping':
      return true;

    default:
      return false;
  }
}

export function isServerWebSocketMessage(value: unknown): value is ServerWebSocketMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
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
        isRecord(value.patch) &&
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
