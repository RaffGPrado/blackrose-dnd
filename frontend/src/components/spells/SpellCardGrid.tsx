import React from 'react';
import { Plus, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SpellCard } from '../../types/dnd5e';
import { triggerHaptic } from '../../hooks/useHaptics';

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

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="codex-card px-3.5 py-2.5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => {
          triggerHaptic('tap');
          onPageChange(Math.max(1, currentPage - 1));
        }}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        className="min-h-11 px-3 rounded-xl bg-elevated hover:bg-rule text-ink font-semibold text-xs flex items-center gap-1 border border-rule disabled:opacity-35 disabled:pointer-events-none tap-control"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Anterior</span>
      </button>

      <span className="font-serif text-sm font-bold text-ink tabular-nums">
        Página {currentPage} <span className="text-ink-soft font-normal">de {totalPages}</span>
      </span>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('tap');
          onPageChange(Math.min(totalPages, currentPage + 1));
        }}
        disabled={currentPage >= totalPages}
        aria-label="Próxima página"
        className="min-h-11 px-3 rounded-xl bg-elevated hover:bg-rule text-ink font-semibold text-xs flex items-center gap-1 border border-rule disabled:opacity-35 disabled:pointer-events-none tap-control"
      >
        <span>Próxima</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const SpellCardGrid: React.FC<SpellCardGridProps> = ({
  spells,
  viewMode,
  activeTab,
  currentPage,
  totalPages,
  setCurrentPage,
  isEquipped,
  onAddSpell,
  onRemoveSpell,
  getSchoolBadgeStyle,
}) => {
  if (spells.length === 0) {
    return (
      <div className="codex-card text-center py-12 px-4 text-ink-soft border-dashed">
        <p className="text-xs">
          {activeTab === 'equipped'
            ? 'Nenhuma magia equipada no seu Grimório. Toque na aba "Todas as Magias" acima para adicionar cartas.'
            : 'Nenhuma magia encontrada para este filtro.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Paginação no Topo */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {spells.map((spell) => {
            const equipped = isEquipped(spell.id);
            const imgUrl = spell.image_url || spell.image_path;

            return (
              <div
                key={spell.id}
                className="codex-card overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div className="w-full aspect-[2.5/3.5] relative bg-elevated overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={spell.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                      <span className="font-serif text-sm font-bold text-ink mb-1">
                        {spell.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSchoolBadgeStyle(
                          spell.school
                        )}`}
                      >
                        {spell.school || 'Magia'}
                      </span>
                    </div>
                  )}

                  {equipped && (
                    <div className="absolute top-2 right-2 bg-rose text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                      Equipada
                    </div>
                  )}
                </div>

                {/* Rodapé Tátil Sempre Visível no Android */}
                <div className="p-2 bg-card border-t border-rule flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-ink truncate">
                      {spell.name}
                    </div>
                    <div className="text-[10px] text-ink-soft">
                      {spell.level === 0 ? 'Truque' : `${spell.level}º Círculo`}
                    </div>
                  </div>

                  {activeTab === 'catalog' ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        if (equipped) {
                          onRemoveSpell(spell.id);
                        } else {
                          onAddSpell(spell);
                        }
                      }}
                      className={`min-h-10 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0 tap-control ${
                        equipped
                          ? 'bg-rose-soft text-rose border border-rose/30'
                          : 'bg-rose text-white shadow-sm'
                      }`}
                    >
                      {equipped ? (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Tirar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Equipar</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        onRemoveSpell(spell.id);
                      }}
                      title="Esquecer magia"
                      className="min-h-10 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 bg-rose-soft text-rose border border-rose/30 shrink-0 tap-control"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Tirar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {spells.map((spell) => {
            const equipped = isEquipped(spell.id);
            const imgUrl = spell.image_url || spell.image_path;

            return (
              <div
                key={spell.id}
                className="codex-card p-3 flex items-center gap-3 shadow-sm"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-elevated border border-rule">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={spell.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-faint">
                      <Eye className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-serif text-sm font-bold text-ink truncate">
                      {spell.name}
                    </h4>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSchoolBadgeStyle(
                        spell.school
                      )}`}
                    >
                      {spell.level === 0 ? 'Truque' : `${spell.level}º Círc.`}
                    </span>
                  </div>
                  <div className="text-xs text-ink-soft flex items-center gap-2 truncate">
                    <span>
                      <strong>Tempo:</strong> {spell.casting_time || '1 Ação'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Alcance:</strong> {spell.range || '9m'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-1">
                  {activeTab === 'catalog' ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        if (equipped) {
                          onRemoveSpell(spell.id);
                        } else {
                          onAddSpell(spell);
                        }
                      }}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center tap-control ${
                        equipped
                          ? 'text-rose bg-rose-soft border border-rose/30'
                          : 'text-white bg-rose'
                      }`}
                      title={equipped ? 'Remover do Grimório' : 'Equipar'}
                    >
                      {equipped ? (
                        <Trash2 className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        onRemoveSpell(spell.id);
                      }}
                      className="w-11 h-11 rounded-xl text-rose bg-rose-soft border border-rose/30 flex items-center justify-center tap-control"
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

      {/* Paginação no Rodapé */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
