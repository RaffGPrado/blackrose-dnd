import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { WebSocket } from 'ws';
import express from 'express';
import { initGameServer, broadcastCharacterPatch } from '../src/websocket/GameServer.js';

describe('WebSocket GameServer & Differential Micro-Patches', () => {
  let server: http.Server;
  let wsUrl: string;

  beforeAll(async () => {
    const app = express();
    server = http.createServer(app);
    initGameServer(server);

    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve());
    });

    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 4000;
    wsUrl = `ws://127.0.0.1:${port}/ws`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('should deliver micro-patches to subscribed clients', () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          characterIds: [101],
        }));
      });

      ws.on('message', (raw) => {
        const data = JSON.parse(raw.toString());

        if (data.type === 'subscribed') {
          setTimeout(() => {
            broadcastCharacterPatch(101, { current_hp: 24, conditions: '["Envenenado"]' });
          }, 10);
        }

        if (data.type === 'patch') {
          try {
            expect(data.characterId).toBe(101);
            expect(data.patch.current_hp).toBe(24);
            expect(data.patch.conditions).toBe('["Envenenado"]');

            const payloadSize = Buffer.byteLength(raw as Buffer, 'utf8');
            expect(payloadSize).toBeLessThan(150);

            ws.close();
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  });
});
