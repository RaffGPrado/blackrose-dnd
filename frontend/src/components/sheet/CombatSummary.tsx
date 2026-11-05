import React from 'react';
import { Sparkles } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { EnrichedCharacter } from '../../types/dnd5e';
import { cn } from '../../lib/utils';
import { SectionTitle } from '../ui/SectionTitle';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface CombatSummaryProps {
  character: EnrichedCharacter;
  onExplain?: (entry: ExplainEntry) => void;
}

interface StatConsultTileProps {
  label: string;
  value: string | number;
  sub: string;
  explain: ExplainEntry;
  onExplain?: (entry: ExplainEntry) => void;
}

const StatConsultTile: React.FC<StatConsultTileProps> = ({
  label,
  value,
  sub,
  explain,
  onExplain,
}) => {
  const holdProps = useHoldToExplain(explain, onExplain);

  return (
    <div
      {...holdProps}
      className="codex-card p-3 text-center holdable cursor-context-menu"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft block">
        {label}
      </span>
      <span className="font-serif text-2xl font-bold text-ink tabular-nums block mt-0.5 leading-tight">
        {value}
      </span>
      <span className="text-[11px] text-ink-soft block mt-0.5">{sub}</span>
    </div>
  );
};

export const CombatSummary: React.FC<CombatSummaryProps> = ({
  character,
  onExplain,
}) => {
  const actions = useCharacterActions();
  const inspired = character.inspiration === 1;

  return (
    <section aria-label="Resumo de Defesa e Movimento">
      <SectionTitle title="Defesa & Movimento" right="Segure para ler a regra" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatConsultTile
          label="CA"
          value={character.armor_class}
          sub="Classe de Armadura"
          onExplain={onExplain}
          explain={{
            title: 'Classe de Armadura (CA)',
            badge: String(character.armor_class),
            formula: `Valor total atual: ${character.armor_class}`,
            description:
              'Representa quão difícil é acertar você em combate. Jogadas de ataque inimigas precisam igualar ou superar este valor para causar dano.',
          }}
        />

        <StatConsultTile
          label="Iniciativa"
          value={character.formatted_initiative}
          sub="Modificador DES"
          onExplain={onExplain}
          explain={{
            title: 'Iniciativa',
            badge: character.formatted_initiative,
            formula: `1d20 físico + Destreza (${character.formatted_initiative})`,
            description:
              'No início de cada combate, role 1d20 na mesa e some este modificador para definir a ordem dos turnos.',
          }}
        />

        <StatConsultTile
          label="Proficiência"
          value={`+${character.proficiency_bonus}`}
          sub={`Desloc. ${character.speed || 9}m`}
          onExplain={onExplain}
          explain={{
            title: 'Bônus de Proficiência',
            badge: `+${character.proficiency_bonus}`,
            formula: `Nível ${character.level} concede +${character.proficiency_bonus} • Deslocamento: ${character.speed || 9}m`,
            description:
              'Somado às suas jogadas de ataque com armas treinadas, CD de magias e perícias ou salvaguardas em que você é proficiente.',
          }}
        />

        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            actions.toggleInspiration();
          }}
          aria-pressed={inspired}
          title="Toque para alternar Inspiração"
          className={cn(
            'codex-card p-3 flex flex-col items-center justify-between text-center tap-control',
            inspired && 'bg-gold-soft border-gold text-gold'
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            Inspiração
          </span>
          <Sparkles
            className={cn(
              'w-6 h-6 my-1 transition-transform',
              inspired ? 'text-gold fill-gold scale-110' : 'text-ink-faint'
            )}
          />
          <span
            className={cn(
              'text-[11px] font-bold',
              inspired ? 'text-gold' : 'text-ink-soft'
            )}
          >
            {inspired ? '★ Ativa!' : 'Inativa'}
          </span>
        </button>
      </div>
    </section>
  );
};
