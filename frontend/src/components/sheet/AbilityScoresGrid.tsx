import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import { calculateModifier, formatModifier } from '../../utils/dnd';
import type { EnrichedCharacter, AbilityKey } from '../../types/dnd5e';

interface AbilityScoresGridProps {
  character: EnrichedCharacter;
}

const ABILITIES: { key: AbilityKey; label: string; name: string }[] = [
  { key: 'strength', label: 'FOR', name: 'Força' },
  { key: 'dexterity', label: 'DES', name: 'Destreza' },
  { key: 'constitution', label: 'CON', name: 'Constituição' },
  { key: 'intelligence', label: 'INT', name: 'Inteligência' },
  { key: 'wisdom', label: 'SAB', name: 'Sabedoria' },
  { key: 'charisma', label: 'CAR', name: 'Carisma' },
];

export const AbilityScoresGrid: React.FC<AbilityScoresGridProps> = ({ character }) => {
  const actions = useCharacterActions();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {ABILITIES.map((ab) => {
          const score = character[ab.key];
          const mod = character.modifiers?.[ab.key] ?? calculateModifier(score);
          const formattedMod = formatModifier(mod);
          const save = character.saving_throws?.[ab.key];
          const saveMod = save ? save.modifier : mod;
          const formattedSaveMod = formatModifier(saveMod);
          const isProficient = save?.proficient ?? false;

          return (
            <div
              key={ab.key}
              className="bg-dnd-surface border border-dnd-border rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-sm relative group hover:border-dnd-highlight transition-all"
            >
              <span className="text-[11px] font-black text-dnd-muted uppercase tracking-wider">{ab.label}</span>

              <div className="my-1.5 px-2 py-0.5">
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {formattedMod}
                </div>
              </div>

              <div className="text-[11px] text-dnd-muted font-semibold mb-2">
                Valor: <strong className="text-gray-200">{score}</strong>
              </div>

              <div className="w-full pt-2 border-t border-dnd-border/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => actions.toggleSavingThrow(ab.key)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 rounded-lg transition-all min-h-8 ${
                    isProficient
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700/60'
                      : 'text-dnd-dim hover:text-dnd-muted'
                  }`}
                  title="Alternar proficiência de salvaguarda"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isProficient ? 'text-emerald-400' : 'text-gray-600'}`} />
                  <span>Res.</span>
                </button>

                <span className="text-[11px] font-black text-gray-300">
                  {formattedSaveMod}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
