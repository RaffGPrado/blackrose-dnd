import { db } from '../../config/db.js';
import { eq, like, or, and, lte, asc } from 'drizzle-orm';
import { referenceItems, referenceFeatures } from '../../config/schema.js';
import type { IReferenceRepository } from '../../domain/reference/IReferenceRepository.js';
import type { ReferenceItem, ReferenceFeature } from '../../types/dnd5e.js';

export const referenceRepository: IReferenceRepository = {
  findItems(search?: string, category?: string): ReferenceItem[] {
    const conditions = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(or(like(referenceItems.name, term), like(referenceItems.description, term)));
    }

    if (category && category.trim() && category !== 'Todas') {
      conditions.push(like(referenceItems.category, `%${category.trim()}%`));
    }

    const q = db.select().from(referenceItems);
    if (conditions.length > 0) {
      q.where(and(...conditions));
    }

    const items = q.orderBy(asc(referenceItems.category), asc(referenceItems.name)).all();

    return items.map((i): ReferenceItem => ({
      id: i.id,
      name: i.name,
      category: i.category,
      weight: i.weight ?? 0,
      cost: i.cost,
      damage: i.damage,
      armor_class: i.armorClass,
      properties: i.properties,
      description: i.description ?? '',
    }));
  },

  findFeatures(search?: string, className?: string, sourceType?: string, level?: string): ReferenceFeature[] {
    const conditions = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(or(like(referenceFeatures.name, term), like(referenceFeatures.description, term)));
    }

    if (className && className.trim() && className !== 'Todas') {
      const cls = className.trim();
      conditions.push(or(like(referenceFeatures.className, `%${cls}%`), eq(referenceFeatures.className, 'Geral')));
    }

    if (sourceType && sourceType.trim() && sourceType !== 'Todos') {
      conditions.push(eq(referenceFeatures.sourceType, sourceType.trim()));
    }

    if (level && !isNaN(Number(level))) {
      conditions.push(lte(referenceFeatures.level, Number(level)));
    }

    const q = db.select().from(referenceFeatures);
    if (conditions.length > 0) {
      q.where(and(...conditions));
    }

    const features = q
      .orderBy(asc(referenceFeatures.sourceType), asc(referenceFeatures.level), asc(referenceFeatures.name))
      .all();

    return features.map((f): ReferenceFeature => ({
      id: f.id,
      name: f.name,
      source_type: f.sourceType === 'Talento' ? 'Talento' : 'Classe',
      class_name: f.className,
      level: f.level ?? 1,
      uses_max: f.usesMax ?? 0,
      recovery: f.recovery ?? 'Passivo',
      description: f.description ?? '',
    }));
  },

  getCategories(): { item_categories: string[]; classes: string[] } {
    const categoriesRows = db
      .selectDistinct({ category: referenceItems.category })
      .from(referenceItems)
      .orderBy(asc(referenceItems.category))
      .all();
    const classesRows = db
      .selectDistinct({ class_name: referenceFeatures.className })
      .from(referenceFeatures)
      .orderBy(asc(referenceFeatures.className))
      .all();

    return {
      item_categories: categoriesRows.map((c) => c.category),
      classes: classesRows.map((c) => c.class_name).filter((c): c is string => Boolean(c)),
    };
  },
};
