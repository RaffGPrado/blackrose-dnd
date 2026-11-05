import React, { useState } from 'react';
import { Shield, Skull, Undo2, Zap } from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../hooks/useHaptics';
import { SectionTitle } from '../ui/SectionTitle';
import { InteractivePipButton } from '../ui/Pip';

interface HealthTrackerProps {
  character: EnrichedCharacter;
}

export const HealthTracker: React.FC<HealthTrackerProps> = ({ character }) => {
  const actions = useCharacterActions();
  const [strategyMode, setStrategyMode] = useState<'normal' | 'resistant' | 'vulnerable'>('normal');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [historyCount, setHistoryCount] = useState(combatActionHistory.getHistory().length);

  const hpPercent = Math.max(
    0,
    Math.min(100, Math.round((character.current_hp / (character.max_hp || 1)) * 100))
  );
  const isDying = character.current_hp === 0;

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
    if (!Number.isFinite(amount) || amount <= 0) return;
    triggerHaptic('damage');
    const strategy = getActiveStrategy();
    const command = new ApplyDamageCommand(amount, strategy);
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const nextState = combatActionHistory.executeCommand(command, currentState);
    setHistoryCount(combatActionHistory.getHistory().length);

    await actions.saveEdit({
      current_hp: nextState.currentHp,
      temp_hp: nextState.tempHp,
    });
    toast.error(`Dano sofrido: -${amount} HP`);
  };

  const handleApplyHeal = async (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    triggerHaptic('heal');
    const command = new HealCommand(amount);
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const nextState = combatActionHistory.executeCommand(command, currentState);
    setHistoryCount(combatActionHistory.getHistory().length);

    await actions.saveEdit({
      current_hp: nextState.currentHp,
      temp_hp: nextState.tempHp,
    });
    toast.success(`Cura recebida: +${amount} HP`);
  };

  const handleCustomDamage = async () => {
    const val = parseInt(customAmount, 10);
    if (!Number.isFinite(val) || val <= 0) return;
    setCustomAmount('');
    await handleApplyDamage(val);
  };

  const handleCustomHeal = async () => {
    const val = parseInt(customAmount, 10);
    if (!Number.isFinite(val) || val <= 0) return;
    setCustomAmount('');
    await handleApplyHeal(val);
  };

  const handleUndo = async () => {
    triggerHaptic('undo');
    const currentState = {
      currentHp: character.current_hp,
      maxHp: character.max_hp,
      tempHp: character.temp_hp || 0,
    };
    const reverted = combatActionHistory.undo(currentState);
    if (!reverted) return;

    setHistoryCount(combatActionHistory.getHistory().length);
    await actions.saveEdit({
      current_hp: reverted.currentHp,
      temp_hp: reverted.tempHp,
    });
    toast.info('Ação de combate desfeita');
  };

  return (
    <section aria-label="Controle de Pontos de Vida">
      <SectionTitle
        title="Vitalidade & Controle"
        right={
          historyCount > 0 ? (
            <button
              type="button"
              onClick={handleUndo}
              title="Desfazer última ação de combate"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-elevated border border-rule text-ink font-semibold text-xs tap-control"
            >
              <Undo2 className="w-3.5 h-3.5 text-rose" />
              <span>Desfazer</span>
            </button>
          ) : (
            <span>Toque para alterar</span>
          )
        }
      />

      <div
        className={cn(
          'codex-card p-4 sm:p-5 space-y-4',
          isDying && 'border-rose ring-1 ring-rose/50 bg-rose-soft/20'
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-ink-soft uppercase block">
              Pontos de Vida
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 tabular-nums">
              <span className="font-serif text-4xl font-bold text-ink">
                {character.current_hp}
              </span>
              <span className="text-ink-soft text-sm font-medium">
                / {character.max_hp} PV
              </span>
              {character.temp_hp > 0 && (
                <span className="text-xs text-gold font-bold bg-gold-soft border border-gold/30 px-2 py-0.5 rounded-lg ml-1">
                  +{character.temp_hp} Temp
                </span>
              )}
            </div>
          </div>

          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full tabular-nums border',
              hpPercent > 50
                ? 'bg-heal-soft text-heal border-heal/30'
                : hpPercent > 20
                  ? 'bg-gold-soft text-gold border-gold/30'
                  : 'bg-rose-soft text-rose border-rose/40 animate-pulse'
            )}
          >
            {hpPercent}%
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-2.5 bg-elevated rounded-full overflow-hidden border border-rule">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              hpPercent > 50 ? 'bg-heal' : hpPercent > 20 ? 'bg-gold' : 'bg-rose'
            )}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Seletor Normal / Resistente / Vulnerável */}
        <div
          role="group"
          aria-label="Modo de cálculo de dano"
          className="grid grid-cols-3 gap-1 bg-elevated p-1 rounded-xl border border-rule text-[11px] sm:text-xs"
        >
          <button
            type="button"
            onClick={() => setStrategyMode('normal')}
            className={cn(
              'h-9 px-1.5 rounded-lg font-bold transition-all tap-control truncate',
              strategyMode === 'normal'
                ? 'bg-card text-ink shadow-sm border border-rule'
                : 'text-ink-soft hover:text-ink'
            )}
          >
            Normal (1x)
          </button>
          <button
            type="button"
            onClick={() => setStrategyMode('resistant')}
            className={cn(
              'h-9 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 tap-control truncate',
              strategyMode === 'resistant'
                ? 'bg-card text-ink shadow-sm border border-rule'
                : 'text-ink-soft hover:text-ink'
            )}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Resist. (½)</span>
          </button>
          <button
            type="button"
            onClick={() => setStrategyMode('vulnerable')}
            className={cn(
              'h-9 px-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1 tap-control truncate',
              strategyMode === 'vulnerable'
                ? 'bg-rose-soft text-rose shadow-sm border border-rose/30'
                : 'text-ink-soft hover:text-ink'
            )}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Vulner. (2x)</span>
          </button>
        </div>

        {/* Campo numérico direto para o teclado do Android + Aplicar Dano / Curar */}
        <div className="flex items-stretch gap-1.5 sm:gap-2">
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={999}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Valor..."
            aria-label="Valor personalizado de dano ou cura"
            className="w-24 sm:w-32 min-w-0 h-11 px-2.5 rounded-xl bg-elevated border border-rule text-sm font-bold text-ink placeholder:text-ink-faint placeholder:font-normal tabular-nums focus:outline-none focus:border-rose"
          />
          <button
            type="button"
            onClick={handleCustomDamage}
            disabled={!customAmount}
            className="flex-1 h-11 px-2 rounded-xl bg-rose-soft border border-rose/35 text-rose font-bold text-xs sm:text-sm tap-control disabled:opacity-40 truncate"
          >
            Aplicar Dano
          </button>
          <button
            type="button"
            onClick={handleCustomHeal}
            disabled={!customAmount}
            className="flex-1 h-11 px-2 rounded-xl bg-heal-soft border border-heal/35 text-heal font-bold text-xs sm:text-sm tap-control disabled:opacity-40 truncate"
          >
            Curar
          </button>
        </div>

        {/* Botões Rápidos (-5, -1, +1, +5) */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleApplyDamage(5)}
            className="h-11 bg-rose-soft/75 hover:bg-rose-soft border border-rose/30 text-rose rounded-xl font-serif text-base font-bold tabular-nums tap-control flex items-center justify-center"
            aria-label="Aplicar 5 de dano"
            title="Dano -5"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => handleApplyDamage(1)}
            className="h-11 bg-rose-soft/75 hover:bg-rose-soft border border-rose/30 text-rose rounded-xl font-serif text-base font-bold tabular-nums tap-control flex items-center justify-center"
            aria-label="Aplicar 1 de dano"
            title="Dano -1"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => handleApplyHeal(1)}
            className="h-11 bg-heal-soft/75 hover:bg-heal-soft border border-heal/30 text-heal rounded-xl font-serif text-base font-bold tabular-nums tap-control flex items-center justify-center"
            aria-label="Curar 1 de vida"
            title="Cura +1"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => handleApplyHeal(5)}
            className="h-11 bg-heal-soft/75 hover:bg-heal-soft border border-heal/30 text-heal rounded-xl font-serif text-base font-bold tabular-nums tap-control flex items-center justify-center"
            aria-label="Curar 5 de vida"
            title="Cura +5"
          >
            +5
          </button>
        </div>

        {/* PV Temporário & Dados de Vida */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rule">
          <div className="flex items-center justify-between gap-1 bg-elevated px-2.5 py-2 rounded-xl border border-rule">
            <div className="min-w-0">
              <span className="text-ink-soft text-[10px] uppercase tracking-wider block font-bold truncate">
                PV Temp.
              </span>
              <strong className="font-serif text-gold text-base sm:text-lg font-bold tabular-nums">
                {character.temp_hp}
              </strong>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  actions.adjustTempHp(-1);
                }}
                aria-label="Diminuir PV temporário"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-card hover:bg-rule text-ink rounded-lg flex items-center justify-center text-sm font-bold border border-rule tap-control"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  actions.adjustTempHp(1);
                }}
                aria-label="Aumentar PV temporário"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-gold-soft border border-gold/30 text-gold rounded-lg flex items-center justify-center text-sm font-bold tap-control"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 bg-elevated px-2.5 py-2 rounded-xl border border-rule">
            <div className="min-w-0">
              <span className="text-ink-soft text-[10px] uppercase tracking-wider block font-bold truncate">
                Dados Vida
              </span>
              <span className="font-serif font-bold text-ink text-base sm:text-lg tabular-nums">
                {character.hit_dice_current !== undefined && character.hit_dice_current !== null
                  ? character.hit_dice_current
                  : character.level}
                <span className="text-xs font-sans text-ink-soft font-normal ml-0.5">
                  /{character.level}
                </span>
              </span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  actions.adjustHitDice(-1);
                }}
                aria-label="Gastar dado de vida"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-card hover:bg-rule text-ink rounded-lg flex items-center justify-center text-sm font-bold border border-rule tap-control"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  actions.adjustHitDice(1);
                }}
                aria-label="Recuperar dado de vida"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-card hover:bg-rule text-ink rounded-lg flex items-center justify-center text-sm font-bold border border-rule tap-control"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Testes Contra a Morte */}
        <div className="bg-elevated px-3 py-2 rounded-xl border border-rule flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-ink-soft flex items-center gap-1.5 uppercase tracking-wider">
            <Skull className="w-4 h-4 text-ink-soft" />
            Morte:
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center text-xs">
              <span className="text-heal font-semibold mr-1">Sucessos</span>
              {[0, 1, 2].map((idx) => (
                <InteractivePipButton
                  key={`s-${idx}`}
                  filled={idx < character.death_successes}
                  variant="heal"
                  label={`Sucesso ${idx + 1}`}
                  title={`Sucesso ${idx + 1}`}
                  onToggle={() => {
                    triggerHaptic('tap');
                    actions.toggleDeathSave('success', idx);
                  }}
                />
              ))}
            </div>
            <div className="flex items-center text-xs">
              <span className="text-rose font-semibold mr-1">Falhas</span>
              {[0, 1, 2].map((idx) => (
                <InteractivePipButton
                  key={`f-${idx}`}
                  filled={idx < character.death_failures}
                  variant="rose"
                  label={`Falha ${idx + 1}`}
                  title={`Falha ${idx + 1}`}
                  onToggle={() => {
                    triggerHaptic('tap');
                    actions.toggleDeathSave('failure', idx);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
