import { CharacterKitFactory, KitItem, KitFeature, KitSpellSlot, KitAttack } from './CharacterKitFactory.js';

const MARTIAL_EQUIPMENT: KitItem[] = [
  { name: 'Espada Longa', quantity: 1, weight: 1.5, effect: 'Dano: 1d8 cortante (Versátil 1d10)', equipped: 1 },
  { name: 'Machadinha', quantity: 1, weight: 1, effect: 'Dano: 1d6 cortante (Leve, Arremesso)', equipped: 0 },
  { name: 'Azagaia', quantity: 4, weight: 1, effect: 'Dano: 1d6 perfurante (Arremesso)', equipped: 0 },
  { name: 'Cota de Malha', quantity: 1, weight: 27, effect: 'CA 16 (Armadura Pesada)', equipped: 1 },
  { name: 'Escudo', quantity: 1, weight: 3, effect: '+2 CA (Escudo)', equipped: 1 },
  { name: 'Kit de Aventureiro', quantity: 1, weight: 15, effect: 'Pacote inicial comum', equipped: 0 },
];

const MARTIAL_FEATURES: KitFeature[] = [
  { name: 'Retomar o Fôlego', description: 'No seu turno, use uma ação bônus para curar 1d10 + nível pontos de vida.', uses_max: 1, uses_current: 1 },
  { name: 'Surto de Ação', description: 'Você pode realizar uma ação adicional no seu turno.', uses_max: 1, uses_current: 1 },
];

const MARTIAL_ATTACKS: KitAttack[] = [
  { name: 'Espada Longa', bonus: '+5', damage_type: '1d8+3 Cortante' },
  { name: 'Besta Leve', bonus: '+4', damage_type: '1d8+2 Perfurante' },
];

export class MartialKitFactory implements CharacterKitFactory {
  createEquipment(): KitItem[] {
    return MARTIAL_EQUIPMENT;
  }

  createFeatures(): KitFeature[] {
    return MARTIAL_FEATURES;
  }

  createSpellSlots(_level: number): KitSpellSlot[] {
    return [];
  }

  createAttacks(): KitAttack[] {
    return MARTIAL_ATTACKS;
  }
}
