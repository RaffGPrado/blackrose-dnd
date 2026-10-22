import React from 'react';
import { Shield, Zap, Sparkles, Star } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { EnrichedCharacter } from '../../types/dnd5e';

interface CombatSummaryProps {
  character: EnrichedCharacter;
}

export const CombatSummary: React.FC<CombatSummaryProps> = ({ character }) => {
  const actions = useCharacterActions();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-3 shadow-sm flex flex-col justify-between hover:border-dnd-highlight transition-all">
        <span className="text-[11px] text-dnd-muted font-bold uppercase tracking-wider">
          <span className="xs:hidden">CA</span>
          <span className="hidden xs:inline">Classe de Armadura</span>
        </span>
        <div className="flex items-center justify-center gap-1.5 my-1 text-xl font-black text-dnd-blue">
          <Shield className="w-4 h-4" />
          <span>{character.armor_class}</span>
        </div>
        <span className="text-[10px] text-dnd-dim">Escudo / Armadura</span>
      </div>

      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-3 shadow-sm flex flex-col justify-between hover:border-dnd-highlight transition-all">
        <span className="text-[11px] text-dnd-muted font-bold uppercase tracking-wider">
          Iniciativa
        </span>
        <div className="flex items-center justify-center gap-1.5 my-1 text-xl font-black text-dnd-gold">
          <Zap className="w-4 h-4 fill-dnd-gold/20" />
          <span>{character.formatted_initiative}</span>
        </div>
        <span className="text-[10px] text-dnd-dim">Modificador DES</span>
      </div>

      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-3 shadow-sm flex flex-col justify-between hover:border-dnd-highlight transition-all">
        <span className="text-[11px] text-dnd-muted font-bold uppercase tracking-wider">Proficiência</span>
        <div className="flex items-center justify-center gap-1.5 my-1 text-xl font-black text-fuchsia-400">
          <Sparkles className="w-4 h-4" />
          <span>+{character.proficiency_bonus}</span>
        </div>
        <span className="text-[10px] text-dnd-dim">Bônus Geral</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => actions.toggleInspiration()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actions.toggleInspiration(); } }}
        className={`border rounded-2xl p-3 shadow-sm flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[80px] ${
          character.inspiration === 1
            ? 'bg-amber-950/40 border-dnd-gold/80 shadow-dnd-glow'
            : 'bg-dnd-surface border-dnd-border hover:border-dnd-highlight'
        }`}
        title="Toque para alternar Inspiração"
      >
        <span className="text-[11px] text-dnd-muted font-bold uppercase tracking-wider">Inspiração</span>
        <div className="flex items-center justify-center my-1">
          <Star
            className={`w-6 h-6 transition-all ${
              character.inspiration === 1
                ? 'text-dnd-gold fill-dnd-gold scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'text-gray-600'
            }`}
          />
        </div>
        <span className={`text-[10px] font-semibold ${character.inspiration === 1 ? 'text-dnd-gold-light' : 'text-dnd-dim'}`}>
          {character.inspiration === 1 ? '★ Ativa!' : 'Inativa'}
        </span>
      </div>
    </div>
  );
};
