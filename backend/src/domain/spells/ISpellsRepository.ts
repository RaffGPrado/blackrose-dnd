import type { SpellCard } from '../../types/dnd5e.js';

export interface ISpellsRepository {
  findSpells(level?: string, school?: string, search?: string): SpellCard[];
  getSchools(): string[];
  addSpellToCharacter(characterId: number, userId: number, spellId: number): { error?: string, status?: number, spell?: SpellCard, changes?: number };
  removeSpellFromCharacter(characterId: number, userId: number, spellId: number): { error?: string, status?: number, changes?: number };
}
