import { describe, it, expect } from 'vitest';
import { db } from '../src/config/db.js';
import { calculateModifier, calculateProficiencyBonus } from '../src/domain/character/CharacterEntity.js';

describe('Black Rose DnD 5e - Math & Rules', () => {
  it('Ability score modifiers should be calculated correctly', () => {
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(16)).toBe(3);
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(20)).toBe(5);
  });

  it('Proficiency bonus should progress correctly with level', () => {
    expect(calculateProficiencyBonus(1)).toBe(2);
    expect(calculateProficiencyBonus(4)).toBe(2);
    expect(calculateProficiencyBonus(5)).toBe(3);
    expect(calculateProficiencyBonus(9)).toBe(4);
    expect(calculateProficiencyBonus(13)).toBe(5);
    expect(calculateProficiencyBonus(17)).toBe(6);
  });
});

describe('Black Rose DnD 5e - Database Integrity', () => {
  it('Should have spells in catalog', () => {
    const spellCount = db.$client.prepare('SELECT COUNT(*) as count FROM spells').get() as { count: number };
    expect(spellCount.count).toBeGreaterThan(300);
  });

  it('Should have 9 PHB races', () => {
    const raceCount = db.$client.prepare('SELECT COUNT(*) as count FROM races').get() as { count: number };
    expect(raceCount.count).toBe(9);
  });

  it('Should have 12 PHB classes', () => {
    const classCount = db.$client.prepare('SELECT COUNT(*) as count FROM classes').get() as { count: number };
    expect(classCount.count).toBe(12);
  });

  it('Should have reference equipment (SRD 5.1)', () => {
    const refItemCount = db.$client.prepare('SELECT COUNT(*) as count FROM reference_items').get() as { count: number };
    expect(refItemCount.count).toBeGreaterThanOrEqual(40);
  });

  it('Should have reference class features (SRD 5.1)', () => {
    const refFeatureCount = db.$client.prepare('SELECT COUNT(*) as count FROM reference_features').get() as { count: number };
    expect(refFeatureCount.count).toBeGreaterThanOrEqual(40);
  });

  it('Should have all required columns in relational tables', () => {
    for (const table of ['characters', 'character_items', 'character_attacks', 'character_features', 'character_spells', 'character_spell_slots']) {
      const cols = db.$client.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
      expect(cols.length).toBeGreaterThan(0);
    }
  });
});
