import { db } from '../../config/db.js';
import { eq, like, and, asc, sql } from 'drizzle-orm';
import { spells, characterSpells, characters } from '../../config/schema.js';
import type { ISpellsRepository } from '../../domain/spells/ISpellsRepository.js';
import type { SpellCard } from '../../types/dnd5e.js';

function toSpellCard(row: typeof spells.$inferSelect): SpellCard {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    school: row.school,
    image_filename: row.imageFilename,
    image_path: row.imagePath,
    image_url: row.imagePath,
    casting_time: row.castingTime ?? undefined,
    range: row.range ?? undefined,
  };
}

export const spellsRepository: ISpellsRepository = {
  findSpells(level?: string, school?: string, search?: string): SpellCard[] {
    const conditions = [];

    if (level !== undefined && level !== '') {
      conditions.push(eq(spells.level, Number(level)));
    }

    if (school && school !== 'All') {
      conditions.push(eq(spells.school, school));
    }

    if (search && search.trim()) {
      conditions.push(like(spells.name, `%${search.trim()}%`));
    }

    const q = db.select().from(spells);
    if (conditions.length > 0) {
      q.where(and(...conditions));
    }

    const rows = q.orderBy(asc(spells.level), asc(spells.name)).all();

    return rows.map(toSpellCard);
  },

  getSchools(): string[] {
    const rows = db
      .selectDistinct({ school: spells.school })
      .from(spells)
      .where(sql`${spells.school} IS NOT NULL`)
      .orderBy(asc(spells.school))
      .all();
    return rows.map((r) => r.school);
  },

  addSpellToCharacter(characterId: number, userId: number, spellId: number) {
    const char = db
      .select({ id: characters.id })
      .from(characters)
      .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
      .get();
    if (!char) {
      return { error: 'Character not found', status: 404 };
    }

    const spell = db.select().from(spells).where(eq(spells.id, spellId)).get();
    if (!spell) {
      return { error: 'Spell not found', status: 404 };
    }

    const existing = db
      .select()
      .from(characterSpells)
      .where(and(eq(characterSpells.characterId, characterId), eq(characterSpells.spellId, spellId)))
      .get();
    if (existing) {
      return { changes: 0, spell: toSpellCard(spell) };
    }

    const result = db
      .insert(characterSpells)
      .values({
        characterId,
        spellId,
      })
      .run();

    return {
      changes: Number(result.changes),
      spell: toSpellCard(spell),
    };
  },

  removeSpellFromCharacter(characterId: number, userId: number, spellId: number) {
    const char = db
      .select({ id: characters.id })
      .from(characters)
      .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
      .get();
    if (!char) {
      return { error: 'Character not found', status: 404 };
    }

    const result = db
      .delete(characterSpells)
      .where(and(eq(characterSpells.characterId, characterId), eq(characterSpells.spellId, spellId)))
      .run();
    return { changes: Number(result.changes) };
  },
};
