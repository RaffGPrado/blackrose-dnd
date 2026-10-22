import React, { useState } from 'react';
import type { DMRosterItem } from '../../types/dnd5e';
import { ArrowRight, Swords, Shield, Heart, Sparkles } from 'lucide-react';
import { compareByInitiative } from '../../utils/dnd';

interface InitiativeTrackerProps {
  characters: DMRosterItem[];
  activeTurnId: number | null;
  onAdvanceTurn: () => void;
  onSelectTurn: (id: number) => void;
  onSetInitiative: (characterId: number, val: number | null) => Promise<void>;
}

export const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  characters,
  activeTurnId,
  onAdvanceTurn,
  onSelectTurn,
  onSetInitiative,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initValue, setInitValue] = useState<string>('');

  if (characters.length === 0) {
    return null;
  }

  const sorted = [...characters].sort(compareByInitiative);

  const handleStartEdit = (e: React.MouseEvent, char: DMRosterItem) => {
    e.stopPropagation();
    setEditingId(char.id);
    setInitValue(char.current_initiative !== null && char.current_initiative !== undefined ? String(char.current_initiative) : '');
  };

  const handleSaveEdit = async (characterId: number) => {
    const num = initValue.trim() === '' ? null : Number(initValue);
    await onSetInitiative(characterId, isNaN(num as number) ? null : num);
    setEditingId(null);
  };

  return (
    <section aria-label="Rastreador de Iniciativa" className="bg-dnd-surface border border-dnd-border rounded-2xl p-3.5 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-dnd-gold-faint text-dnd-gold">
            <Swords className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-dnd-gold">
            Ordem de Iniciativa
          </h2>
        </div>

        <button
          type="button"
          onClick={onAdvanceTurn}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dnd-gold hover:bg-amber-400 active:scale-95 text-gray-950 font-bold text-xs rounded-xl transition-all shadow-sm min-h-[36px]"
          title="Avançar para o próximo na ordem de iniciativa"
        >
          <span>Próximo Turno</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {sorted.map((char, index) => {
          const isActive = char.id === activeTurnId;
          const isDead = char.current_hp <= 0;

          return (
            <div
              key={char.id}
              onClick={() => onSelectTurn(char.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-amber-950/70 border-dnd-gold text-amber-100 shadow-md ring-1 ring-dnd-gold/50 scale-105'
                  : 'bg-dnd-elevated border-dnd-border hover:border-dnd-highlight text-dnd-text'
              }`}
            >
              <span className={`text-[10px] font-black w-4 text-center ${isActive ? 'text-dnd-gold' : 'text-dnd-dim'}`}>
                #{index + 1}
              </span>

              {editingId === char.id ? (
                <input
                  type="number"
                  autoFocus
                  value={initValue}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setInitValue(e.target.value)}
                  onBlur={() => handleSaveEdit(char.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(char.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-10 px-1 py-0.5 text-xs text-center bg-gray-900 border border-amber-500 rounded text-amber-300 font-bold"
                />
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleStartEdit(e, char)}
                  className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-black/70 border border-gray-700/60 text-xs font-bold text-amber-400"
                  title="Clique para editar iniciativa"
                >
                  {char.current_initiative !== null && char.current_initiative !== undefined
                    ? char.current_initiative
                    : '-'}
                </button>
              )}

              <div className="flex flex-col">
                <span className={`text-xs font-bold leading-tight ${isDead ? 'line-through text-rose-400' : ''}`}>
                  {char.name}
                </span>
                <span className="text-[10px] text-gray-500 leading-none">
                  {char.class_name || 'Herói'} {char.level}
                </span>
              </div>

              <div className="flex items-center gap-0.5 text-[11px] font-bold text-rose-400 ml-1">
                <Heart className="w-2.5 h-2.5" />
                <span>{char.current_hp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
