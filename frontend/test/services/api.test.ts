import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, requestSafe } from '../../src/services/api';

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.setItem('black_rose_token', 'test-token');
  });

  it('should get character', async () => {
    const mockResponse = { id: 1, name: 'Test' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.getCharacter(1);
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/characters/1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('should return error on failed request', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Not Found' }),
      status: 404,
    });

    await expect(api.getCharacter(1)).rejects.toThrow('Not Found');
  });

  it('should test requestSafe wrapper', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await requestSafe('/test');
    
    expect(result.isOk()).toBe(true);
    result.match(
      (val) => expect(val).toEqual(mockResponse),
      () => expect.fail('Should not be err')
    );
  });
  
  it('should test requestSafe wrapper error', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Bad Request' }),
      status: 400
    });

    const result = await requestSafe('/test');
    
    expect(result.isErr()).toBe(true);
    result.match(
      () => expect.fail('Should not be ok'),
      (err) => expect(err.message).toBe('Bad Request')
    );
  });
});
