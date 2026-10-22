import { ResultAsync } from 'neverthrow';
import type {
  AuthResponse,
  UserProfile,
  MetaOptionsResponse,
  CharacterCore,
  CharacterDetailResponse,
  EnrichedCharacter,
  AttackItem,
  ClassFeature,
  InventoryItem,
  SpellSlot,
  SpellsResponse,
  SchoolsResponse,
  AbilityKey,
  SkillKey,
  SpellCard,
  DMRosterItem,
  ReferenceItem,
  ReferenceFeature,
} from '../types/dnd5e';

const API_BASE = '/api';

async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('black_rose_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('black_rose_token');
      localStorage.removeItem('black_rose_user');
    }
    throw new Error(data.error || 'Falha na requisição');
  }

  return data as T;
}

export function requestSafe<T = unknown>(endpoint: string, options: RequestInit = {}): ResultAsync<T, Error> {
  return ResultAsync.fromPromise(
    request<T>(endpoint, options),
    (e) => e instanceof Error ? e : new Error(String(e))
  );
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: (): Promise<{ user: UserProfile }> =>
    request<{ user: UserProfile }>('/auth/me'),

  // Metadata
  getOptions: (): Promise<MetaOptionsResponse> =>
    request<MetaOptionsResponse>('/characters/meta/options'),

  // Characters
  getCharacters: (): Promise<{ characters: CharacterCore[] }> =>
    request<{ characters: CharacterCore[] }>('/characters'),

  getCharacter: (id: number): Promise<CharacterDetailResponse> =>
    request<CharacterDetailResponse>(`/characters/${id}`),

  createCharacter: (charData: Partial<CharacterCore>): Promise<{ message: string; character: EnrichedCharacter }> =>
    request<{ message: string; character: EnrichedCharacter }>('/characters', {
      method: 'POST',
      body: JSON.stringify(charData),
    }),

  updateCharacter: (id: number, updates: Partial<CharacterCore>): Promise<{ character: EnrichedCharacter }> =>
    request<{ character: EnrichedCharacter }>(`/characters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteCharacter: (id: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/characters/${id}`, {
      method: 'DELETE',
    }),

  longRest: (id: number): Promise<{ message: string; character: EnrichedCharacter }> =>
    request<{ message: string; character: EnrichedCharacter }>(`/characters/${id}/long-rest`, {
      method: 'POST',
    }),

  // DM Dashboard
  getDMRoster: (): Promise<{ roster: DMRosterItem[] }> =>
    request<{ roster: DMRosterItem[] }>('/characters/dm/roster'),

  updateCharacterAsDM: (id: number, updates: Partial<DMRosterItem>): Promise<{ character: EnrichedCharacter }> =>
    request<{ character: EnrichedCharacter }>(`/characters/dm/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Skills & Saving Throws
  toggleSkill: (characterId: number, skillKey: SkillKey): Promise<{ skills: EnrichedCharacter['skills'] }> =>
    request<{ skills: EnrichedCharacter['skills'] }>(`/characters/${characterId}/skills/toggle`, {
      method: 'POST',
      body: JSON.stringify({ skill_key: skillKey }),
    }),

  toggleSavingThrow: (characterId: number, abilityKey: AbilityKey): Promise<{ saving_throws: EnrichedCharacter['saving_throws'] }> =>
    request<{ saving_throws: EnrichedCharacter['saving_throws'] }>(`/characters/${characterId}/saving-throws/toggle`, {
      method: 'POST',
      body: JSON.stringify({ ability_key: abilityKey }),
    }),

  // Spell Slots
  updateSpellSlot: (characterId: number, slotLevel: number, updates: { used_slots?: number; max_slots?: number }): Promise<{ slot: SpellSlot }> =>
    request<{ slot: SpellSlot }>(`/characters/${characterId}/spell-slots/${slotLevel}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Attacks
  addAttack: (characterId: number, attack: Omit<AttackItem, 'id' | 'character_id'>): Promise<{ attack: AttackItem }> =>
    request<{ attack: AttackItem }>(`/characters/${characterId}/attacks`, {
      method: 'POST',
      body: JSON.stringify(attack),
    }),

  deleteAttack: (characterId: number, attackId: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/characters/${characterId}/attacks/${attackId}`, {
      method: 'DELETE',
    }),

  // Features & Traits
  addFeature: (characterId: number, feature: Omit<ClassFeature, 'id' | 'character_id'>): Promise<{ feature: ClassFeature }> =>
    request<{ feature: ClassFeature }>(`/characters/${characterId}/features`, {
      method: 'POST',
      body: JSON.stringify(feature),
    }),

  updateFeature: (characterId: number, featureId: number, updates: Partial<ClassFeature>): Promise<{ feature: ClassFeature }> =>
    request<{ feature: ClassFeature }>(`/characters/${characterId}/features/${featureId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteFeature: (characterId: number, featureId: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/characters/${characterId}/features/${featureId}`, {
      method: 'DELETE',
    }),

  // Items / Inventory
  addItem: (characterId: number, item: Omit<InventoryItem, 'id' | 'character_id'>): Promise<{ item: InventoryItem }> =>
    request<{ item: InventoryItem }>(`/characters/${characterId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateItem: (characterId: number, itemId: number, updates: Partial<InventoryItem>): Promise<{ item: InventoryItem }> =>
    request<{ item: InventoryItem }>(`/characters/${characterId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteItem: (characterId: number, itemId: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/characters/${characterId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  getSpells: (params: Record<string, string | number | undefined> = {}): Promise<SpellsResponse> => {
    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleanParams[key] = String(value);
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<SpellsResponse>(`/spells${query ? `?${query}` : ''}`);
  },

  getSchools: (): Promise<SchoolsResponse> =>
    request<SchoolsResponse>('/spells/schools'),

  addSpellToGrimoire: (characterId: number, spellId: number): Promise<{ message: string; spell: SpellCard }> =>
    request<{ message: string; spell: SpellCard }>(`/spells/character/${characterId}/spells`, {
      method: 'POST',
      body: JSON.stringify({ spell_id: spellId }),
    }),

  removeSpellFromGrimoire: (characterId: number, spellId: number): Promise<{ message: string }> =>
    request<{ message: string }>(`/spells/character/${characterId}/spells/${spellId}`, {
      method: 'DELETE',
    }),

  // Compendium Reference (SRD 5.1 PT-BR 2014)
  getReferenceItems: (params: { search?: string; category?: string } = {}): Promise<{ items: ReferenceItem[]; total: number }> => {
    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleanParams[key] = String(value);
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<{ items: ReferenceItem[]; total: number }>(`/reference/items${query ? `?${query}` : ''}`);
  },

  getReferenceFeatures: (params: { search?: string; class_name?: string; source_type?: string; level?: number } = {}): Promise<{ features: ReferenceFeature[]; total: number }> => {
    const cleanParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleanParams[key] = String(value);
      }
    }
    const query = new URLSearchParams(cleanParams).toString();
    return request<{ features: ReferenceFeature[]; total: number }>(`/reference/features${query ? `?${query}` : ''}`);
  },

  getReferenceCategories: (): Promise<{ item_categories: string[]; classes: string[] }> =>
    request<{ item_categories: string[]; classes: string[] }>('/reference/categories'),
};
