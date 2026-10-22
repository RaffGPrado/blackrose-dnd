import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/config/db.js';
import { users } from '../src/config/schema.js';
import { sqliteCharacterRepository } from '../src/infrastructure/database/SqliteCharacterRepository.js';

describe('SqliteCharacterRepository - Data Operations & Rules', () => {
  let testUserId: number;

  beforeAll(() => {
    const existing = db.$client
      .prepare('SELECT id FROM users LIMIT 1')
      .get() as { id: number } | undefined;

    if (existing) {
      testUserId = existing.id;
    } else {
      const inserted = db.$client
        .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
        .run('test_hero', 'secret123', 'player');
      testUserId = Number(inserted.lastInsertRowid);
    }
  });

  it('should fetch meta options with races and classes', () => {
    const result = sqliteCharacterRepository.getMetaOptions();
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const { races, classes } = result.value;
      expect(Array.isArray(races)).toBe(true);
      expect(Array.isArray(classes)).toBe(true);
      expect(races.length).toBeGreaterThan(0);
      expect(classes.length).toBeGreaterThan(0);
    }
  });

  it('should create a character and compute derived stats', () => {
    const result = sqliteCharacterRepository.create({
      userId: testUserId,
      name: 'Eldrin de Valença',
      level: 3,
      max_hp: 24,
      armor_class: 15,
      strength: 10,
      dexterity: 16,
      constitution: 14,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });

    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      const char = result.value;
      expect(char.name).toBe('Eldrin de Valença');
      expect(char.level).toBe(3);
      expect(char.proficiency_bonus).toBe(2);
      expect(char.modifiers.dexterity).toBe(3);
      expect(char.modifiers.constitution).toBe(2);
      expect(char.modifiers.charisma).toBe(-1);
    }
  });

  it('should retrieve full character detail and items', () => {
    const created = sqliteCharacterRepository.create({
      userId: testUserId,
      name: 'Lyra Shadowmend',
      level: 1,
      max_hp: 12,
    });

    expect(created.isOk()).toBe(true);
    if (!created.isOk()) return;

    const charId = created.value.id;

    const detailResult = sqliteCharacterRepository.findDetailById(charId, testUserId);
    expect(detailResult.isOk()).toBe(true);

    if (detailResult.isOk()) {
      const detail = detailResult.value;
      expect(detail).not.toBeNull();
      expect(detail?.character.id).toBe(charId);
      expect(Array.isArray(detail?.items)).toBe(true);
      expect(Array.isArray(detail?.attacks)).toBe(true);
      expect(Array.isArray(detail?.features)).toBe(true);
    }
  });

  it('should toggle skill proficiency and update skill bonus', () => {
    const created = sqliteCharacterRepository.create({
      userId: testUserId,
      name: 'Rogue Test',
      level: 1,
      dexterity: 14,
    });
    expect(created.isOk()).toBe(true);
    if (!created.isOk()) return;

    const charId = created.value.id;

    const toggled = sqliteCharacterRepository.toggleSkill(charId, 'stealth');
    expect(toggled.isOk()).toBe(true);

    if (toggled.isOk()) {
      const stealthSkill = toggled.value.skills.stealth;
      expect(stealthSkill.proficient).toBe(true);
      expect(stealthSkill.modifier).toBe(4);
    }

    const toggledBack = sqliteCharacterRepository.toggleSkill(charId, 'stealth');
    expect(toggledBack.isOk()).toBe(true);
    if (toggledBack.isOk()) {
      const stealthSkill = toggledBack.value.skills.stealth;
      expect(stealthSkill.proficient).toBe(false);
      expect(stealthSkill.modifier).toBe(2);
    }
  });

  it('should perform a long rest: restore HP and reset spell slots', () => {
    const created = sqliteCharacterRepository.create({
      userId: testUserId,
      name: 'Cleric of Dawn',
      level: 2,
      max_hp: 18,
    });
    expect(created.isOk()).toBe(true);
    if (!created.isOk()) return;

    const charId = created.value.id;

    sqliteCharacterRepository.update(charId, testUserId, {
      current_hp: 4,
      temp_hp: 5,
      death_failures: 2,
    });

    sqliteCharacterRepository.setSpellSlots(charId, [
      { slot_level: 1, max_slots: 3 },
    ]);
    sqliteCharacterRepository.updateSpellSlot(charId, 1, { used_slots: 2 });

    const restResult = sqliteCharacterRepository.longRest(charId, testUserId);
    expect(restResult.isOk()).toBe(true);

    const refreshed = sqliteCharacterRepository.findDetailById(charId, testUserId);
    expect(refreshed.isOk()).toBe(true);
    if (refreshed.isOk() && refreshed.value) {
      expect(refreshed.value.character.current_hp).toBe(18);
      expect(refreshed.value.character.temp_hp).toBe(0);
      expect(refreshed.value.character.death_failures).toBe(0);

      const slot1 = refreshed.value.spell_slots.find((s) => s.slot_level === 1);
      expect(slot1?.used_slots).toBe(0);
    }
  });

  it('should return roster for DM view', () => {
    const result = sqliteCharacterRepository.findAllForDM();
    expect(result.isOk()).toBe(true);

    if (result.isOk()) {
      expect(Array.isArray(result.value)).toBe(true);
      expect(result.value.length).toBeGreaterThan(0);
      const first = result.value[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('current_hp');
      expect(first).toHaveProperty('max_hp');
      expect(first).toHaveProperty('conditions');
    }
  });
});
