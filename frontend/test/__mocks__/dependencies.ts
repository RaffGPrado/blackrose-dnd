import { vi } from 'vitest';

export const mockApi = {
  getCharacter: vi.fn(),
  addAttack: vi.fn(),
  deleteAttack: vi.fn(),
  addItem: vi.fn(),
  deleteItem: vi.fn(),
  addFeature: vi.fn(),
  updateFeature: vi.fn(),
  deleteFeature: vi.fn(),
  requestSafe: vi.fn().mockReturnValue({ match: vi.fn((okCb, errCb) => okCb({})) }),
};

export const mockOfflineCharacterFacade = {
  loadCharacter: vi.fn(),
  updateCharacter: vi.fn(),
  performLongRest: vi.fn(),
  toggleSkill: vi.fn(),
  toggleSavingThrow: vi.fn(),
};

export const mockOfflineStorage = {
  getCharacterLocally: vi.fn(),
  saveCharacterLocally: vi.fn(),
  getCharactersListLocally: vi.fn(),
  saveCharactersListLocally: vi.fn(),
  removeCharacterLocally: vi.fn(),
  enqueueMutation: vi.fn(),
};

export const mockSyncManager = {
  syncManager: {
    triggerSync: vi.fn(),
    updatePendingCount: vi.fn(),
  },
};
