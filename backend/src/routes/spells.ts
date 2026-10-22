import express, { Request, Response } from 'express';
import { Result } from 'neverthrow';
import { authenticateToken } from '../middleware/auth.js';
import { spellsRepository } from '../infrastructure/database/SqliteSpellsRepository.js';

const router = express.Router();

router.get('/', (req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => {
      const { level, school, search } = req.query as { level?: string; school?: string; search?: string };
      return spellsRepository.findSpells(level, school, search);
    },
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Fetch spells error:', result.error);
    res.status(500).json({ error: 'Failed to fetch spells' });
    return;
  }

  res.json({ spells: result.value, total: result.value.length });
});

router.get('/schools', (_req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => spellsRepository.getSchools(),
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Fetch schools error:', result.error);
    res.status(500).json({ error: 'Failed to fetch spell schools' });
    return;
  }

  res.json({ schools: result.value });
});

router.post('/character/:characterId/spells', authenticateToken, (req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => {
      const characterId = Number(req.params.characterId);
      const { spell_id } = req.body as { spell_id?: number };
      return { characterId, spell_id };
    },
    (error) => error
  )();

  if (result.isErr()) {
    res.status(500).json({ error: 'Failed to parse request parameters' });
    return;
  }

  const { characterId, spell_id } = result.value;

  if (!spell_id) {
    res.status(400).json({ error: 'spell_id is required' });
    return;
  }

  if (!req.user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const dbOpResult = Result.fromThrowable(
    () => spellsRepository.addSpellToCharacter(characterId, req.user!.id, spell_id),
    (error) => error
  )();

  if (dbOpResult.isErr()) {
    console.error('Add spell to grimoire error:', dbOpResult.error);
    res.status(500).json({ error: 'Failed to add spell to grimoire' });
    return;
  }

  if (dbOpResult.value.error) {
    res.status(dbOpResult.value.status || 500).json({ error: dbOpResult.value.error });
    return;
  }

  if (dbOpResult.value.changes === 0) {
    res.status(200).json({ message: 'Spell is already in grimoire', spell: dbOpResult.value.spell });
    return;
  }

  res.status(201).json({ message: 'Spell added to grimoire successfully', spell: dbOpResult.value.spell });
});

router.delete('/character/:characterId/spells/:spellId', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = Result.fromThrowable(
    () => {
      const characterId = Number(req.params.characterId);
      const spellId = Number(req.params.spellId);
      return spellsRepository.removeSpellFromCharacter(characterId, req.user!.id, spellId);
    },
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Remove spell from grimoire error:', result.error);
    res.status(500).json({ error: 'Failed to remove spell from grimoire' });
    return;
  }

  if (result.value.error) {
    res.status(result.value.status || 500).json({ error: result.value.error });
    return;
  }

  if (result.value.changes === 0) {
    res.status(404).json({ error: 'Spell not found in character grimoire' });
    return;
  }

  res.json({ message: 'Spell removed from grimoire successfully' });
});

export default router;
