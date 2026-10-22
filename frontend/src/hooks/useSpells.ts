import { useState, useEffect, useCallback } from 'react';
import { requestSafe } from '../services/api';
import type { SpellCard, SpellsResponse, SchoolsResponse } from '../types/dnd5e';

export interface UseSpellsFilter {
  level?: number | string;
  school?: string;
  search?: string;
}

export interface UseSpellsReturn {
  spells: SpellCard[];
  schools: string[];
  total: number;
  loading: boolean;
  error: string;
  filters: UseSpellsFilter;
  setFilters: React.Dispatch<React.SetStateAction<UseSpellsFilter>>;
  loadSpells: () => Promise<void>;
  addSpellToGrimoire: (characterId: number, spellId: number) => Promise<void>;
  removeSpellFromGrimoire: (characterId: number, spellId: number) => Promise<void>;
}

export function useSpells(initialFilters: UseSpellsFilter = {}): UseSpellsReturn {
  const [spells, setSpells] = useState<SpellCard[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<UseSpellsFilter>(initialFilters);

  useEffect(() => {
    void requestSafe<SchoolsResponse>('/spells/schools').match(
      (res) => setSchools(res.schools ?? []),
      () => {}
    );
  }, []);

  const loadSpells = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams();
    if (filters.level !== undefined && filters.level !== '') {
      query.set('level', String(filters.level));
    }
    if (filters.school) {
      query.set('school', filters.school);
    }
    if (filters.search) {
      query.set('search', filters.search);
    }
    const qs = query.toString();

    await requestSafe<SpellsResponse>(`/spells${qs ? `?${qs}` : ''}`).match(
      (data) => {
        setSpells(data.spells ?? []);
        setTotal(data.total ?? 0);
      },
      () => {
        setError('Falha ao buscar magias');
      }
    );
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void loadSpells();
  }, [loadSpells]);

  const addSpellToGrimoire = async (characterId: number, spellId: number) => {
    await requestSafe(`/spells/character/${characterId}/spells`, {
      method: 'POST',
      body: JSON.stringify({ spell_id: spellId }),
    }).match(
      () => {},
      () => {
        setError('Falha ao adicionar magia ao grimório');
      }
    );
  };

  const removeSpellFromGrimoire = async (characterId: number, spellId: number) => {
    await requestSafe(`/spells/character/${characterId}/spells/${spellId}`, {
      method: 'DELETE',
    }).match(
      () => {},
      () => {
        setError('Falha ao remover magia do grimório');
      }
    );
  };

  return {
    spells,
    schools,
    total,
    loading,
    error,
    filters,
    setFilters,
    loadSpells,
    addSpellToGrimoire,
    removeSpellFromGrimoire,
  };
}
