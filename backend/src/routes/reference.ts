import express, { Request, Response } from 'express';
import { Result } from 'neverthrow';
import { referenceRepository } from '../infrastructure/database/SqliteReferenceRepository.js';

const router = express.Router();

router.get('/items', (req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => {
      const { search, category } = req.query as { search?: string; category?: string };
      return referenceRepository.findItems(search, category);
    },
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Fetch reference items error:', result.error);
    res.status(500).json({ error: 'Failed to fetch reference items' });
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.json({ items: result.value, total: result.value.length });
});

router.get('/features', (req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => {
      const { search, class_name, source_type, level } = req.query as {
        search?: string;
        class_name?: string;
        source_type?: string;
        level?: string;
      };
      return referenceRepository.findFeatures(search, class_name, source_type, level);
    },
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Fetch reference features error:', result.error);
    res.status(500).json({ error: 'Failed to fetch reference features' });
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.json({ features: result.value, total: result.value.length });
});

router.get('/categories', (_req: Request, res: Response): void => {
  const result = Result.fromThrowable(
    () => referenceRepository.getCategories(),
    (error) => error
  )();

  if (result.isErr()) {
    console.error('Fetch reference categories error:', result.error);
    res.status(500).json({ error: 'Failed to fetch categories' });
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.json({ categories: result.value });
});
    item_categories: result.value.item_categories,
    classes: result.value.classes,
  });
});

export default router;
