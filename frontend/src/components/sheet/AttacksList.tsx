import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { AttackItem } from '../../types/dnd5e';
import { SectionTitle } from '../ui/SectionTitle';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface AttacksListProps {
  characterId: number;
  attacks: AttackItem[];
  onOpenAddModal: () => void;
  onExplain?: (entry: ExplainEntry) => void;
}

interface AttackRowCardProps {
  attack: AttackItem;
  onDelete: (id: number) => void;
  onExplain?: (entry: ExplainEntry) => void;
}

const AttackRowCard: React.FC<AttackRowCardProps> = ({
  attack,
  onDelete,
  onExplain,
}) => {
  const holdProps = useHoldToExplain(
    {
      title: attack.name,
      subtitle: 'Ataque & Dano na Mesa',
      badge: attack.bonus,
      formula: `Role 1d20 físico e some ${attack.bonus} contra a CA do alvo`,
      description: `Dano causado ao acertar: ${attack.damage_type}.`,
    },
    onExplain
  );

  return (
    <div
      {...holdProps}
      className="codex-card px-3.5 py-3 flex items-center justify-between gap-3 holdable cursor-context-menu"
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-ink truncate">{attack.name}</div>
        <p className="text-xs text-ink-soft mt-0.5">{attack.damage_type}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right px-2.5 border-l border-rule">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
            Bônus
          </span>
          <span className="font-serif text-xl font-bold text-rose tabular-nums">
            {attack.bonus}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('tap');
            onDelete(attack.id);
          }}
          className="w-11 h-11 text-ink-soft hover:text-rose hover:bg-elevated rounded-xl flex items-center justify-center tap-control"
          title="Excluir arma"
          aria-label={`Excluir ${attack.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const AttacksList: React.FC<AttacksListProps> = ({
  attacks,
  onOpenAddModal,
  onExplain,
}) => {
  const actions = useCharacterActions();

  return (
    <section aria-label="Ataques e Armas" className="space-y-2.5">
      <SectionTitle
        title="Ataques & Armas"
        right={
          <button
            type="button"
            onClick={() => {
              triggerHaptic('tap');
              onOpenAddModal();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-soft/80 hover:bg-rose-soft text-rose border border-rose/30 rounded-xl text-xs font-bold tap-control"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Arma</span>
          </button>
        }
      />

      {attacks.length === 0 ? (
        <div className="codex-card text-center py-8 px-4 text-ink-soft text-xs border-dashed">
          Nenhuma arma cadastrada. Toque em "Adicionar Arma" para registrar espada, arco, adaga...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attacks.map((att) => (
            <AttackRowCard
              key={att.id}
              attack={att}
              onDelete={(id) => actions.deleteAttack(id)}
              onExplain={onExplain}
            />
          ))}
        </div>
      )}
    </section>
  );
};
