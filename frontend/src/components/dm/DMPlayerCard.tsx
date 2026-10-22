import React, { useState } from 'react';
import { Result } from 'neverthrow';
import { Shield, Sparkles, Plus, EyeOff } from 'lucide-react';
import { DMConditionSelector, ALL_CONDITIONS } from './DMConditionSelector';
import { ConditionBadge } from './ConditionBadge';
import type { DMRosterItem, DND5eCondition } from '../../types/dnd5e';

interface DMPlayerCardProps {
  player: DMRosterItem;
  isActiveTurn?: boolean;
  onAdjustHp: (id: number, delta: number) => void;
  onAdjustTempHp: (id: number, delta: number) => void;
  onToggleCondition: (id: number, condition: DND5eCondition) => void;
  onSetInitiative: (id: number, val: number | null) => void;
  onUnwatch: (id: number) => void;
}

export const DMPlayerCard: React.FC<DMPlayerCardProps> = ({
  player,
  isActiveTurn = false,
  onAdjustHp,
  onAdjustTempHp,
  onToggleCondition,
  onSetInitiative,
  onUnwatch,
}) => {
  const [showConditionSelector, setShowConditionSelector] = useState(false);
  const [initiativeInput, setInitiativeInput] = useState<string>(
    player.current_initiative !== null && player.current_initiative !== undefined
      ? String(player.current_initiative)
      : '',
  );

  const activeConditions: string[] = Result.fromThrowable(
    () => JSON.parse(player.conditions || '[]') as string[],
    () => [] as string[]
  )().unwrapOr([]);

  const maxHp = Math.max(1, player.max_hp || 10);
  const curHp = Math.max(0, player.current_hp || 0);
  const tempHp = Math.max(0, player.temp_hp || 0);
  const hpPercent = Math.min(100, Math.round((curHp / maxHp) * 100));

  let hpBarColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
  let hpTextColor = 'text-emerald-400';
  if (curHp === 0) {
    hpBarColor = 'bg-rose-900';
    hpTextColor = 'text-rose-500 font-extrabold animate-pulse';
  } else if (hpPercent <= 25) {
    hpBarColor = 'bg-gradient-to-r from-rose-600 to-red-500';
    hpTextColor = 'text-rose-400 font-bold';
  } else if (hpPercent <= 50) {
    hpBarColor = 'bg-gradient-to-r from-amber-500 to-yellow-400';
    hpTextColor = 'text-amber-400 font-bold';
  }

  const handleInitiativeBlur = () => {
    const parsed = parseInt(initiativeInput, 10);
    onSetInitiative(player.id, isNaN(parsed) ? null : parsed);
  };

  return (
    <div
      className={`rounded-2xl border transition-all space-y-3 p-4 shadow-md ${
        isActiveTurn
          ? 'bg-dnd-elevated border-dnd-gold/80 ring-2 ring-dnd-gold/40 shadow-dnd-glow'
          : 'bg-dnd-surface border-dnd-border hover:border-dnd-highlight'
      }`}
    >
      {/* Top Header: Identity, Avatar/Dot, Initiative, AC */}
      <div className="flex items-center justify-between gap-2">
        {/* Left Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Online Presence Indicator */}
          <div className="relative shrink-0" title={player.online ? 'Jogador Conectado' : 'Offline'}>
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                player.online
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : 'bg-gray-600'
              }`}
            />
            {player.online && (
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate">{player.name}</h3>
              {isActiveTurn && (
                <span className="text-[10px] px-2 py-0.5 bg-dnd-gold-faint border border-dnd-gold/50 text-amber-300 font-bold rounded-full animate-pulse">
                  Turno Atual
                </span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 bg-rose-950/80 border border-rose-800/50 text-rose-300 font-semibold rounded-full shrink-0">
                Nv {player.level}
              </span>
            </div>
            <p className="text-[11px] text-dnd-muted truncate">
              {player.race_name || 'Herói'} • {player.class_name || 'Aventureiro'}
              {player.player_name && (
                <span className="text-dnd-dim"> ({player.player_name})</span>
              )}
            </p>
          </div>
        </div>

        {/* Combat Stats & Unwatch */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Initiative Input */}
          <div className="flex items-center gap-1 bg-dnd-elevated border border-dnd-border rounded-xl px-2.5 py-1">
            <span className="text-[10px] font-bold text-dnd-muted uppercase">Inic</span>
            <input
              type="number"
              value={initiativeInput}
              onChange={(e) => setInitiativeInput(e.target.value)}
              onBlur={handleInitiativeBlur}
              placeholder="--"
              className="w-8 text-center text-xs font-bold text-dnd-gold bg-transparent focus:outline-none"
            />
          </div>

          {/* AC Badge */}
          <div className="flex items-center gap-1 bg-blue-950/40 border border-blue-800/40 rounded-xl px-2 py-1 text-xs text-blue-400 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>{player.armor_class}</span>
          </div>

          {/* Unwatch button */}
          <button
            type="button"
            onClick={() => onUnwatch(player.id)}
            className="p-1.5 text-dnd-dim hover:text-dnd-rose hover:bg-rose-950/30 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Remover da Visão do Mestre"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HP Tracker Section */}
      <div className="bg-dnd-elevated border border-dnd-border rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-dnd-muted font-medium">Pontos de Vida</span>
            {tempHp > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-950/60 border border-blue-800/50 text-blue-300 font-bold rounded-full">
                +{tempHp} Temp
              </span>
            )}
            {player.inspiration === 1 && (
              <span className="flex items-center gap-0.5 text-[10px] text-dnd-gold font-bold" title="Inspiração Ativa">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Insp
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-base font-extrabold ${hpTextColor}`}>{curHp}</span>
            <span className="text-gray-500 font-medium">/ {maxHp} PV</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-gray-800/80 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${hpBarColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* 1-Tap DM Quick Health Adjustment Controls */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => onAdjustHp(player.id, -5)}
            className="h-10 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-xs font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => onAdjustHp(player.id, -1)}
            className="h-10 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-400 text-xs font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => onAdjustHp(player.id, 1)}
            className="h-10 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 text-emerald-400 text-xs font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => onAdjustHp(player.id, 5)}
            className="h-10 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-300 text-xs font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            +5
          </button>
        </div>
      </div>

      {/* Active Conditions List & Toggle Modal Button */}
      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
        {activeConditions.map((condName) => (
          <ConditionBadge
            key={condName}
            condition={condName}
            onRemove={() => onToggleCondition(player.id, condName as DND5eCondition)}
          />
        ))}

        <button
          type="button"
          onClick={() => setShowConditionSelector(true)}
          className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 flex items-center gap-1 font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Condição</span>
        </button>
      </div>

      {/* Condition Selector Modal */}
      <DMConditionSelector
        isOpen={showConditionSelector}
        onClose={() => setShowConditionSelector(false)}
        characterName={player.name}
        activeConditions={activeConditions}
        onToggleCondition={(cond) => onToggleCondition(player.id, cond)}
      />
    </div>
  );
};
