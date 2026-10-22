import React, { useState } from 'react';
import { Heart, Skull, Undo2, Shield, Zap } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import {
  NormalDamageStrategy,
  ResistantDamageStrategy,
  VulnerableDamageStrategy,
  type IDamageCalculationStrategy,
} from '../../domain/combat/DamageStrategy';
import {
  combatActionHistory,
  ApplyDamageCommand,
  HealCommand,
} from '../../domain/commands/CombatActionHistory';
import type { EnrichedCharacter } from '../../types/dnd5e';

interface HealthTrackerProps {
  character: EnrichedCharacter;
}

export const HealthTracker: React.FC<HealthTrackerProps> = ({ character }) => {
  const actions = useCharacterActions();
  const [strategyMode, setStrategyMode] = useState<'normal' | 'resistant' | 'vulnerable'>('normal');
  const [historyCount, setHistoryCount] = useState(combatActionHistory.getHistory().length);

  const hpPercent = Math.max(0, Math.min(100, Math.round((character.current_hp / (character.max_hp || 1)) * 100)));

  const getActiveStrategy = (): IDamageCalculationStrategy => {
    switch (strategyMode) {
      case 'resistant':
        return new ResistantDamageStrategy();
      case 'vulnerable':
        return new VulnerableDamageStrategy();
      default:
        return new NormalDamageStrategy();
    }
  };

  const handleApplyDamage = async (amount: number) => {
    const strategy = getActiveStrategy();
    const command = new ApplyDamageCommand(amount, strategy);
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const nextState = combatActionHistory.executeCommand(command, currentState);
    setHistoryCount(combatActionHistory.getHistory().length);

    await actions.updateCharacter({
      current_hp: nextState.currentHp,
      temp_hp: nextState.tempHp,
    });
  };

  const handleApplyHeal = async (amount: number) => {
    const command = new HealCommand(amount);
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const nextState = combatActionHistory.executeCommand(command, currentState);
    setHistoryCount(combatActionHistory.getHistory().length);

    await actions.updateCharacter({
      current_hp: nextState.currentHp,
      temp_hp: nextState.tempHp,
    });
  };

  const handleUndo = async () => {
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const reverted = combatActionHistory.undo(currentState);
    if (!reverted) return;

    setHistoryCount(combatActionHistory.getHistory().length);
    await actions.updateCharacter({
      current_hp: reverted.currentHp,
      temp_hp: reverted.tempHp,
    });
  };

  return (
    <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 shadow-dnd-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-dnd-emerald-faint text-dnd-emerald">
            <Heart className="w-5 h-5 fill-dnd-emerald/20" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-dnd-muted uppercase">Pontos de Vida</span>
            <div className="text-base sm:text-lg font-black text-white tracking-tight flex items-baseline gap-1">
              <span>{character.current_hp}</span>
              <span className="text-dnd-muted text-xs font-normal">/ {character.max_hp} PV</span>
              {character.temp_hp > 0 && (
                <span className="text-[11px] text-dnd-blue font-semibold bg-dnd-blue-faint px-1.5 py-0.5 rounded-md ml-1">
                  +{character.temp_hp} Temp
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {historyCount > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border text-dnd-muted hover:text-white rounded-xl text-xs font-bold transition-all min-h-9"
              title="Desfazer última ação de combate"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desfazer</span>
            </button>
          )}

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              hpPercent > 50
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                : hpPercent > 20
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800/50 animate-pulse'
            }`}
          >
            {hpPercent}%
          </span>
        </div>
      </div>

      <div className="w-full h-3 bg-dnd-elevated rounded-full overflow-hidden p-0.5 shadow-inner border border-dnd-border/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            hpPercent > 50 ? 'bg-dnd-emerald' : hpPercent > 20 ? 'bg-dnd-gold' : 'bg-dnd-rose'
          }`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      <div className="flex bg-[#191b29] p-1 rounded-xl border border-gray-800 text-xs">
        <button
          type="button"
          onClick={() => setStrategyMode('normal')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
            strategyMode === 'normal' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Normal (1x)
        </button>
        <button
          type="button"
          onClick={() => setStrategyMode('resistant')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            strategyMode === 'resistant' ? 'bg-sky-700 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Resistente (½)</span>
        </button>
        <button
          type="button"
          onClick={() => setStrategyMode('vulnerable')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            strategyMode === 'vulnerable' ? 'bg-rose-700 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Vulnerável (2x)</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => handleApplyDamage(5)}
          className="h-12 bg-rose-950/60 hover:bg-rose-950 border border-rose-800/50 text-rose-300 rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow-sm min-h-12"
          title="Dano -5"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => handleApplyDamage(1)}
          className="h-12 bg-rose-950/60 hover:bg-rose-950 border border-rose-800/50 text-rose-300 rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow-sm min-h-12"
          title="Dano -1"
        >
          -1
        </button>
        <button
          type="button"
          onClick={() => handleApplyHeal(1)}
          className="h-12 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/50 text-emerald-300 rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow-sm min-h-12"
          title="Cura +1"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => handleApplyHeal(5)}
          className="h-12 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/50 text-emerald-300 rounded-xl text-sm font-black active:scale-95 transition-all flex items-center justify-center shadow-sm min-h-12"
          title="Cura +5"
        >
          +5
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="flex items-center justify-between bg-dnd-elevated px-3 py-2.5 rounded-xl border border-dnd-border">
          <div>
            <span className="text-dnd-muted text-[10px] block font-medium">PV Temporário</span>
            <strong className="text-dnd-blue text-sm font-bold">{character.temp_hp}</strong>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => actions.adjustTempHp(-1)}
              className="w-10 h-10 bg-dnd-surface hover:bg-dnd-highlight text-dnd-muted hover:text-white rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 border border-dnd-border transition-colors min-h-10 min-w-10"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => actions.adjustTempHp(1)}
              className="w-10 h-10 bg-blue-900/80 hover:bg-blue-800 text-blue-200 rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 transition-colors min-h-10 min-w-10"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-dnd-elevated px-3 py-2.5 rounded-xl border border-dnd-border">
          <div>
            <span className="text-dnd-muted text-[10px] block font-medium">Dados de Vida</span>
            <span className="font-bold text-dnd-gold text-sm">
              {character.hit_dice_current !== undefined && character.hit_dice_current !== null
                ? character.hit_dice_current
                : character.level}
              <span className="text-[10px] text-dnd-dim font-normal ml-0.5">/{character.level}</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => actions.adjustHitDice(-1)}
              className="w-10 h-10 bg-dnd-surface hover:bg-dnd-highlight text-dnd-muted hover:text-white rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 border border-dnd-border transition-colors min-h-10 min-w-10"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => actions.adjustHitDice(1)}
              className="w-10 h-10 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded-lg flex items-center justify-center text-sm font-bold active:scale-95 transition-colors min-h-10 min-w-10"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dnd-elevated p-3 rounded-xl border border-dnd-border flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-dnd-muted flex items-center gap-1.5">
          <Skull className="w-4 h-4 text-dnd-muted" />
          Morte:
        </span>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-emerald-400 font-semibold mr-1">Sucessos</span>
            {[0, 1, 2].map((idx) => (
              <button
                key={`s-${idx}`}
                type="button"
                onClick={() => actions.toggleDeathSave('success', idx)}
                className={`w-7 h-7 rounded-full border transition-all active:scale-90 flex items-center justify-center min-h-7 min-w-7 ${
                  idx < character.death_successes
                    ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50'
                    : 'border-dnd-border bg-dnd-surface hover:border-gray-500'
                }`}
                title={`Sucesso ${idx + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-rose-400 font-semibold mr-1">Falhas</span>
            {[0, 1, 2].map((idx) => (
              <button
                key={`f-${idx}`}
                type="button"
                onClick={() => actions.toggleDeathSave('failure', idx)}
                className={`w-7 h-7 rounded-full border transition-all active:scale-90 flex items-center justify-center min-h-7 min-w-7 ${
                  idx < character.death_failures
                    ? 'bg-rose-500 border-rose-400 shadow-sm shadow-rose-500/50'
                    : 'border-dnd-border bg-dnd-surface hover:border-gray-500'
                }`}
                title={`Falha ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
