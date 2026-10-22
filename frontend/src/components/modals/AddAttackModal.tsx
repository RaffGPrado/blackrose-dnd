import React, { useState, useEffect, useMemo } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Sword, BookOpen, Search, X } from 'lucide-react';
import { useCompendiumItems } from '../../hooks/useCompendium';
import type { AttackItem, ReferenceItem } from '../../types/dnd5e';

interface AddAttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAttack: (attack: Omit<AttackItem, 'id' | 'character_id'>) => Promise<void>;
}

export const AddAttackModal: React.FC<AddAttackModalProps> = ({
  isOpen,
  onClose,
  onAddAttack,
}) => {
  const [mode, setMode] = useState<'compendium' | 'custom'>('compendium');
  const [name, setName] = useState('');
  const [bonus, setBonus] = useState('+5');
  const [damageType, setDamageType] = useState('1d8 Cortante');
  const [loading, setLoading] = useState(false);
  const [selectedCompendiumItem, setSelectedCompendiumItem] = useState<ReferenceItem | null>(null);

  const {
    allItems,
    loading: loadingCatalog,
    search: searchQuery,
    setSearch: setSearchQuery,
  } = useCompendiumItems();

  useEffect(() => {
    if (!isOpen) {
      setSelectedCompendiumItem(null);
      setSearchQuery('');
      setName('');
      setBonus('+5');
      setDamageType('1d8 Cortante');
    }
  }, [isOpen, setSearchQuery]);

  const weapons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const isWeapon = item.category.toLowerCase().includes('arma') || Boolean(item.damage);
      if (!isWeapon) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || (item.damage && item.damage.toLowerCase().includes(q));
    });
  }, [allItems, searchQuery]);

  const handleSelectOfficialItem = (item: ReferenceItem) => {
    setSelectedCompendiumItem(item);
    setName(item.name);
    setBonus('+0');
    setDamageType(item.damage || '1d8');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAddAttack({ name: name.trim(), bonus: bonus.trim(), damage_type: damageType.trim() });
    setLoading(false);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Adicionar Arma / Ataque" icon={<Sword className="w-4 h-4 text-rose-400" />}>
      <div className="space-y-3.5">
        <div className="flex bg-[#191b29] p-1 rounded-xl border border-gray-700/50">
          <button
            type="button"
            onClick={() => {
              setMode('compendium');
              setSelectedCompendiumItem(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'compendium'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Compêndio (Armas)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Personalizado</span>
          </button>
        </div>

        {mode === 'compendium' && (
          <div className="space-y-3">
            {!selectedCompendiumItem ? (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar arma oficial (ex: Espada)..."
                    className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl pl-9 pr-8 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white p-1 min-h-8 min-w-8 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {loadingCatalog ? (
                  <div className="py-8 text-center text-xs text-gray-500 animate-pulse">
                    Carregando armas oficiais...
                  </div>
                ) : weapons.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-700 rounded-xl p-4">
                    Nenhuma arma encontrada.{' '}
                    <button
                      type="button"
                      onClick={() => setMode('custom')}
                      className="text-rose-400 underline font-semibold block mx-auto mt-1"
                    >
                      Criar ataque personalizado
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[46vh] overflow-y-auto space-y-1.5 pr-1">
                    {weapons.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectOfficialItem(item)}
                        className="bg-[#191b29] border border-gray-700/80 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-rose-500/50 hover:bg-[#202336] transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-gray-400">
                            {item.damage} • {item.properties}
                          </div>
                        </div>
                        <div className="text-rose-400 font-bold text-xs">
                          {item.cost || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 bg-[#191b29] border border-rose-500/30 p-3 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-black text-rose-400">{selectedCompendiumItem.name}</h3>
                    <p className="text-xs text-gray-400">{selectedCompendiumItem.properties}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCompendiumItem(null)}
                    className="text-xs text-gray-400 hover:text-white underline p-1"
                  >
                    Trocar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700/50">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Bônus de Ataque</label>
                    <input
                      type="text"
                      required
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      placeholder="+0"
                      className="w-full bg-[#0f111a] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Dano Base</label>
                    <input
                      type="text"
                      required
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value)}
                      className="w-full bg-[#0f111a] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button type="button" onClick={onClose} className="w-1/2 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl min-h-11">Cancelar</button>
                  <button type="submit" disabled={loading} className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 min-h-11">
                    {loading ? 'Equipando...' : 'Adicionar Arma'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {mode === 'custom' && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Nome do Ataque/Magia</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Raio de Fogo"
                className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Bônus</label>
                <input
                  type="text"
                  required
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  placeholder="+5"
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Dano / Tipo</label>
                <input
                  type="text"
                  required
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  placeholder="1d8 Fogo"
                  className="w-full bg-[#191b29] border border-gray-700/80 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl min-h-11"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 min-h-11"
              >
                {loading ? 'Salvando...' : 'Salvar Ataque'}
              </button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
