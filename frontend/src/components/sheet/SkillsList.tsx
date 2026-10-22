import React, { useState } from 'react';
import { Search, CheckCircle2, Circle, Eye } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import { formatModifier } from '../../utils/dnd';
import type { EnrichedCharacter, SkillKey } from '../../types/dnd5e';

interface SkillsListProps {
  character: EnrichedCharacter;
}

export const SkillsList: React.FC<SkillsListProps> = ({ character }) => {
  const actions = useCharacterActions();
  const [search, setSearch] = useState('');

  const skillsEntries = Object.entries(character.skills || {}) as [SkillKey, EnrichedCharacter['skills'][SkillKey]][];

  const filteredSkills = skillsEntries.filter(([_, data]) =>
    data.name.toLowerCase().includes(search.toLowerCase())
  );

  const perceptionMod = character.skills?.perception?.modifier ?? 0;
  const passivePerception = 10 + perceptionMod;

  return (
    <div className="space-y-3.5">
      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-dnd-gold-faint text-dnd-gold">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-dnd-muted font-bold uppercase tracking-wider block">Percepção Passiva</span>
            <span className="text-xs text-dnd-dim">Base 10 + Bônus de Percepção</span>
          </div>
        </div>
        <div className="text-xl font-black text-dnd-gold bg-dnd-elevated px-3 py-1 rounded-xl border border-dnd-border">
          {passivePerception}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-dnd-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar perícia (ex: Atletismo, Furtividade)..."
          className="w-full bg-dnd-surface border border-dnd-border focus:border-dnd-rose/60 rounded-2xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filteredSkills.map(([key, data]) => {
          const formattedMod = formatModifier(data.modifier);

          return (
            <div
              key={key}
              className="bg-dnd-surface border border-dnd-border/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between hover:bg-dnd-elevated transition-all"
            >
              <button
                type="button"
                onClick={() => actions.toggleSkill(key)}
                className="flex items-center gap-2.5 text-left flex-1 min-h-11"
                title="Toque para alternar proficiência"
              >
                {data.proficient ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-dnd-dim shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-bold block ${data.proficient ? 'text-white' : 'text-gray-300'}`}>
                    {data.name}
                  </span>
                  <span className="text-[10px] text-dnd-dim block uppercase font-medium">
                    {data.ability.slice(0, 3)}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                    data.proficient
                      ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                      : 'bg-dnd-elevated border border-dnd-border text-gray-300'
                  }`}
                >
                  {formattedMod}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
