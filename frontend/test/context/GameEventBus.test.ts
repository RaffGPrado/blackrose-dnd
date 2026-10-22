import { describe, it, expect, vi } from 'vitest';
import { gameEventBus, GameEvent } from '../../src/context/GameEventBus';

describe('GameEventBus', () => {
  it('should allow subscribing to and publishing events', () => {
    const callback = vi.fn();
    
    // Subscribe to HP_ADJUSTED event
    const unsubscribe = gameEventBus.subscribe('HP_ADJUSTED', callback);
    
    // Publish an event
    gameEventBus.publish({ type: 'HP_ADJUSTED', payload: { characterId: 1, delta: -5 } });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ characterId: 1, delta: -5 });
    
    // Unsubscribe
    unsubscribe();
    
    // Publish again, should not be called
    gameEventBus.publish({ type: 'HP_ADJUSTED', payload: { characterId: 1, delta: 10 } });
    
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should handle multiple listeners for the same event type', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const unsub1 = gameEventBus.subscribe('TEMP_HP_ADJUSTED', callback1);
    const unsub2 = gameEventBus.subscribe('TEMP_HP_ADJUSTED', callback2);
    
    gameEventBus.publish({ type: 'TEMP_HP_ADJUSTED', payload: { characterId: 1, delta: 5 } });
    
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    
    unsub1();
    unsub2();
  });

  it('should not call listeners of other event types', () => {
    const callback = vi.fn();
    
    const unsub = gameEventBus.subscribe('COIN_ADJUSTED', callback);
    
    gameEventBus.publish({ type: 'HP_ADJUSTED', payload: { characterId: 1, delta: -5 } });
    
    expect(callback).not.toHaveBeenCalled();
    
    unsub();
  });
});
