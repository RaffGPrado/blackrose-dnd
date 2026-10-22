import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { Result } from 'neverthrow';
import { RoomManager } from './RoomManager.js';
import { MessageHandler } from './MessageHandler.js';
import {
  isClientWebSocketMessage,
  ServerWebSocketMessage,
  CharacterDifferentialPatch,
} from './protocol.js';

const JWT_SECRET = process.env.JWT_SECRET || 'black_rose_dnd_super_secret_jwt_key_2026';

const roomManager = new RoomManager();
const messageHandler = new MessageHandler(roomManager);

let wss: WebSocketServer | null = null;

export function initGameServer(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: number | undefined;
    
    Result.fromThrowable(
      () => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
        const token = url.searchParams.get('token');
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
          userId = decoded.id;
        }
      },
      (e) => e
    )();

    const session = roomManager.registerSession(ws, userId);

    ws.on('pong', () => {
      session.isAlive = true;
    });

    ws.on('message', (raw) => {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(raw.toString()),
        (err) => err
      )();

      if (parseResult.isErr()) {
        console.error('[WS] Invalid JSON received:', parseResult.error);
        return;
      }

      const parsed: unknown = parseResult.value;
      
      if (isClientWebSocketMessage(parsed)) {
        messageHandler.handle(session, parsed, broadcastToSubscribers);
      } else {
        console.warn('[WS] Unknown or malformed client payload received');
      }
    });

    ws.on('close', () => {
      const { wasLastPlayerSession, characterId } = roomManager.removeSession(ws);
      if (wasLastPlayerSession && characterId) {
        broadcastToSubscribers(characterId, {
          type: 'presence',
          characterId,
          online: false,
          timestamp: Date.now(),
        });
      }
    });

    const welcome: ServerWebSocketMessage = {
      type: 'connected',
      message: 'Conectado à Mesa Black Rose D&D 5e',
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(welcome));
  });

  const heartbeatInterval = setInterval(() => {
    if (!wss) return;
    for (const session of roomManager.getAllSessions()) {
      if (!session.isAlive) {
        session.ws.terminate();
        roomManager.removeSession(session.ws);
        continue;
      }
      session.isAlive = false;
      session.ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  console.log('⚔️  WebSocket GameServer initialized on /ws (Mesa Conectada)');
  return wss;
}

export function broadcastCharacterPatch(
  characterId: number,
  patch: CharacterDifferentialPatch,
): void {
  const payload: ServerWebSocketMessage = {
    type: 'patch',
    characterId,
    patch,
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(payload);
  const targets = roomManager.getTargetSockets(characterId);

  for (const socket of targets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serialized);
    }
  }
}

function broadcastToSubscribers(characterId: number, data: ServerWebSocketMessage): void {
  const serialized = JSON.stringify(data);
  const subscribers = roomManager.getSubscribers(characterId);

  for (const socket of subscribers) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serialized);
    }
  }
}

export function isCharacterOnline(characterId: number): boolean {
  return roomManager.isCharacterOnline(characterId);
}
