import React from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import type { DND5eCondition } from '../../types/dnd5e';

export const ALL_CONDITIONS: { name: DND5eCondition; color: string; desc: string }[] = [
  { name: 'Caído', color: 'bg-amber-950/80 text-amber-300 border-amber-800/80', desc: 'Deslocamento 0 para se levantar gasta metade. Ataques corpo a corpo têm vantagem.' },
  { name: 'Envenenado', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80', desc: 'Desvantagem em jogadas de ataque e testes de atributo.' },
  { name: 'Inconsciente', color: 'bg-rose-950 text-rose-300 border-rose-800', desc: 'Incapacitado, não pode se mover. Ataques a 1.5m são acertos críticos.' },
  { name: 'Cego', color: 'bg-slate-900 text-slate-300 border-slate-700', desc: 'Não pode ver. Falha automática em testes que exigem visão.' },
  { name: 'Atordoado', color: 'bg-purple-950/80 text-purple-300 border-purple-800/80', desc: 'Incapacitado, não pode se mover. Falha em salvaguardas FOR/DES.' },
  { name: 'Paralisado', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80', desc: 'Incapacitado. Ataques a 1.5m são acertos críticos.' },
  { name: 'Amedrontado', color: 'bg-orange-950/80 text-orange-300 border-orange-800/80', desc: 'Desvantagem enquanto a fonte do medo estiver na linha de visão.' },
  { name: 'Enfeitiçado', color: 'bg-pink-950/80 text-pink-300 border-pink-800/80', desc: 'Não pode atacar o conjurador, conjurador tem vantagem em testes sociais.' },
  { name: 'Agarrado', color: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80', desc: 'Deslocamento se torna 0.' },
  { name: 'Confinado', color: 'bg-teal-950/80 text-teal-300 border-teal-800/80', desc: 'Deslocamento 0. Desvantagem em testes de resistência de DES.' },
  { name: 'Incapacitado', color: 'bg-red-950/80 text-red-300 border-red-800/80', desc: 'Não pode realizar ações nem reações.' },
  { name: 'Invisível', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80', desc: 'Impossível de ver sem meios mágicos. Ataques têm vantagem.' },
  { name: 'Petrificado', color: 'bg-stone-900 text-stone-300 border-stone-700', desc: 'Transformado em substância sólida. Peso decuplicado.' },
  { name: 'Surdo', color: 'bg-zinc-900 text-zinc-300 border-zinc-700', desc: 'Não pode ouvir. Falha em testes que exigem audição.' },
  { name: 'Exaustão', color: 'bg-red-950 text-red-400 border-red-800', desc: 'Efeitos cumulativos (Desvantagem, metade do deslocamento, etc).' },
];

interface DMConditionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  activeConditions: string[];
  onToggleCondition: (cond: DND5eCondition) => void;
}

export const DMConditionSelector: React.FC<DMConditionSelectorProps> = ({
  isOpen,
  onClose,
  characterName,
  activeConditions,
  onToggleCondition,
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Condições — ${characterName}`}>
      <div className="space-y-3 p-1">
        <p className="text-xs text-gray-400">
          Toque para ativar ou desativar condições de D&D 5e em tempo real:
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {ALL_CONDITIONS.map((cond) => {
            const isActive = activeConditions.includes(cond.name);
            return (
              <button
                key={cond.name}
                type="button"
                onClick={() => onToggleCondition(cond.name)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? `${cond.color} ring-1 ring-white/20 shadow-md scale-[0.99]`
                    : 'bg-[#181824] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">{cond.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-700'
                    }`}
                  />
                </div>
                <p className="text-[10px] leading-tight line-clamp-2 opacity-80">{cond.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
};
