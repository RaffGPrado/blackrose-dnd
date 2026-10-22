declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId = Brand<number, 'UserId'>;
export type CharacterId = Brand<number, 'CharacterId'>;
export type SpellId = Brand<number, 'SpellId'>;
export type ItemId = Brand<number, 'ItemId'>;
export type AttackId = Brand<number, 'AttackId'>;
export type FeatureId = Brand<number, 'FeatureId'>;
export type RaceId = Brand<number, 'RaceId'>;
export type ClassId = Brand<number, 'ClassId'>;

export function asUserId(id: number): UserId {
  return id as UserId;
}

export function asCharacterId(id: number): CharacterId {
  return id as CharacterId;
}

export function asSpellId(id: number): SpellId {
  return id as SpellId;
}
