import { CharacterKitFactory } from './CharacterKitFactory.js';
import { MartialKitFactory } from './MartialKitFactory.js';
import { SpellcasterKitFactory } from './SpellcasterKitFactory.js';
import type { AbilityKey } from '../../types/dnd5e.js';

export interface ClassMetadata {
  hitDie: string;
  spellcastingAbility: AbilityKey;
  casterType: 'full' | 'half' | 'pact' | 'none';
}

const DEFAULT_CLASS_METADATA: ClassMetadata = {
  hitDie: 'd8',
  spellcastingAbility: 'intelligence',
  casterType: 'none',
};

export const CLASS_RULES_REGISTRY: Readonly<Record<string, ClassMetadata>> = {
  barbarian: { hitDie: 'd12', spellcastingAbility: 'wisdom', casterType: 'none' },
  'bárbaro': { hitDie: 'd12', spellcastingAbility: 'wisdom', casterType: 'none' },
  barbaro: { hitDie: 'd12', spellcastingAbility: 'wisdom', casterType: 'none' },
  bard: { hitDie: 'd8', spellcastingAbility: 'charisma', casterType: 'full' },
  bardo: { hitDie: 'd8', spellcastingAbility: 'charisma', casterType: 'full' },
  cleric: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'full' },
  'clérigo': { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'full' },
  clerigo: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'full' },
  druid: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'full' },
  druida: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'full' },
  fighter: { hitDie: 'd10', spellcastingAbility: 'intelligence', casterType: 'none' },
  guerreiro: { hitDie: 'd10', spellcastingAbility: 'intelligence', casterType: 'none' },
  monk: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'none' },
  monge: { hitDie: 'd8', spellcastingAbility: 'wisdom', casterType: 'none' },
  paladin: { hitDie: 'd10', spellcastingAbility: 'charisma', casterType: 'half' },
  paladino: { hitDie: 'd10', spellcastingAbility: 'charisma', casterType: 'half' },
  ranger: { hitDie: 'd10', spellcastingAbility: 'wisdom', casterType: 'half' },
  patrulheiro: { hitDie: 'd10', spellcastingAbility: 'wisdom', casterType: 'half' },
  rogue: { hitDie: 'd8', spellcastingAbility: 'intelligence', casterType: 'none' },
  ladino: { hitDie: 'd8', spellcastingAbility: 'intelligence', casterType: 'none' },
  sorcerer: { hitDie: 'd6', spellcastingAbility: 'charisma', casterType: 'full' },
  feiticeiro: { hitDie: 'd6', spellcastingAbility: 'charisma', casterType: 'full' },
  warlock: { hitDie: 'd8', spellcastingAbility: 'charisma', casterType: 'pact' },
  bruxo: { hitDie: 'd8', spellcastingAbility: 'charisma', casterType: 'pact' },
  wizard: { hitDie: 'd6', spellcastingAbility: 'intelligence', casterType: 'full' },
  mago: { hitDie: 'd6', spellcastingAbility: 'intelligence', casterType: 'full' },
};

export class CharacterKitProvider {
  static getClassMetadata(className?: string | null): ClassMetadata {
    if (!className) return DEFAULT_CLASS_METADATA;
    const key = className.trim().toLowerCase();
    return CLASS_RULES_REGISTRY[key] ?? DEFAULT_CLASS_METADATA;
  }

  static getFactory(className?: string | null): CharacterKitFactory {
    const metadata = CharacterKitProvider.getClassMetadata(className);
    if (metadata.casterType !== 'none') {
      return new SpellcasterKitFactory();
    }
    return new MartialKitFactory();
  }
}
