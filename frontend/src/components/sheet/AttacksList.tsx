import React from 'react';
import { Sword, Plus, Trash2 } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { AttackItem } from '../../types/dnd5e';

interface AttacksListProps {
  characterId: number;
  attacks: AttackItem[];
  onOpenAddModal: () => void;
}

export const AttacksList: React.FC<AttacksListProps> = ({
  attacks,
  onOpenAddModal,
}) => {
  const actions = useCharacterActions();

  return (
    <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-dnd-rose-faint text-dnd-rose">
            <Sword className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-dnd-text uppercase tracking-wider">Ataques & Armas</h3>
        </div>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dnd-rose-faint hover:bg-rose-600/30 text-rose-300 border border-dnd-rose/40 rounded-xl text-xs font-semibold active:scale-95 transition-all min-h-11 min-w-11"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Arma</span>
        </button>
      </div>

      {attacks.length === 0 ? (
        <div className="text-center py-8 text-dnd-muted text-xs border border-dashed border-dnd-border rounded-xl">
          Nenhuma arma cadastrada. Toque em "Adicionar Arma" para registrar espada, arco, adaga...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attacks.map((att) => (
            <div
              key={att.id}
              className="bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border rounded-xl p-3 flex items-center justify-between transition-all group"
            >
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{att.name}</span>
                  <span className="text-xs font-black text-dnd-rose bg-dnd-rose-faint px-1.5 py-0.5 rounded-md">
                    {att.bonus}
                  </span>
                </div>
                <p className="text-[11px] text-dnd-muted mt-0.5">{att.damage_type}</p>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => actions.deleteAttack(att.id)}
                  className="p-2 text-dnd-dim hover:text-dnd-rose hover:bg-dnd-surface rounded-lg transition-colors min-h-11 min-w-11 flex items-center justify-center"
                  title="Excluir arma"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
