import type { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { Result } from 'neverthrow';
import type { RoomManager, ClientSession } from './RoomManager.js';
import {
  ClientWebSocketMessage,
  ServerWebSocketMessage,
  assertNever,
  isRecord,
} from './protocol.js';

const JWT_SECRET = process.env.JWT_SECRET || 'black_rose_dnd_super_secret_jwt_key_2026';

export class MessageHandler {
  constructor(private readonly roomManager: RoomManager) {}

  public handle(
    session: ClientSession,
    message: ClientWebSocketMessage,
    broadcastToSubscribers: (characterId: number, msg: ServerWebSocketMessage) => void,
  ): void {
    const { ws } = session;

    switch (message.type) {
      case 'auth': {
        const verifyResult = Result.fromThrowable(
          () => jwt.verify(message.token, JWT_SECRET),
          (err) => err
        )();

        if (verifyResult.isErr() || !isRecord(verifyResult.value) || typeof verifyResult.value.id !== 'number') {
          this.send(ws, { type: 'auth:error', message: 'Invalid or expired token' });
        } else {
          session.userId = verifyResult.value.id;
          this.send(ws, { type: 'auth:ok', userId: session.userId });
        }
        break;
      }

      case 'subscribe': {
        this.roomManager.subscribeToCharacters(ws, message.characterIds);

        for (const characterId of message.characterIds) {
          const isOnline = this.roomManager.isCharacterOnline(characterId);
          this.send(ws, {
            type: 'presence',
            characterId,
            online: isOnline,
            timestamp: Date.now(),
          });
        }

        this.send(ws, {
          type: 'subscribed',
          characterIds: Array.from(session.subscribedCharacterIds),
        });
        break;
      }

      case 'unsubscribe': {
        this.roomManager.unsubscribeDM(ws, message.characterIds);
        this.send(ws, {
          type: 'subscribed',
          characterIds: Array.from(session.subscribedCharacterIds),
        });
        break;
      }

      case 'player:join': {
        const isFirstConnection = this.roomManager.joinAsPlayer(message.characterId, ws);

        if (isFirstConnection) {
          broadcastToSubscribers(message.characterId, {
            type: 'presence',
            characterId: message.characterId,
            online: true,
            timestamp: Date.now(),
          });
        }
        break;
      }

      case 'ping': {
        this.send(ws, { type: 'pong', timestamp: Date.now() });
        break;
      }

      default:
        assertNever(message);
    }
  }

  private send(ws: WebSocket, message: ServerWebSocketMessage): void {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
