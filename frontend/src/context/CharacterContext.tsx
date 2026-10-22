import React, { createContext, useContext } from 'react';
import type { UseCharacterReturn } from '../hooks/useCharacter';

const CharacterContext = createContext<UseCharacterReturn | null>(null);

export const CharacterProvider: React.FC<{ value: UseCharacterReturn; children: React.ReactNode }> = ({ value, children }) => {
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export function useCharacterActions(): UseCharacterReturn {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacterActions must be used within CharacterProvider');
  }
  return ctx;
}
