import React from 'react';
import { ArrowLeft, Star, Edit3, Moon } from 'lucide-react';
import type { EnrichedCharacter } from '../../types/dnd5e';

interface MobileTopBarProps {
  character: EnrichedCharacter;
  onBack: () => void;
  onOpenEditModal: () => void;
  onLongRest: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  character,
  onBack,
  onOpenEditModal,
  onLongRest,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-dnd-surface/95 backdrop-blur-md border-b border-dnd-border px-4 py-3 sm:px-6 flex items-center justify-between">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-dnd-muted hover:text-white px-2.5 py-2 rounded-xl hover:bg-dnd-elevated transition-colors font-semibold active:scale-95 min-h-[40px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden xs:inline">Fichas</span>
      </button>

      {/* Center Character Identity */}
      <div className="text-center flex-1 px-2">
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-sm sm:text-base font-black text-white truncate max-w-[180px] xs:max-w-xs sm:max-w-md tracking-tight">
            {character.name}
          </h1>
          {character.inspiration === 1 && (
            <span title="Inspirado!">
              <Star className="w-3.5 h-3.5 text-dnd-gold fill-dnd-gold animate-pulse shrink-0" />
            </span>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-dnd-muted font-medium truncate">
          {character.race_name || 'Herói'} • {character.class_name || 'Aventureiro'} (Nv {character.level})
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenEditModal}
          className="p-2 sm:px-3 sm:py-2 text-dnd-muted hover:text-dnd-rose hover:bg-dnd-elevated rounded-xl transition-colors active:scale-95 min-h-[40px] flex items-center gap-1.5 text-xs font-semibold"
          title="Editar Ficha"
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden md:inline">Editar</span>
        </button>
        <button
          type="button"
          onClick={onLongRest}
          className="p-2 sm:px-3 sm:py-2 text-dnd-muted hover:text-dnd-gold hover:bg-dnd-elevated rounded-xl transition-colors active:scale-95 min-h-[40px] flex items-center gap-1.5 text-xs font-semibold"
          title="Descanso Longo"
        >
          <Moon className="w-4 h-4" />
          <span className="hidden md:inline">Descanso</span>
        </button>
      </div>
    </header>
  );
};
