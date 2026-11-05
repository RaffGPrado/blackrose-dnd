import { useLongPress, LongPressEventType } from 'use-long-press';
import { triggerHaptic } from './useHaptics';

export interface ExplainEntry {
  title: string;
  subtitle?: string;
  badge?: string;
  formula?: string;
  description: string;
  tip?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function useHoldToExplain(
  entry: ExplainEntry,
  onOpenExplain?: (entry: ExplainEntry) => void
) {
  const bind = useLongPress(
    () => {
      if (!onOpenExplain) return;
      triggerHaptic('hold');
      onOpenExplain(entry);
    },
    {
      threshold: 420,
      cancelOnMovement: 16,
      detect: LongPressEventType.Pointer,
    }
  );

  return onOpenExplain ? bind() : {};
}
