import React from 'react';
import { Flame, Plus, Trash2, Sparkles } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { ClassFeature } from '../../types/dnd5e';

interface FeaturesTabProps {
  characterId: number;
  features: ClassFeature[];
  onOpenAddModal: () => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  features,
  onOpenAddModal,
}) => {
  const actions = useCharacterActions();

  return (
    <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-dnd-gold-faint text-dnd-gold">
            <Flame className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-dnd-text uppercase tracking-wider">Habilidades & Talentos</h3>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dnd-gold-faint hover:bg-amber-500/30 text-amber-300 border border-dnd-gold/40 rounded-xl text-xs font-semibold active:scale-95 transition-all min-h-11 min-w-11"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-8 text-dnd-dim text-xs border border-dashed border-dnd-border rounded-xl">
          Nenhuma habilidade cadastrada. Toque em "Adicionar" para registrar Fúria, Ataque Furtivo, Visão no Escuro...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {features.map((feat) => (
            <div
              key={feat.id}
              className="bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border rounded-xl p-3.5 space-y-2 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-dnd-gold shrink-0" />
                    <span className="text-xs font-bold text-white">{feat.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {feat.uses_max > 0 && (
                      <div className="flex items-center gap-1 bg-dnd-surface px-2 py-0.5 rounded-lg border border-dnd-border">
                        <span className="text-[10px] text-dnd-muted font-semibold mr-0.5">Usos:</span>
                        <button
                          type="button"
                          onClick={() => actions.adjustFeatureUsage(feat.id, -1)}
                          className="w-8 h-8 bg-dnd-elevated hover:bg-dnd-highlight text-dnd-muted hover:text-white rounded text-xs font-bold flex items-center justify-center active:scale-95 min-h-8 min-w-8"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-dnd-gold px-1">
                          {feat.uses_current}/{feat.uses_max}
                        </span>
                        <button
                          type="button"
                          onClick={() => actions.adjustFeatureUsage(feat.id, 1)}
                          className="w-8 h-8 bg-amber-900/80 hover:bg-amber-800 text-amber-200 rounded text-xs font-bold flex items-center justify-center active:scale-95 min-h-8 min-w-8"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => actions.deleteFeature(feat.id)}
                      className="p-2 text-dnd-dim hover:text-dnd-rose hover:bg-dnd-surface rounded-lg transition-colors min-h-9 min-w-9 flex items-center justify-center"
                      title="Remover habilidade"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {feat.description && (
                  <p className="text-[11px] text-dnd-muted leading-relaxed mt-1.5">{feat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
