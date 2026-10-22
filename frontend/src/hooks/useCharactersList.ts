import { useState, useEffect, useCallback } from 'react';
import { requestSafe } from '../services/api';
import type { CharacterCore } from '../types/dnd5e';

export interface UseCharactersListReturn {
  characters: CharacterCore[];
  loading: boolean;
  error: string;
  loadCharacters: () => Promise<void>;
  deleteCharacter: (id: number) => Promise<void>;
}

export function useCharactersList(): UseCharactersListReturn {
  const [characters, setCharacters] = useState<CharacterCore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    setError('');
    await requestSafe<{ characters: CharacterCore[] }>('/characters').match(
      (res) => {
        setCharacters(res.characters ?? []);
      },
      () => {
        setError('Falha ao carregar fichas de personagens');
      }
    );
    setLoading(false);
  }, []);

  const deleteCharacter = async (id: number) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    await requestSafe(`/characters/${id}`, { method: 'DELETE' }).match(
      () => {},
      () => {
        setError('Falha ao deletar personagem');
      }
    );
  };

  useEffect(() => {
    void loadCharacters();
  }, [loadCharacters]);

  return {
    characters,
    loading,
    error,
    loadCharacters,
    deleteCharacter,
  };
}
