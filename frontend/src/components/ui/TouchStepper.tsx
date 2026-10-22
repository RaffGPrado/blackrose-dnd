import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TouchStepperProps {
  value: number | string;
  label?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  disableDecrement?: boolean;
  disableIncrement?: boolean;
  className?: string;
}

export const TouchStepper: React.FC<TouchStepperProps> = ({
  value,
  label,
  onDecrement,
  onIncrement,
  disableDecrement = false,
  disableIncrement = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-between gap-2 bg-[#1c1c28] border border-gray-700/60 rounded-xl p-1',
        className
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disableDecrement}
        aria-label={label ? `Diminuir ${label}` : 'Diminuir'}
        className="w-12 h-12 min-w-12 min-h-12 inline-flex items-center justify-center rounded-lg bg-[#15151e] hover:bg-rose-950/60 border border-gray-800 hover:border-rose-700/60 text-gray-200 hover:text-rose-200 transition-all select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="px-3 text-center min-w-12">
        {label && (
          <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            {label}
          </span>
        )}
        <span className="text-base font-bold text-white tabular-nums">{value}</span>
      </div>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disableIncrement}
        aria-label={label ? `Aumentar ${label}` : 'Aumentar'}
        className="w-12 h-12 min-w-12 min-h-12 inline-flex items-center justify-center rounded-lg bg-[#15151e] hover:bg-emerald-950/60 border border-gray-800 hover:border-emerald-700/60 text-gray-200 hover:text-emerald-200 transition-all select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
