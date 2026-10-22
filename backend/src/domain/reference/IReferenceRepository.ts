import type { ReferenceItem, ReferenceFeature } from '../../types/dnd5e.js';

export interface IReferenceRepository {
  findItems(search?: string, category?: string): ReferenceItem[];
  findFeatures(search?: string, className?: string, sourceType?: string, level?: string): ReferenceFeature[];
  getCategories(): { item_categories: string[]; classes: string[] };
}
