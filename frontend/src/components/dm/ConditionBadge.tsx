import React from 'react';
import type { DND5eCondition } from '../../types/dnd5e';
import { AlertCircle, Skull, Zap, EyeOff, ShieldAlert, HeartCrack } from 'lucide-react';

interface ConditionBadgeProps {
  condition: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Envenenado: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800/70' },
  Cego: { bg: 'bg-zinc-950/80', text: 'text-zinc-300', border: 'border-zinc-700/70' },
  Amedrontado: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800/70' },
  Atordoado: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800/70' },
  Caído: { bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-800/70' },
  Incapacitado: { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-800/70' },
  Inconsciente: { bg: 'bg-red-950/90', text: 'text-red-200', border: 'border-red-800/80' },
  Paralisado: { bg: 'bg-yellow-950/80', text: 'text-yellow-300', border: 'border-yellow-800/70' },
  Petrificado: { bg: 'bg-stone-900/90', text: 'text-stone-300', border: 'border-stone-700/80' },
  Preso: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-800/70' },
  Surdo: { bg: 'bg-slate-900/80', text: 'text-slate-300', border: 'border-slate-700/70' },
  Encantado: { bg: 'bg-pink-950/80', text: 'text-pink-300', border: 'border-pink-800/70' },
};

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  condition,
  onRemove,
  size = 'sm',
}) => {
  const style = CONDITION_COLORS[condition] || {
    bg: 'bg-gray-900/80',
    text: 'text-gray-300',
    border: 'border-gray-700/60',
  };

  const getIcon = () => {
    switch (condition) {
      case 'Inconsciente':
        return <Skull className="w-2.5 h-2.5 shrink-0" />;
      case 'Envenenado':
        return <AlertCircle className="w-2.5 h-2.5 shrink-0" />;
      case 'Cego':
        return <EyeOff className="w-2.5 h-2.5 shrink-0" />;
      case 'Atordoado':
      case 'Paralisado':
        return <Zap className="w-2.5 h-2.5 shrink-0" />;
      case 'Amedrontado':
        return <HeartCrack className="w-2.5 h-2.5 shrink-0" />;
      default:
        return <ShieldAlert className="w-2.5 h-2.5 shrink-0" />;
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-semibold ${style.bg} ${style.text} ${style.border} ${
        isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      }`}
    >
      {getIcon()}
      <span>{condition}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-white transition-colors text-[10px]"
          title={`Remover condição ${condition}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
