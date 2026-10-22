import type {
  AbilityKey,
  AttackItem,
  CharacterCore,
  ClassFeature,
  InventoryItem,
  SkillKey,
  SpellCard,
  SpellSlot,
} from '../types/dnd5e';

export type CoinKey = 'coins_cp' | 'coins_sp' | 'coins_ep' | 'coins_gp' | 'coins_pp';

export interface GameEventMap {
  HP_ADJUSTED: { characterId: number; delta: number };
  TEMP_HP_ADJUSTED: { characterId: number; delta: number };
  HIT_DICE_ADJUSTED: { characterId: number; delta: number };
  DEATH_SAVE_TOGGLED: { characterId: number; saveType: 'success' | 'failure'; index: number };
  INSPIRATION_TOGGLED: { characterId: number };
  ATTACK_ADDED: { characterId: number; attack: Omit<AttackItem, 'id' | 'character_id'> };
  ATTACK_DELETED: { characterId: number; attackId: number };
  COIN_ADJUSTED: { characterId: number; coinKey: CoinKey; delta: number };
  ITEM_ADDED: { characterId: number; item: Omit<InventoryItem, 'id' | 'character_id'> };
  ITEM_DELETED: { characterId: number; itemId: number };
  LONG_REST: { characterId: number };
  CHARACTER_EDITED: { characterId: number; updates: Partial<CharacterCore> };
  SKILL_TOGGLED: { characterId: number; skillKey: SkillKey };
  SAVING_THROW_TOGGLED: { characterId: number; abilityKey: AbilityKey };
  FEATURE_ADDED: { characterId: number; feature: Omit<ClassFeature, 'id' | 'character_id'> };
  FEATURE_USAGE_ADJUSTED: { characterId: number; featureId: number; delta: number };
  FEATURE_DELETED: { characterId: number; featureId: number };
  SPELL_ADDED: { characterId: number; spell: SpellCard };
  SPELL_REMOVED: { characterId: number; spellId: number };
  SPELL_SLOT_TOGGLED: { characterId: number; slotLevel: number; currentUsed: number; circleIndex: number };
  SPELL_SLOTS_RESTORED: { characterId: number };
  SPELL_SLOTS_CONFIG_SAVED: { characterId: number; newSlots: SpellSlot[] };
  CHARACTER_UNCONSCIOUS: { characterId: number; name?: string };
  CONCENTRATION_CHECK_REQUIRED: { characterId: number; dc: number; damageTaken: number };
  DICE_ROLLED: { characterId?: number; formula: string; total: number; rolls: number[]; label?: string };
}

export type GameEventType = keyof GameEventMap;

export type GameEvent = {
  [K in GameEventType]: {
    readonly type: K;
    readonly payload: GameEventMap[K];
  };
}[GameEventType];

export type GameEventListener<K extends GameEventType> = (payload: GameEventMap[K]) => void | Promise<void>;

export class GameEventBus {
  private readonly listeners = new Map<GameEventType, Set<(payload: unknown) => void | Promise<void>>>();

  public subscribe<K extends GameEventType>(type: K, listener: GameEventListener<K>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    const wrapped = (payload: unknown) => listener(payload as GameEventMap[K]);
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
      if (set && set.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  public publish<K extends GameEventType>(event: { readonly type: K; readonly payload: GameEventMap[K] }): void;
  public publish<K extends GameEventType>(type: K, payload: GameEventMap[K]): void;
  public publish<K extends GameEventType>(
    eventOrType: { readonly type: K; readonly payload: GameEventMap[K] } | K,
    maybePayload?: GameEventMap[K]
  ): void {
    const type = typeof eventOrType === 'string' ? eventOrType : eventOrType.type;
    const payload = typeof eventOrType === 'string' ? (maybePayload as GameEventMap[K]) : eventOrType.payload;
    const set = this.listeners.get(type);
    if (!set) return;
    for (const listener of Array.from(set)) {
      void listener(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const gameEventBus = new GameEventBus();
