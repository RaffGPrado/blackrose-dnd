import { useState, useEffect, useRef, useCallback } from 'react';
import { Result } from 'neverthrow';
import { requestSafe } from '../services/api';
import type { DMRosterItem, DND5eCondition } from '../types/dnd5e';
import {
  ClientWebSocketMessage,
  isServerWebSocketMessage,
  assertNever,
} from '../types/websocket';
import { compareByInitiative } from '../utils/dnd';

export interface UseDMConnectionReturn {
  roster: DMRosterItem[];
  watchedIds: number[];
  connected: boolean;
  loading: boolean;
  error: string;
  activeTurnId: number | null;
  toggleWatched: (characterId: number) => void;
  adjustHp: (characterId: number, delta: number) => Promise<void>;
  adjustTempHp: (characterId: number, delta: number) => Promise<void>;
  toggleCondition: (characterId: number, condition: DND5eCondition) => Promise<void>;
  setInitiative: (characterId: number, val: number | null) => Promise<void>;
  sortInitiative: () => void;
  advanceTurn: () => void;
  setActiveTurnId: (id: number | null) => void;
  refreshRoster: () => Promise<void>;
}

const safeJsonParse = Result.fromThrowable(
  (raw: string): unknown => JSON.parse(raw),
  (e) => e
);

export function useDMConnection(): UseDMConnectionReturn {
  const [roster, setRoster] = useState<DMRosterItem[]>([]);
  const [watchedIds, setWatchedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('black_rose_dm_watched');
    if (!saved) return [];
    return safeJsonParse(saved).match(
      (parsed) => (Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : []),
      () => []
    );
  });
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTurnId, setActiveTurnId] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchedIdsRef = useRef<number[]>(watchedIds);
  watchedIdsRef.current = watchedIds;

  const saveWatchedIds = (ids: number[]) => {
    setWatchedIds(ids);
    Result.fromThrowable(
      () => localStorage.setItem('black_rose_dm_watched', JSON.stringify(ids)),
      (e) => e
    )();
  };

  const refreshRoster = useCallback(async () => {
    setError('');
    await requestSafe<{ roster: DMRosterItem[] }>('/characters/dm/roster').match(
      (data) => {
        setRoster(data.roster ?? []);
      },
      () => {
        setError('Falha ao carregar fichas para o DM');
      }
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshRoster();
  }, [refreshRoster]);

  useEffect(() => {
    let isSubscribed = true;

    const sendClientMessage = (msg: ClientWebSocketMessage) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(msg));
      }
    };

    const connectWS = () => {
      if (!isSubscribed) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const token = localStorage.getItem('black_rose_token') || '';
      const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isSubscribed) return;
        setConnected(true);

        if (watchedIdsRef.current.length > 0) {
          sendClientMessage({
            type: 'subscribe',
            characterIds: watchedIdsRef.current,
          });
        }
      };

      ws.onmessage = (event) => {
        if (!isSubscribed || typeof event.data !== 'string') return;
        const parsedResult = safeJsonParse(event.data);
        if (parsedResult.isErr() || !isServerWebSocketMessage(parsedResult.value)) return;
        const parsed = parsedResult.value;

        switch (parsed.type) {
          case 'patch': {
            setRoster((prev) =>
              prev.map((char) =>
                char.id === parsed.characterId ? { ...char, ...parsed.patch } : char
              )
            );
            break;
          }

          case 'presence': {
            setRoster((prev) =>
              prev.map((char) =>
                char.id === parsed.characterId ? { ...char, online: parsed.online } : char
              )
            );
            break;
          }

          case 'connected':
          case 'auth:ok':
          case 'auth:error':
          case 'subscribed':
          case 'pong':
            break;

          default:
            assertNever(parsed);
        }
      };

      ws.onclose = () => {
        if (!isSubscribed) return;
        setConnected(false);
        reconnectTimeoutRef.current = setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const toggleWatched = (characterId: number) => {
    const isWatched = watchedIds.includes(characterId);
    const newWatched = isWatched
      ? watchedIds.filter((id) => id !== characterId)
      : [...watchedIds, characterId];

    saveWatchedIds(newWatched);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg: ClientWebSocketMessage = isWatched
        ? { type: 'unsubscribe', characterIds: [characterId] }
        : { type: 'subscribe', characterIds: [characterId] };
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const adjustHp = async (characterId: number, delta: number) => {
    const char = roster.find((c) => c.id === characterId);
    if (!char) return;

    const newHp = Math.max(0, Math.min(char.max_hp, char.current_hp + delta));
    if (newHp === char.current_hp) return;

    setRoster((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, current_hp: newHp } : c))
    );

    await requestSafe(`/characters/dm/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ current_hp: newHp }),
    }).match(
      () => {},
      () => refreshRoster()
    );
  };

  const adjustTempHp = async (characterId: number, delta: number) => {
    const char = roster.find((c) => c.id === characterId);
    if (!char) return;

    const newTemp = Math.max(0, (char.temp_hp || 0) + delta);
    setRoster((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, temp_hp: newTemp } : c))
    );

    await requestSafe(`/characters/dm/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ temp_hp: newTemp }),
    }).match(
      () => {},
      () => refreshRoster()
    );
  };

  const toggleCondition = async (characterId: number, condition: DND5eCondition) => {
    const char = roster.find((c) => c.id === characterId);
    if (!char) return;

    const activeConditions = char.conditions
      ? safeJsonParse(char.conditions).match(
          (parsed) => (Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []),
          () => []
        )
      : [];

    const exists = activeConditions.includes(condition);
    const updated = exists
      ? activeConditions.filter((c) => c !== condition)
      : [...activeConditions, condition];

    const jsonConditions = JSON.stringify(updated);

    setRoster((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, conditions: jsonConditions } : c))
    );

    await requestSafe(`/characters/dm/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ conditions: jsonConditions }),
    }).match(
      () => {},
      () => refreshRoster()
    );
  };

  const setInitiative = async (characterId: number, val: number | null) => {
    setRoster((prev) =>
      prev.map((c) => (c.id === characterId ? { ...c, current_initiative: val } : c))
    );

    await requestSafe(`/characters/dm/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ current_initiative: val }),
    }).match(
      () => {},
      () => refreshRoster()
    );
  };

  const sortInitiative = () => {
    setRoster((prev) => [...prev].sort(compareByInitiative));
  };

  const advanceTurn = () => {
    const watched = roster.filter((c) => watchedIds.includes(c.id));
    if (watched.length === 0) return;

    const sorted = [...watched].sort(compareByInitiative);

    const currentIndex = sorted.findIndex((c) => c.id === activeTurnId);
    const nextIndex = currentIndex === -1 || currentIndex === sorted.length - 1 ? 0 : currentIndex + 1;
    const nextCharacter = sorted[nextIndex];
    if (nextCharacter) {
      setActiveTurnId(nextCharacter.id);
    }
  };

  return {
    roster,
    watchedIds,
    connected,
    loading,
    error,
    activeTurnId,
    toggleWatched,
    adjustHp,
    adjustTempHp,
    toggleCondition,
    setInitiative,
    sortInitiative,
    advanceTurn,
    setActiveTurnId,
    refreshRoster,
  };
}
