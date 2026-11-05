export type HapticPattern = 'tap' | 'hold' | 'damage' | 'heal' | 'undo';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  hold: [14, 30, 18],
  damage: [25, 40, 25],
  heal: 18,
  undo: 12,
};

export function triggerHaptic(pattern: HapticPattern = 'tap'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Dispositivos ou navegadores sem permissão de vibração ignoram silenciosamente
  }
}
