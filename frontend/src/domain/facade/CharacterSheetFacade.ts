import { gameEventBus } from '../../context/GameEventBus';
import type { CharacterDetailResponse } from '../../types/dnd5e';

export class CharacterSheetFacade {
  public static applyOptimisticLongRest(detail: CharacterDetailResponse): CharacterDetailResponse {
    return {
      ...detail,
      character: {
        ...detail.character,
        current_hp: detail.character.max_hp,
        temp_hp: 0,
        death_successes: 0,
        death_failures: 0,
        hit_dice_current: detail.character.level,
      },
      spell_slots: detail.spell_slots.map((slot) => ({
        ...slot,
        used_slots: 0,
      })),
      features: detail.features.map((feat) => ({
        ...feat,
        uses_current: feat.uses_max,
      })),
    };
  }

  public static performLongRest(characterId: number): void {
    gameEventBus.publish({ type: 'LONG_REST', payload: { characterId } });
  }

  public static castSpell(
    characterId: number,
    slotLevel: number,
    currentUsed: number,
    circleIndex: number
  ): void {
    gameEventBus.publish({
      type: 'SPELL_SLOT_TOGGLED',
      payload: { characterId, slotLevel, currentUsed, circleIndex },
    });
  }
}
