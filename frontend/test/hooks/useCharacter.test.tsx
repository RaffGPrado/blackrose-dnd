import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCharacter } from '../../src/hooks/useCharacter';
import { api, requestSafe } from '../../src/services/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockCharacterId = 1;
const mockInitialData = {
  character: {
    id: mockCharacterId,
    name: 'Test Character',
    level: 1,
    max_hp: 10,
    current_hp: 10,
    temp_hp: 0,
    death_successes: 0,
    death_failures: 0,
    inspiration: 0,
  },
  items: [],
  attacks: [],
  features: [],
  spell_slots: [],
  spells: []
};

vi.mock('../../src/services/api', () => ({
  api: {
    getCharacter: vi.fn(),
    addAttack: vi.fn(),
    deleteAttack: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    addFeature: vi.fn(),
    updateFeature: vi.fn(),
    deleteFeature: vi.fn(),
  },
  requestSafe: vi.fn(),
}));

describe('useCharacter', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    (requestSafe as any).mockImplementation((url: string, options?: any) => {
      return {
        match: vi.fn(async (okCb, errCb) => {
          if (options && options.method === 'PATCH') {
             // For update mutation
             return okCb(mockInitialData);
          }
          if (options && options.method === 'POST') {
             // For long rest
             return okCb({ character: { ...mockInitialData.character, current_hp: 10, hit_dice_current: 1 } });
          }
          return okCb(mockInitialData);
        })
      };
    });
  });

  it('should load character on mount', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.character).toEqual(mockInitialData.character);
    expect(requestSafe).toHaveBeenCalledWith(`/characters/${mockCharacterId}`);
  });

  it('should handle HP adjustments', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.adjustHp(-5);
    });

    expect(requestSafe).toHaveBeenCalledWith(
      `/characters/${mockCharacterId}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ current_hp: 5 })
      })
    );
  });

  it('should handle Temp HP adjustments', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.adjustTempHp(5);
    });

    expect(requestSafe).toHaveBeenCalledWith(
      `/characters/${mockCharacterId}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ temp_hp: 5 })
      })
    );
  });

  it('should toggle inspiration', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.toggleInspiration();
    });

    expect(requestSafe).toHaveBeenCalledWith(
      `/characters/${mockCharacterId}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ inspiration: 1 })
      })
    );
  });

  it('should adjust hit dice', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.adjustHitDice(-1);
    });

    expect(requestSafe).toHaveBeenCalledWith(
      `/characters/${mockCharacterId}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ hit_dice_current: 0 })
      })
    );
  });
  
  it('should handle long rest', async () => {
    const { result } = renderHook(() => useCharacter(mockCharacterId), { wrapper });
    
    window.confirm = vi.fn().mockReturnValue(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.longRest();
    });

    expect(requestSafe).toHaveBeenCalledWith(
      `/characters/${mockCharacterId}/long-rest`,
      expect.objectContaining({
        method: 'POST'
      })
    );
  });
});
