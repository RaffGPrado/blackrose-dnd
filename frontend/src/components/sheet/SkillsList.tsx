import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import { formatModifier } from '../../utils/dnd';
import type { AbilityKey, EnrichedCharacter, SkillKey } from '../../types/dnd5e';
import { ABILITY_META, SKILL_DESCRIPTIONS } from '../../data/rulesGlossary';
import { cn } from '../../lib/utils';
import { SectionTitle } from '../ui/SectionTitle';
import { ProficiencyPip } from '../ui/Pip';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface SkillsListProps {
  character: EnrichedCharacter;
  onExplain?: (entry: ExplainEntry) => void;
}

interface SkillRowItemProps {
  skillKey: SkillKey;
  name: string;
  ability: AbilityKey;
  abilityMod: number;
  totalMod: number;
  profBonus: number;
  proficient: boolean;
  onToggleSkill: () => void;
  onExplain?: (entry: ExplainEntry) => void;
}

const SkillRowItem: React.FC<SkillRowItemProps> = ({
  skillKey,
  name,
  ability,
  abilityMod,
  totalMod,
  profBonus,
  proficient,
  onToggleSkill,
  onExplain,
}) => {
  const meta = ABILITY_META[ability];
  const formattedTotal = formatModifier(totalMod);
  const formattedAbil = formatModifier(abilityMod);

  const holdProps = useHoldToExplain(
    {
      title: name,
      subtitle: `Perícia de ${meta.name} (${meta.abbr})`,
      badge: formattedTotal,
      formula: proficient
        ? `1d20 + ${meta.abbr} (${formattedAbil}) + Proficiência (+${profBonus}) = ${formattedTotal}`
        : `1d20 + ${meta.abbr} (${formattedAbil}) = ${formattedTotal}`,
      description:
        SKILL_DESCRIPTIONS[skillKey] ||
        'Some este modificador ao seu d20 físico quando o Mestre pedir um teste desta perícia.',
      actionLabel: proficient ? 'Remover Proficiência' : 'Marcar como Proficiente',
      onAction: onToggleSkill,
    },
    onExplain
  );

  return (
    <div
      {...holdProps}
      className="min-h-tap px-3.5 py-2 flex items-center gap-2.5 holdable cursor-context-menu border-b border-rule/70 last:border-b-0"
    >
      <button
        type="button"
        onClick={() => {
          triggerHaptic('tap');
          onToggleSkill();
        }}
        title="Toque para alternar proficiência"
        className="flex items-center gap-2.5 text-left flex-1 min-h-11 tap-control"
      >
        <ProficiencyPip level={proficient ? 'proficient' : 'none'} />
        <span
          className={cn(
            'text-sm text-ink',
            proficient ? 'font-bold' : 'font-medium'
          )}
        >
          {name}
        </span>
        <span className="text-xs text-ink-soft uppercase tracking-wider">
          {meta.abbr}
        </span>
      </button>

      <span
        aria-hidden="true"
        className="flex-1 border-b border-dotted border-rule-strong mx-1 translate-y-0.5"
      />

      <span
        className={cn(
          'font-serif text-lg font-bold tabular-nums min-w-[36px] text-right',
          proficient ? 'text-rose' : 'text-ink-soft'
        )}
      >
        {formattedTotal}
      </span>
    </div>
  );
};

export const SkillsList: React.FC<SkillsListProps> = ({ character, onExplain }) => {
  const actions = useCharacterActions();
  const [search, setSearch] = useState('');
  const [onlyProficient, setOnlyProficient] = useState(false);

  const skillsEntries = Object.entries(character.skills || {}) as [
    SkillKey,
    EnrichedCharacter['skills'][SkillKey],
  ][];

  const filteredSkills = skillsEntries.filter(([_, data]) => {
    if (onlyProficient && !data.proficient) return false;
    return data.name.toLowerCase().includes(search.toLowerCase());
  });

  const perceptionMod = character.skills?.perception?.modifier ?? 0;
  const passivePerception = 10 + perceptionMod;

  const passiveHold = useHoldToExplain(
    {
      title: 'Sabedoria Passiva (Percepção)',
      badge: String(passivePerception),
      formula: `10 (Base) + Percepção (${formatModifier(perceptionMod)}) = ${passivePerception}`,
      description:
        'Usada pelo Mestre para determinar se você nota ameaças ocultas, armadilhas ou inimigos furtivos sem precisar rolar um d20.',
    },
    onExplain
  );

  return (
    <div className="space-y-4">
      {/* Banner de Percepção Passiva */}
      <div
        {...passiveHold}
        className="codex-card px-4 py-3 flex items-center justify-between holdable cursor-context-menu"
      >
        <div className="flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-rose shrink-0" />
          <div>
            <span className="text-sm font-bold text-ink block">Percepção Passiva</span>
            <span className="text-xs text-ink-soft">Base 10 + Bônus de Percepção</span>
          </div>
        </div>
        <div className="font-serif text-2xl font-bold text-ink tabular-nums px-3 py-1 rounded-xl bg-elevated border border-rule">
          {passivePerception}
        </div>
      </div>

      {/* Cabeçalho do Livro de Perícias + Filtro */}
      <SectionTitle
        title="Livro de Perícias"
        right={
          <div className="inline-flex rounded-xl bg-elevated p-0.5 border border-rule">
            <button
              type="button"
              onClick={() => setOnlyProficient(false)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                !onlyProficient ? 'bg-card text-ink shadow-sm' : 'text-ink-soft'
              )}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setOnlyProficient(true)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                onlyProficient ? 'bg-rose-soft text-rose shadow-sm' : 'text-ink-soft'
              )}
            >
              Treinadas
            </button>
          </div>
        }
      />

      {/* Busca */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-soft" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar perícia (ex: Atletismo, Furtividade)..."
          className="w-full min-h-tap bg-card border border-rule focus:border-rose rounded-2xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all"
        />
      </div>

      {/* Lista com Linhas Pontilhadas Editoriais */}
      <div className="codex-card overflow-hidden">
        {filteredSkills.map(([key, data]) => (
          <SkillRowItem
            key={key}
            skillKey={key}
            name={data.name}
            ability={data.ability}
            abilityMod={character.modifiers?.[data.ability] ?? 0}
            totalMod={data.modifier}
            profBonus={character.proficiency_bonus}
            proficient={data.proficient}
            onToggleSkill={() => actions.toggleSkill(key)}
            onExplain={onExplain}
          />
        ))}
      </div>
    </div>
  );
};
