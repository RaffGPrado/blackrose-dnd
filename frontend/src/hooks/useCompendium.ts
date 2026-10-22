import { useState, useEffect, useMemo } from 'react';
import { Result } from 'neverthrow';
import { api } from '../services/api';
import type { ReferenceItem, ReferenceFeature } from '../types/dnd5e';

const ITEMS_CACHE_KEY = 'black_rose_compendium_items_v2';
const FEATURES_CACHE_KEY = 'black_rose_compendium_features_v2';

export function useCompendiumItems() {
  const [items, setItems] = useState<ReferenceItem[]>(() => {
    const cached = localStorage.getItem(ITEMS_CACHE_KEY);
    if (!cached) return [];
    return Result.fromThrowable(
      () => JSON.parse(cached) as ReferenceItem[],
      () => [] as ReferenceItem[]
    )().unwrapOr([]);
  });

  const [loading, setLoading] = useState(items.length === 0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  useEffect(() => {
    if (items.length > 0) return;

    let isMounted = true;
    api.getReferenceItems({ category: undefined })
      .then((data) => {
        if (!isMounted) return;
        setItems(data.items);
        setLoading(false);
        Result.fromThrowable(
          () => localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(data.items)),
          () => undefined
        )();
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [items.length]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of items) {
      if (item.category) cats.add(item.category);
    }
    return ['Todas', ...Array.from(cats).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [items, search, selectedCategory]);

  return {
    items: filteredItems,
    allItems: items,
    categories,
    loading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
  };
}

export function useCompendiumFeatures() {
  const [features, setFeatures] = useState<ReferenceFeature[]>(() => {
    const cached = localStorage.getItem(FEATURES_CACHE_KEY);
    if (!cached) return [];
    return Result.fromThrowable(
      () => JSON.parse(cached) as ReferenceFeature[],
      () => [] as ReferenceFeature[]
    )().unwrapOr([]);
  });

  const [loading, setLoading] = useState(features.length === 0);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('Todas');
  const [selectedSourceType, setSelectedSourceType] = useState('Todos');

  useEffect(() => {
    if (features.length > 0) return;

    let isMounted = true;
    api.getReferenceFeatures()
      .then((data) => {
        if (!isMounted) return;
        setFeatures(data.features);
        setLoading(false);
        Result.fromThrowable(
          () => localStorage.setItem(FEATURES_CACHE_KEY, JSON.stringify(data.features)),
          () => undefined
        )();
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [features.length]);

  const classes = useMemo(() => {
    const cls = new Set<string>();
    for (const feat of features) {
      if (feat.class_name) cls.add(feat.class_name);
    }
    return ['Todas', ...Array.from(cls).sort()];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    const q = search.trim().toLowerCase();
    return features.filter((feat) => {
      const matchesClass = selectedClass === 'Todas' || feat.class_name === selectedClass;
      const matchesSource = selectedSourceType === 'Todos' || feat.source_type === selectedSourceType;
      const matchesSearch = !q || feat.name.toLowerCase().includes(q) || (feat.description && feat.description.toLowerCase().includes(q));
      return matchesClass && matchesSource && matchesSearch;
    });
  }, [features, search, selectedClass, selectedSourceType]);

  return {
    features: filteredFeatures,
    allFeatures: features,
    classes,
    loading,
    search,
    setSearch,
    selectedClass,
    setSelectedClass,
    selectedSourceType,
    setSelectedSourceType,
  };
}
