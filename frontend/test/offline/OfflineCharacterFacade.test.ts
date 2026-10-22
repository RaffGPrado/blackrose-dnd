import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineCharacterFacade } from '../../src/offline/OfflineCharacterFacade';
import { requestSafe } from '../../src/services/api';
import * as offlineStorage from '../../src/offline/offlineStorage';
import { syncManager } from '../../src/offline/syncManager';

vi.mock('../../src/services/api', () => ({
  requestSafe: vi.fn(),
}));

vi.mock('../../src/offline/offlineStorage', () => ({
  getCharacterLocally: vi.fn(),
  saveCharacterLocally: vi.fn(),
  getCharactersListLocally: vi.fn(),
  saveCharactersListLocally: vi.fn(),
  removeCharacterLocally: vi.fn(),
  enqueueMutation: vi.fn(),
}));

vi.mock('../../src/offline/syncManager', () => ({
  syncManager: {
    triggerSync: vi.fn(),
    updatePendingCount: vi.fn(),
  },
}));

describe('OfflineCharacterFacade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadCharacter', () => {
    it('should return local data immediately and trigger revalidate', async () => {
      const mockLocalData = { character: { id: 1, name: 'Local Test' } };
      const mockNetworkData = { character: { id: 1, name: 'Network Test' } };
      
      (offlineStorage.getCharacterLocally as any).mockResolvedValue(mockLocalData);
      (requestSafe as any).mockReturnValue({ match: vi.fn(async (okCb) => okCb(mockNetworkData)) });
      
      const onRevalidate = vi.fn();
      
      const result = await OfflineCharacterFacade.loadCharacter(1, onRevalidate, false);
      
      expect(result).toEqual(mockLocalData);
      expect(offlineStorage.getCharacterLocally).toHaveBeenCalledWith(1);
      
      // Allow async revalidation to complete
      await new Promise(process.nextTick);
      
      expect(requestSafe).toHaveBeenCalled();
      expect(offlineStorage.saveCharacterLocally).toHaveBeenCalledWith(mockNetworkData);
      expect(onRevalidate).toHaveBeenCalledWith(mockNetworkData);
    });

    it('should use network directly if forceNetwork is true', async () => {
      const mockNetworkData = { character: { id: 1, name: 'Network Test' } };
      (requestSafe as any).mockReturnValue({ match: vi.fn(async (okCb) => okCb(mockNetworkData)) });
      
      const result = await OfflineCharacterFacade.loadCharacter(1, vi.fn(), true);
      
      expect(result).toEqual(mockNetworkData);
      expect(offlineStorage.getCharacterLocally).toHaveBeenCalled();
      expect(offlineStorage.saveCharacterLocally).toHaveBeenCalledWith(mockNetworkData);
    });
  });

  describe('updateCharacter', () => {
    it('should update local storage, enqueue mutation and trigger sync', async () => {
      const mockLocalData = { character: { id: 1, name: 'Old', current_hp: 10 } };
      (offlineStorage.getCharacterLocally as any).mockResolvedValue(mockLocalData);
      (requestSafe as any).mockReturnValue({ match: vi.fn(async (okCb, errCb) => errCb(new Error('offline'))) });
      
      await OfflineCharacterFacade.updateCharacter(1, { current_hp: 5 });
      
      expect(offlineStorage.getCharacterLocally).toHaveBeenCalledWith(1);
      
      const expectedNewChar = { ...mockLocalData, character: { ...mockLocalData.character, current_hp: 5 } };
      expect(offlineStorage.saveCharacterLocally).toHaveBeenCalledWith(expectedNewChar);
      
      expect(offlineStorage.enqueueMutation).toHaveBeenCalledWith({
        endpoint: '/characters/1',
        method: 'PATCH',
        body: { current_hp: 5 },
        characterId: 1
      });
      
      expect(syncManager.updatePendingCount).toHaveBeenCalled();
    });
  });

  describe('performLongRest', () => {
    it('should update locally and enqueue', async () => {
      const mockLocalData = { 
        character: { id: 1, max_hp: 10, current_hp: 5, level: 1, hit_dice_current: 0 },
        spell_slots: [{ slot_level: 1, max_slots: 2, used_slots: 1 }]
      };
      (offlineStorage.getCharacterLocally as any).mockResolvedValue(mockLocalData);
      (requestSafe as any).mockReturnValue({ match: vi.fn(async (okCb, errCb) => errCb(new Error('offline'))) });
      
      const result = await OfflineCharacterFacade.performLongRest(1);
      
      expect(result?.character.current_hp).toBe(10);
      expect(result?.character.hit_dice_current).toBe(1);
      expect(result?.spell_slots?.[0].used_slots).toBe(0);
      
      expect(offlineStorage.saveCharacterLocally).toHaveBeenCalled();
      expect(offlineStorage.enqueueMutation).toHaveBeenCalledWith({
        endpoint: '/characters/1/long-rest',
        method: 'POST',
        characterId: 1
      });
      expect(syncManager.updatePendingCount).toHaveBeenCalled();
    });
  });

  describe('loadCharactersList', () => {
    it('should return local data immediately and trigger revalidate', async () => {
      const mockLocalData = [{ id: 1, name: 'Local Test' }];
      const mockNetworkData = [{ id: 1, name: 'Network Test' }];
      
      (offlineStorage.getCharactersListLocally as any).mockResolvedValue(mockLocalData);
      (requestSafe as any).mockReturnValue({ match: vi.fn(async (okCb) => okCb({ characters: mockNetworkData })) });
      
      const onRevalidate = vi.fn();
      
      const result = await OfflineCharacterFacade.loadCharactersList(onRevalidate, false);
      
      expect(result).toEqual(mockLocalData);
      expect(offlineStorage.getCharactersListLocally).toHaveBeenCalled();
      
      // Allow async revalidation to complete
      await new Promise(process.nextTick);
      
      expect(requestSafe).toHaveBeenCalled();
      expect(offlineStorage.saveCharactersListLocally).toHaveBeenCalledWith(mockNetworkData);
      expect(onRevalidate).toHaveBeenCalledWith(mockNetworkData);
    });
  });
});
