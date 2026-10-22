import { CharacterKitFactory, KitItem, KitFeature, KitSpellSlot, KitAttack } from './CharacterKitFactory.js';
import { FULL_CASTER_SLOTS } from '../character/CharacterEntity.js';

const SPELLCASTER_EQUIPMENT: KitItem[] = [
  { name: 'Adaga', quantity: 1, weight: 0.5, effect: 'Dano: 1d4 perfurante (Acuidade, Leve, Arremesso)', equipped: 1 },
  { name: 'Bastão', quantity: 1, weight: 2, effect: 'Dano: 1d6 concussão (Versátil 1d8)', equipped: 0 },
  { name: 'Grimório', quantity: 1, weight: 1.5, effect: 'Livro de magias arcanas', equipped: 0 },
  { name: 'Bolsa de Componentes', quantity: 1, weight: 1, effect: 'Componentes materiais', equipped: 0 },
  { name: 'Varinha', quantity: 1, weight: 0.5, effect: 'Foco arcano', equipped: 1 },
  { name: 'Kit de Erudito', quantity: 1, weight: 10, effect: 'Pacote inicial erudito', equipped: 0 },
];

const SPELLCASTER_FEATURES: KitFeature[] = [
  { name: 'Recuperação Arcana', description: 'Recupere espaços de magia num descanso curto.', uses_max: 1, uses_current: 1 },
  { name: 'Conjuração: Wizard', description: 'Você pode conjurar magias conhecidas.', uses_max: 0, uses_current: 0 },
];

const SPELLCASTER_ATTACKS: KitAttack[] = [
  { name: 'Adaga', bonus: '+4', damage_type: '1d4+2 Perfurante' },
  { name: 'Raio de Fogo', bonus: '+5', damage_type: '1d10 Fogo' },
];

export class SpellcasterKitFactory implements CharacterKitFactory {
  createEquipment(): KitItem[] {
    return SPELLCASTER_EQUIPMENT;
  }

  createFeatures(): KitFeature[] {
    return SPELLCASTER_FEATURES;
  }

  createSpellSlots(level: number): KitSpellSlot[] {
    const slots = FULL_CASTER_SLOTS[level] ?? [2, 0, 0, 0, 0, 0, 0, 0, 0];
    return slots.map((max_slots, index) => ({ slot_level: index + 1, max_slots }));
  }

  createAttacks(): KitAttack[] {
    return SPELLCASTER_ATTACKS;
  }
}
