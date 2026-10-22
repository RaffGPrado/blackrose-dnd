import type { WebSocket } from 'ws';

export interface ClientSession {
  readonly ws: WebSocket;
  userId?: number;
  characterId?: number;
  readonly subscribedCharacterIds: Set<number>;
  isAlive: boolean;
}

export class RoomManager {
  private readonly sessions = new Map<WebSocket, ClientSession>();
  private readonly characterPlayers = new Map<number, Set<WebSocket>>();
  private readonly characterSubscribers = new Map<number, Set<WebSocket>>();

  public registerSession(ws: WebSocket, userId?: number): ClientSession {
    const session: ClientSession = {
      ws,
      userId,
      subscribedCharacterIds: new Set<number>(),
      isAlive: true,
    };
    this.sessions.set(ws, session);
    return session;
  }

  public getSession(ws: WebSocket): ClientSession | undefined {
    return this.sessions.get(ws);
  }

  public getAllSessions(): IterableIterator<ClientSession> {
    return this.sessions.values();
  }

  public removeSession(ws: WebSocket): {
    session: ClientSession | undefined;
    wasLastPlayerSession: boolean;
    characterId?: number;
  } {
    const session = this.sessions.get(ws);
    this.sessions.delete(ws);

    let wasLastPlayerSession = false;
    const characterId = session?.characterId;

    if (characterId) {
      const sockets = this.characterPlayers.get(characterId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          this.characterPlayers.delete(characterId);
          wasLastPlayerSession = true;
        }
      }
    }

    if (session) {
      for (const subId of session.subscribedCharacterIds) {
        const subs = this.characterSubscribers.get(subId);
        if (subs) {
          subs.delete(ws);
          if (subs.size === 0) {
            this.characterSubscribers.delete(subId);
          }
        }
      }
    }

    return { session, wasLastPlayerSession, characterId };
  }

  public joinAsPlayer(characterId: number, ws: WebSocket): boolean {
    const session = this.sessions.get(ws);
    if (!session) return false;

    if (session.characterId !== undefined && session.characterId !== characterId) {
      const prevSockets = this.characterPlayers.get(session.characterId);
      if (prevSockets) {
        prevSockets.delete(ws);
        if (prevSockets.size === 0) {
          this.characterPlayers.delete(session.characterId);
        }
      }
    }

    session.characterId = characterId;
    let sockets = this.characterPlayers.get(characterId);
    if (!sockets) {
      sockets = new Set<WebSocket>();
      this.characterPlayers.set(characterId, sockets);
    }
    const isFirst = sockets.size === 0;
    sockets.add(ws);
    return isFirst;
  }

  public subscribeToCharacters(ws: WebSocket, characterIds: readonly number[]): void {
    const session = this.sessions.get(ws);
    if (!session) return;
    for (const id of characterIds) {
      if (Number.isInteger(id) && id > 0) {
        session.subscribedCharacterIds.add(id);
        let subs = this.characterSubscribers.get(id);
        if (!subs) {
          subs = new Set<WebSocket>();
          this.characterSubscribers.set(id, subs);
        }
        subs.add(ws);
      }
    }
  }

  public subscribeDM(ws: WebSocket, characterIds: readonly number[]): void {
    this.subscribeToCharacters(ws, characterIds);
  }

  public unsubscribeDM(ws: WebSocket, characterIds: readonly number[]): void {
    const session = this.sessions.get(ws);
    if (!session) return;
    for (const id of characterIds) {
      session.subscribedCharacterIds.delete(id);
      const subs = this.characterSubscribers.get(id);
      if (subs) {
        subs.delete(ws);
        if (subs.size === 0) {
          this.characterSubscribers.delete(id);
        }
      }
    }
  }

  public isCharacterOnline(characterId: number): boolean {
    const sockets = this.characterPlayers.get(characterId);
    return !!sockets && sockets.size > 0;
  }

  public getTargetSockets(characterId: number): WebSocket[] {
    const targetSet = new Set<WebSocket>();
    const players = this.characterPlayers.get(characterId);
    if (players) {
      for (const ws of players) targetSet.add(ws);
    }
    const subscribers = this.characterSubscribers.get(characterId);
    if (subscribers) {
      for (const ws of subscribers) targetSet.add(ws);
    }
    return Array.from(targetSet);
  }

  public getSubscribers(characterId: number): WebSocket[] {
    const subscribers = this.characterSubscribers.get(characterId);
    return subscribers ? Array.from(subscribers) : [];
  }
}
