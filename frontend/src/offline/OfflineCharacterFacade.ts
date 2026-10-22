import { requestSafe } from '../services/api';
import {
  getCharacterLocally,
  saveCharacterLocally,
  getCharactersListLocally,
  saveCharactersListLocally,
  removeCharacterLocally,
  enqueueMutation,
} from './offlineStorage';
import { syncManager } from './syncManager';
import type { CharacterCore, CharacterDetailResponse } from '../types/dnd5e';

export class OfflineCharacterFacade {
  public static async loadCharacter(
    characterId: number,
    onRevalidate?: (data: CharacterDetailResponse) => void,
    forceNetwork = false
  ): Promise<CharacterDetailResponse | null> {
    const localData = await getCharacterLocally(characterId);

    const fetchFromNetwork = async (): Promise<CharacterDetailResponse | null> => {
      return requestSafe<CharacterDetailResponse>(`/characters/${characterId}`).match(
        async (networkData) => {
          await saveCharacterLocally(networkData);
          if (onRevalidate) {
            onRevalidate(networkData);
          }
          return networkData;
        },
        () => localData
      );
    };

    if (forceNetwork || !localData) {
      return fetchFromNetwork();
    }

    void fetchFromNetwork();
    return localData;
  }

  public static async updateCharacter(
    characterId: number,
    updates: Partial<CharacterCore>
  ): Promise<CharacterDetailResponse | null> {
    const localData = await getCharacterLocally(characterId);
    let updatedLocal: CharacterDetailResponse | null = null;

    if (localData) {
      updatedLocal = {
        ...localData,
        character: {
          ...localData.character,
          ...updates,
        },
      };
      await saveCharacterLocally(updatedLocal);
    }

    await requestSafe<{ character: CharacterDetailResponse['character'] }>(`/characters/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }).match(
      async (res) => {
        if (updatedLocal && res?.character) {
          updatedLocal = {
            ...updatedLocal,
            character: res.character,
          };
          await saveCharacterLocally(updatedLocal);
        }
      },
      async () => {
        await enqueueMutation({
          endpoint: `/characters/${characterId}`,
          method: 'PATCH',
          body: updates,
          characterId,
        });
        await syncManager.updatePendingCount();
      }
    );

    return updatedLocal;
  }

  public static async performLongRest(characterId: number): Promise<CharacterDetailResponse | null> {
    const localData = await getCharacterLocally(characterId);
    let updatedLocal: CharacterDetailResponse | null = null;

    if (localData) {
      updatedLocal = {
        ...localData,
        character: {
          ...localData.character,
          current_hp: localData.character.max_hp,
          temp_hp: 0,
          death_successes: 0,
          death_failures: 0,
          hit_dice_current: localData.character.level,
        },
        spell_slots: (localData.spell_slots ?? []).map((slot) => ({
          ...slot,
          used_slots: 0,
        })),
        features: (localData.features ?? []).map((feat) => ({
          ...feat,
          uses_current: feat.uses_max,
        })),
      };
      await saveCharacterLocally(updatedLocal);
    }

    await requestSafe(`/characters/${characterId}/long-rest`, {
      method: 'POST',
    }).match(
      async () => {},
      async () => {
        await enqueueMutation({
          endpoint: `/characters/${characterId}/long-rest`,
          method: 'POST',
          characterId,
        });
        await syncManager.updatePendingCount();
      }
    );

    return updatedLocal;
  }

  public static async loadCharactersList(
    onRevalidate?: (characters: CharacterCore[]) => void,
    forceNetwork = false
  ): Promise<CharacterCore[]> {
    const localList = await getCharactersListLocally();

    const fetchFromNetwork = async (): Promise<CharacterCore[]> => {
      return requestSafe<{ characters: CharacterCore[] }>('/characters').match(
        async (res) => {
          const list = res.characters ?? [];
          await saveCharactersListLocally(list);
          if (onRevalidate) {
            onRevalidate(list);
          }
          return list;
        },
        () => localList ?? []
      );
    };

    if (forceNetwork || !localList) {
      return fetchFromNetwork();
    }

    void fetchFromNetwork();
    return localList;
  }

  public static async deleteCharacter(characterId: number): Promise<void> {
    await removeCharacterLocally(characterId);
    const localList = await getCharactersListLocally();
    if (localList) {
      await saveCharactersListLocally(localList.filter((c) => c.id !== characterId));
    }

    await requestSafe(`/characters/${characterId}`, {
      method: 'DELETE',
    }).match(
      async () => {},
      async () => {
        await enqueueMutation({
          endpoint: `/characters/${characterId}`,
          method: 'DELETE',
          characterId,
        });
        await syncManager.updatePendingCount();
      }
    );
  }
}
