import React from 'react';
import { useCharacterActions } from '../../context/CharacterContext';
import { calculateModifier, formatModifier } from '../../utils/dnd';
import type { EnrichedCharacter, AbilityKey } from '../../types/dnd5e';
import { ABILITY_META } from '../../data/rulesGlossary';
import { cn } from '../../lib/utils';
import { SectionTitle } from '../ui/SectionTitle';
import { ProficiencyPip } from '../ui/Pip';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface AbilityScoresGridProps {
  character: EnrichedCharacter;
  onExplain?: (entry: ExplainEntry) => void;
}

const ABILITIES: AbilityKey[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

interface AbilityCardItemProps {
  abilityKey: AbilityKey;
  score: number;
  formattedMod: string;
  formattedSaveMod: string;
  isProficient: boolean;
  profBonus: number;
  onToggleSave: () => void;
  onExplain?: (entry: ExplainEntry) => void;
}

const AbilityCardItem: React.FC<AbilityCardItemProps> = ({
  abilityKey,
  score,
  formattedMod,
  formattedSaveMod,
  isProficient,
  profBonus,
  onToggleSave,
  onExplain,
}) => {
  const meta = ABILITY_META[abilityKey];

  const holdProps = useHoldToExplain(
    {
      title: `${meta.name} (${meta.abbr})`,
      subtitle: `Valor Bruto ${score} • Modificador ${formattedMod}`,
      badge: formattedMod,
      formula: isProficient
        ? `Teste: 1d20 ${formattedMod} • Salvaguarda: 1d20 ${formattedMod} + Proficiência (+${profBonus}) = ${formattedSaveMod}`
        : `Teste: 1d20 ${formattedMod} • Salvaguarda: 1d20 ${formattedSaveMod}`,
      description: meta.summary,
      tip: meta.tableTip,
      actionLabel: isProficient
        ? 'Remover Proficiência na Salvaguarda'
        : 'Marcar Proficiência na Salvaguarda',
      onAction: onToggleSave,
    },
    onExplain
  );

  return (
    <div
      {...holdProps}
      className="codex-card p-2.5 sm:p-3 flex flex-col justify-between holdable cursor-context-menu"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          {meta.abbr}
        </span>
        <span className="text-[11px] font-semibold text-ink-soft tabular-nums px-1.5 py-0.5 rounded-md bg-elevated border border-rule">
          {score}
        </span>
      </div>

      <div className="my-1 flex items-baseline justify-between gap-1">
        <span className="font-serif text-2xl sm:text-3xl font-bold text-ink tabular-nums leading-none">
          {formattedMod}
        </span>
        <span className="text-[10px] text-ink-soft truncate">{meta.name}</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('tap');
          onToggleSave();
        }}
        title="Alternar proficiência de salvaguarda"
        className="w-full h-8 pt-1.5 border-t border-rule flex items-center justify-between text-[11px] tap-control"
      >
        <span className="flex items-center gap-1 text-ink-soft">
          <ProficiencyPip level={isProficient ? 'proficient' : 'none'} />
          <span>Res.</span>
        </span>
        <span
          className={cn(
            'font-bold tabular-nums',
            isProficient ? 'text-rose' : 'text-ink'
          )}
        >
          {formattedSaveMod}
        </span>
      </button>
    </div>
  );
};

export const AbilityScoresGrid: React.FC<AbilityScoresGridProps> = ({
  character,
  onExplain,
}) => {
  const actions = useCharacterActions();

  return (
    <section aria-label="Atributos e Salvaguardas">
      <SectionTitle
        title="Atributos & Salvaguardas"
        right="Segure para ler a regra"
      />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
        {ABILITIES.map((key) => {
          const score = character[key];
          const mod = character.modifiers?.[key] ?? calculateModifier(score);
          const formattedMod = formatModifier(mod);
          const save = character.saving_throws?.[key];
          const saveMod = save ? save.modifier : mod;
          const formattedSaveMod = formatModifier(saveMod);
          const isProficient = save?.proficient ?? false;

          return (
            <AbilityCardItem
              key={key}
              abilityKey={key}
              score={score}
              formattedMod={formattedMod}
              formattedSaveMod={formattedSaveMod}
              isProficient={isProficient}
              profBonus={character.proficiency_bonus}
              onToggleSave={() => actions.toggleSavingThrow(key)}
              onExplain={onExplain}
            />
          );
        })}
      </div>
    </section>
  );
};
