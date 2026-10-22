import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Flame, Search, X, Plus, BookOpen, Sparkles } from 'lucide-react';
import { useCompendiumFeatures } from '../../hooks/useCompendium';
import type { ClassFeature, ReferenceFeature } from '../../types/dnd5e';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeature: (feature: Omit<ClassFeature, 'id' | 'character_id'>) => Promise<void>;
  characterClassName?: string;
}

function getClassBadge(className?: string | null): string {
  switch (className?.toLowerCase()) {
    case 'bárbaro':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'bardo':
      return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
    case 'clérigo':
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    case 'druida':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'guerreiro':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'monge':
      return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    case 'paladino':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'patrulheiro':
      return 'bg-lime-500/15 text-lime-400 border-lime-500/30';
    case 'ladino':
      return 'bg-stone-500/20 text-stone-300 border-stone-500/30';
    case 'feiticeiro':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'bruxo':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'mago':
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    default:
      return 'bg-dnd-elevated text-dnd-muted border-dnd-border';
  }
}

export const AddFeatureModal: React.FC<AddFeatureModalProps> = ({
  isOpen,
  onClose,
  onAddFeature,
  characterClassName,
}) => {
  const [mode, setMode] = useState<'compendium' | 'custom'>('compendium');
  const [selectedCompendiumFeature, setSelectedCompendiumFeature] = useState<ReferenceFeature | null>(null);

  const [name, setName] = useState('');
  const [usesMax, setUsesMax] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    features: filteredCatalog,
    loading: loadingCatalog,
    search: searchQuery,
    setSearch: setSearchQuery,
    selectedClass,
    setSelectedClass,
    classes,
  } = useCompendiumFeatures();

  useEffect(() => {
    if (isOpen && characterClassName) {
      setSelectedClass(characterClassName);
    }
    if (!isOpen) {
      setSelectedCompendiumFeature(null);
      setSearchQuery('');
      setName('');
      setUsesMax(0);
      setDescription('');
    }
  }, [isOpen, characterClassName, setSearchQuery, setSelectedClass]);

  const handleSelectOfficialFeature = (feat: ReferenceFeature) => {
    setSelectedCompendiumFeature(feat);
    setName(feat.name);
    setUsesMax(feat.uses_max || 0);
    setDescription(feat.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAddFeature({
      name: name.trim(),
      uses_max: Math.max(0, Number(usesMax) || 0),
      uses_current: Math.max(0, Number(usesMax) || 0),
      description: description.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Habilidade / Talento"
      icon={<Flame className="w-4 h-4 text-dnd-gold" />}
    >
      <div className="space-y-3.5">
        <div className="flex bg-dnd-elevated p-1 rounded-xl border border-dnd-border">
          <button
            type="button"
            onClick={() => {
              setMode('compendium');
              setSelectedCompendiumFeature(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'compendium' ? 'bg-dnd-rose text-white shadow-sm' : 'text-dnd-muted hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Compêndio Oficial (SRD 2014)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'custom' ? 'bg-dnd-rose text-white shadow-sm' : 'text-dnd-muted hover:text-white'
            }`}
          >
            <span>Personalizado</span>
          </button>
        </div>

        {mode === 'compendium' && (
          <div className="space-y-3">
            {!selectedCompendiumFeature ? (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-dnd-dim" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar habilidade ou talento (ex: Fúria, Sentinela)..."
                      className="w-full bg-dnd-elevated border border-dnd-border rounded-xl pl-9 pr-8 py-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-rose/60"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-dnd-dim hover:text-white p-1 min-h-8 min-w-8 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                    {classes.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors min-h-8 ${
                          selectedClass === cls
                            ? 'bg-dnd-rose text-white'
                            : 'bg-dnd-elevated text-dnd-muted hover:text-white border border-dnd-border'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingCatalog ? (
                  <div className="py-8 text-center text-xs text-dnd-dim animate-pulse">
                    Carregando catálogo de características oficiais...
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="py-8 text-center text-xs text-dnd-dim border border-dashed border-dnd-border rounded-xl p-4">
                    Nenhuma característica oficial encontrada.{' '}
                    <button
                      type="button"
                      onClick={() => setMode('custom')}
                      className="text-dnd-rose underline font-semibold block mx-auto mt-1"
                    >
                      Criar como habilidade personalizada
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[46vh] overflow-y-auto space-y-1.5 pr-1">
                    {filteredCatalog.map((feat) => (
                      <div
                        key={feat.id}
                        onClick={() => handleSelectOfficialFeature(feat)}
                        className="bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border rounded-xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-all active:scale-[0.99] group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-dnd-rose transition-colors truncate">
                              {feat.name}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${getClassBadge(feat.class_name)}`}>
                              {feat.source_type === 'Talento' ? 'Talento' : `${feat.class_name} nv ${feat.level}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-dnd-dim mt-0.5 truncate">
                            {feat.uses_max > 0 ? `${feat.uses_max} uso(s) • ${feat.recovery}` : feat.recovery}
                            {feat.description && ` • ${feat.description}`}
                          </div>
                        </div>

                        <div className="px-2.5 py-1 bg-dnd-surface group-hover:bg-dnd-rose group-hover:text-white border border-dnd-border text-dnd-text text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1 min-h-8">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in duration-150">
                <div className="bg-dnd-elevated border border-dnd-border rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-dnd-rose tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-dnd-gold" />
                      Característica Oficial Selecionada
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCompendiumFeature(null)}
                      className="text-xs text-dnd-dim hover:text-white underline p-1"
                    >
                      Trocar Habilidade
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${getClassBadge(selectedCompendiumFeature.class_name)}`}>
                      {selectedCompendiumFeature.source_type === 'Talento' ? 'Talento' : `${selectedCompendiumFeature.class_name} nv ${selectedCompendiumFeature.level}`}
                    </span>
                  </div>

                  <div className="text-[11px] text-dnd-muted bg-dnd-surface p-2.5 rounded-lg border border-dnd-border leading-relaxed max-h-[25vh] overflow-y-auto">
                    {description}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dnd-muted mb-1">
                    Usos Máximos ({selectedCompendiumFeature.recovery || 'Descanso Longo'})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUsesMax((u) => Math.max(0, u - 1))}
                      className="w-11 h-11 rounded-xl bg-dnd-elevated border border-dnd-border text-white text-base font-black hover:bg-dnd-highlight active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={usesMax}
                      onChange={(e) => setUsesMax(Math.max(0, Number(e.target.value) || 0))}
                      className="flex-1 bg-dnd-elevated border border-dnd-border rounded-xl h-11 text-center text-base sm:text-sm font-bold text-white focus:outline-none focus:border-dnd-rose/60"
                    />
                    <button
                      type="button"
                      onClick={() => setUsesMax((u) => u + 1)}
                      className="w-11 h-11 rounded-xl bg-dnd-elevated border border-dnd-border text-white text-base font-black hover:bg-dnd-highlight active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompendiumFeature(null)}
                    className="w-1/2 py-2.5 bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border text-dnd-text text-xs font-bold rounded-xl transition-colors min-h-11"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-dnd-rose hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all min-h-11"
                  >
                    {loading ? 'Salvando...' : 'Adicionar à Ficha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {mode === 'custom' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-dnd-muted mb-1">Nome da Habilidade</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fúria, Canalizar Divindade"
                className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-rose/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dnd-muted mb-1">Usos Máximos (0 para passiva)</label>
              <input
                type="number"
                min="0"
                value={usesMax}
                onChange={(e) => setUsesMax(Number(e.target.value))}
                className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-rose/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dnd-muted mb-1">Descrição</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Efeito da habilidade, quando usar, regras..."
                className="w-full bg-dnd-elevated border border-dnd-border rounded-xl p-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-rose/60 resize-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border text-dnd-text text-xs font-bold rounded-xl transition-colors min-h-11"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 bg-dnd-rose hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all min-h-11"
              >
                {loading ? 'Salvando...' : 'Salvar Habilidade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
