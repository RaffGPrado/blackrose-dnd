import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { ResultAsync } from 'neverthrow';
import type { CharacterCore, CharacterDetailResponse } from '../types/dnd5e';

export interface PendingMutation {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  characterId?: number;
  timestamp?: number;
}

interface BlackRoseOfflineDB extends DBSchema {
  characters: {
    key: number;
    value: CharacterDetailResponse;
  };
  characters_list: {
    key: string;
    value: CharacterCore[];
  };
  mutation_queue: {
    key: number;
    value: PendingMutation;
  };
}

let dbPromise: Promise<IDBPDatabase<BlackRoseOfflineDB>> | null = null;

function getDb(): Promise<IDBPDatabase<BlackRoseOfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BlackRoseOfflineDB>('black-rose-offline-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('characters')) {
          db.createObjectStore('characters');
        }
        if (!db.objectStoreNames.contains('characters_list')) {
          db.createObjectStore('characters_list');
        }
        if (!db.objectStoreNames.contains('mutation_queue')) {
          db.createObjectStore('mutation_queue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function getCharacterLocally(characterId: number): Promise<CharacterDetailResponse | null> {
  return ResultAsync.fromPromise(
    getDb().then((db) => db.get('characters', characterId)),
    (e) => e
  ).match(
    (data) => data ?? null,
    () => null
  );
}

export async function saveCharacterLocally(detail: CharacterDetailResponse): Promise<void> {
  if (!detail?.character?.id) return;
  await ResultAsync.fromPromise(
    getDb().then((db) => db.put('characters', detail, detail.character.id)),
    (e) => e
  );
}

export async function removeCharacterLocally(characterId: number): Promise<void> {
  await ResultAsync.fromPromise(
    getDb().then((db) => db.delete('characters', characterId)),
    (e) => e
  );
}

export async function getCharactersListLocally(): Promise<CharacterCore[] | null> {
  return ResultAsync.fromPromise(
    getDb().then((db) => db.get('characters_list', 'roster')),
    (e) => e
  ).match(
    (data) => data ?? null,
    () => null
  );
}

export async function saveCharactersListLocally(characters: CharacterCore[]): Promise<void> {
  await ResultAsync.fromPromise(
    getDb().then((db) => db.put('characters_list', characters, 'roster')),
    (e) => e
  );
}

export async function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp'>): Promise<void> {
  await ResultAsync.fromPromise(
    getDb().then((db) =>
      db.add('mutation_queue', {
        ...mutation,
        timestamp: Date.now(),
      })
    ),
    (e) => e
  );
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  return ResultAsync.fromPromise(
    getDb().then((db) => db.getAll('mutation_queue')),
    (e) => e
  ).match(
    (items) => items,
    () => []
  );
}

export async function removeMutation(id: number): Promise<void> {
  await ResultAsync.fromPromise(
    getDb().then((db) => db.delete('mutation_queue', id)),
    (e) => e
  );
}
