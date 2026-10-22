import React from 'react';
import { Plus, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpellCard } from '../../types/dnd5e';

interface SpellCardGridProps {
  spells: SpellCard[];
  viewMode: 'grid' | 'list';
  activeTab: 'equipped' | 'catalog';
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  isEquipped: (spellId: number) => boolean;
  onAddSpell: (spell: SpellCard) => void;
  onRemoveSpell: (spellId: number) => void;
  getSchoolBadgeStyle: (school?: string) => string;
}

export const SpellCardGrid: React.FC<SpellCardGridProps> = ({
  spells, viewMode, activeTab, currentPage, totalPages,
  setCurrentPage, isEquipped, onAddSpell, onRemoveSpell, getSchoolBadgeStyle
}) => {
  if (spells.length === 0) {
    return (
      <div className="text-center py-12 text-dnd-dim border border-dashed border-dnd-border rounded-xl">
        <p className="text-xs">Nenhuma magia encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {spells.map((spell) => {
            const equipped = isEquipped(spell.id);
            return (
              <div key={spell.id} className="group relative flex flex-col items-center">
                <div className="w-full aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-dnd-border relative bg-dnd-surface transition-transform duration-300 group-hover:scale-[1.03]">
                  {spell.image_url ? (
                    <img src={spell.image_url} alt={spell.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#1a1c29] to-[#0f111a]">
                      <span className="text-xs font-black text-white/80 mb-1">{spell.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSchoolBadgeStyle(spell.school)}`}>
                        {spell.school || 'Mágica'}
                      </span>
                    </div>
                  )}
                  {equipped && (
                    <div className="absolute top-2 right-2 bg-dnd-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-white/20 uppercase tracking-widest">
                      Equip.
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 sm:p-3 gap-1.5">
                    {spell.image_url && (
                      <div className="text-center mb-1">
                        <div className="text-[10px] sm:text-xs font-black text-white leading-tight">{spell.name}</div>
                        <div className="text-[8px] sm:text-[9px] text-gray-300">
                          {spell.level === 0 ? 'Truque' : `${spell.level}º Círculo`}
                        </div>
                      </div>
                    )}
                    {activeTab === 'catalog' ? (
                      <button
                        type="button"
                        onClick={() => equipped ? onRemoveSpell(spell.id) : onAddSpell(spell)}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          equipped
                            ? 'bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm'
                            : 'bg-dnd-blue/90 hover:bg-dnd-blue text-white backdrop-blur-sm shadow-md'
                        }`}
                      >
                        {equipped ? <><Trash2 className="w-3 h-3" /> Remover</> : <><Plus className="w-3 h-3" /> Equipar</>}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRemoveSpell(spell.id)}
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Esquecer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {spells.map((spell) => {
            const equipped = isEquipped(spell.id);
            return (
              <div key={spell.id} className="bg-dnd-surface border border-dnd-border rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-dnd-blue/30 transition-colors">
                <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-dnd-elevated border border-dnd-border">
                  {spell.image_url ? (
                    <img src={spell.image_url} alt={spell.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dnd-dim">
                      <Eye className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{spell.name}</h4>
                    <span className={`flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSchoolBadgeStyle(spell.school)}`}>
                      {spell.level === 0 ? 'Truque' : `${spell.level}º Círc.`}
                    </span>
                  </div>
                  <div className="text-[10px] text-dnd-muted flex items-center gap-2 truncate">
                    <span><strong className="text-dnd-dim">Tempo:</strong> {spell.casting_time}</span>
                    <span>•</span>
                    <span><strong className="text-dnd-dim">Alcance:</strong> {spell.range}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 pl-2">
                  {activeTab === 'catalog' ? (
                    <button
                      type="button"
                      onClick={() => equipped ? onRemoveSpell(spell.id) : onAddSpell(spell)}
                      className={`p-2 rounded-lg transition-colors ${
                        equipped ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'text-dnd-blue bg-dnd-blue-faint hover:bg-dnd-blue/20'
                      }`}
                      title={equipped ? "Remover do Grimório" : "Equipar"}
                    >
                      {equipped ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRemoveSpell(spell.id)}
                      className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      title="Esquecer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-dnd-border">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-dnd-elevated text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dnd-surface border border-dnd-border transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-dnd-muted">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-dnd-elevated text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dnd-surface border border-dnd-border transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
