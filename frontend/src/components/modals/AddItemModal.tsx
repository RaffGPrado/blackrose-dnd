import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Package, Search, X, Plus, BookOpen, Sparkles } from 'lucide-react';
import { useCompendiumItems } from '../../hooks/useCompendium';
import type { InventoryItem, ReferenceItem } from '../../types/dnd5e';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<InventoryItem, 'id' | 'character_id'>) => Promise<void>;
}

function getCategoryBadge(category: string): string {
  if (category.includes('Arma')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  if (category.includes('Armadura') || category.includes('Escudo')) return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  if (category.includes('Consumível')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (category.includes('Ferramenta')) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-dnd-elevated text-dnd-muted border-dnd-border';
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [mode, setMode] = useState<'compendium' | 'custom'>('compendium');
  const [selectedCompendiumItem, setSelectedCompendiumItem] = useState<ReferenceItem | null>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState(0);
  const [effect, setEffect] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    items: filteredCatalog,
    loading: loadingCatalog,
    search: searchQuery,
    setSearch: setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useCompendiumItems();

  useEffect(() => {
    if (!isOpen) {
      setSelectedCompendiumItem(null);
      setSearchQuery('');
      setSelectedCategory('Todas');
      setName('');
      setQuantity(1);
      setWeight(0);
      setEffect('');
    }
  }, [isOpen, setSearchQuery, setSelectedCategory]);

  const handleSelectOfficialItem = (item: ReferenceItem) => {
    setSelectedCompendiumItem(item);
    setName(item.name);
    setWeight(item.weight || 0);
    setQuantity(1);

    const parts: string[] = [];
    if (item.damage) parts.push(`Dano: ${item.damage}`);
    if (item.armor_class) parts.push(`CA: ${item.armor_class}`);
    if (item.properties && item.properties !== '-') parts.push(`Propriedades: ${item.properties}`);
    if (item.cost) parts.push(`Custo: ${item.cost}`);
    if (item.description) parts.push(item.description);

    setEffect(parts.join(' • '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAddItem({
      name: name.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      weight: Number(weight) || 0,
      effect: effect.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Item na Mochila"
      icon={<Package className="w-4 h-4 text-dnd-rose" />}
    >
      <div className="space-y-3.5">
        <div className="flex bg-dnd-elevated p-1 rounded-xl border border-dnd-border">
          <button
            type="button"
            onClick={() => {
              setMode('compendium');
              setSelectedCompendiumItem(null);
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
            {!selectedCompendiumItem ? (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-dnd-dim" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar item oficial (ex: Espada, Couro, Poção)..."
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
                    {[
                      { label: 'Todas', val: 'Todas' },
                      { label: 'Armas', val: 'Arma' },
                      { label: 'Armaduras & Escudos', val: 'Armadura' },
                      { label: 'Consumíveis', val: 'Consumível' },
                      { label: 'Aventura', val: 'Aventura' },
                      { label: 'Ferramentas', val: 'Ferramenta' },
                    ].map((cat) => (
                      <button
                        key={cat.val}
                        type="button"
                        onClick={() => setSelectedCategory(cat.val)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors min-h-8 ${
                          selectedCategory === cat.val
                            ? 'bg-dnd-rose text-white'
                            : 'bg-dnd-elevated text-dnd-muted hover:text-white border border-dnd-border'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingCatalog ? (
                  <div className="py-8 text-center text-xs text-dnd-dim animate-pulse">
                    Carregando catálogo de equipamentos oficiais...
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="py-8 text-center text-xs text-dnd-dim border border-dashed border-dnd-border rounded-xl p-4">
                    Nenhum item oficial encontrado com esses termos.{' '}
                    <button
                      type="button"
                      onClick={() => setMode('custom')}
                      className="text-dnd-rose underline font-semibold block mx-auto mt-1"
                    >
                      Criar como item personalizado
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[46vh] overflow-y-auto space-y-1.5 pr-1">
                    {filteredCatalog.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectOfficialItem(item)}
                        className="bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border rounded-xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-all active:scale-[0.99] group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-dnd-rose transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0 ${getCategoryBadge(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-dnd-dim mt-0.5 truncate">
                            {item.damage && <span>Dano: {item.damage} • </span>}
                            {item.armor_class && <span>CA: {item.armor_class} • </span>}
                            {item.weight > 0 ? `${item.weight} kg` : 'Leve'}
                            {item.cost && <span> • {item.cost}</span>}
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
                      Item Oficial Selecionado
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCompendiumItem(null)}
                      className="text-xs text-dnd-dim hover:text-white underline p-1"
                    >
                      Trocar Item
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white">{name}</h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-dnd-surface p-2 rounded-lg border border-dnd-border">
                      <span className="text-[10px] text-dnd-dim block">Peso Unitário</span>
                      <span className="font-bold text-white">{weight} kg</span>
                    </div>
                    <div className="bg-dnd-surface p-2 rounded-lg border border-dnd-border">
                      <span className="text-[10px] text-dnd-dim block">Peso Total</span>
                      <span className="font-bold text-white">{(weight * quantity).toFixed(1)} kg</span>
                    </div>
                  </div>

                  {effect && (
                    <div className="text-[11px] text-dnd-muted bg-dnd-surface p-2 rounded-lg border border-dnd-border leading-relaxed">
                      {effect}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-dnd-muted mb-1">
                    Quantidade a Adicionar
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-11 h-11 rounded-xl bg-dnd-elevated border border-dnd-border text-white text-base font-black hover:bg-dnd-highlight active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="flex-1 bg-dnd-elevated border border-dnd-border rounded-xl h-11 text-center text-base sm:text-sm font-bold text-white focus:outline-none focus:border-dnd-rose/60"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-11 h-11 rounded-xl bg-dnd-elevated border border-dnd-border text-white text-base font-black hover:bg-dnd-highlight active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCompendiumItem(null)}
                    className="w-1/2 py-2.5 bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border text-dnd-text text-xs font-bold rounded-xl transition-colors min-h-11"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-dnd-rose hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all min-h-11"
                  >
                    {loading ? 'Salvando...' : 'Adicionar à Mochila'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {mode === 'custom' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-dnd-muted mb-1">Nome do Item</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Poção de Cura Maior, Corda de Seda"
                className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white placeholder-dnd-dim focus:outline-none focus:border-dnd-rose/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-dnd-muted mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-rose/60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dnd-muted mb-1">Peso Unitário (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-dnd-elevated border border-dnd-border rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-dnd-rose/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dnd-muted mb-1">Efeito / Descrição</label>
              <textarea
                rows={3}
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
                placeholder="Propriedades mágicas, dano ou utilidade..."
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
                {loading ? 'Salvando...' : 'Salvar Item'}
              </button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
