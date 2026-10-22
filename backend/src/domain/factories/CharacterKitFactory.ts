export interface KitItem {
  name: string;
  quantity: number;
  weight: number;
  effect: string;
  equipped: number;
}

export interface KitFeature {
  name: string;
  description: string;
  uses_max: number;
  uses_current: number;
}

export interface KitSpellSlot {
  slot_level: number;
  max_slots: number;
}

export interface KitAttack {
  name: string;
  bonus: string;
  damage_type: string;
}

export interface CharacterKitFactory {
  createEquipment(): KitItem[];
  createFeatures(): KitFeature[];
  createSpellSlots(level: number): KitSpellSlot[];
  createAttacks(): KitAttack[];
}
