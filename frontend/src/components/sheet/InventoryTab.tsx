import React from 'react';
import { Package, Plus, Trash2, Coins, Scale } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { EnrichedCharacter, InventoryItem } from '../../types/dnd5e';

interface InventoryTabProps {
  characterId: number;
  character: EnrichedCharacter;
  items: InventoryItem[];
  onOpenAddItemModal: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  character,
  items,
  onOpenAddItemModal,
}) => {
  const actions = useCharacterActions();
  const totalWeight = items.reduce((acc, item) => acc + (Number(item.weight) || 0) * (Number(item.quantity) || 1), 0);
  const maxCarryWeight = (character.strength || 10) * 7.5; 

  const COIN_CONFIG = [
    { key: 'coins_gp' as const, label: 'PO', name: 'Ouro', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { key: 'coins_sp' as const, label: 'PP', name: 'Prata', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
    { key: 'coins_cp' as const, label: 'PC', name: 'Cobre', color: 'text-amber-700', bg: 'bg-amber-700/10', border: 'border-amber-700/30' },
    { key: 'coins_pp' as const, label: 'PL', name: 'Platina', color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-dnd-gold-faint text-dnd-gold">
            <Coins className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-dnd-text uppercase tracking-wider">Bolsa de Moedas</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {COIN_CONFIG.map((c) => {
            const amount = character[c.key] || 0;
            return (
              <div
                key={c.key}
                className={`bg-dnd-elevated border ${c.border} rounded-xl p-3 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase ${c.color}`}>{c.label} ({c.name})</span>
                </div>
                <div className={`text-xl font-black my-1.5 ${c.color}`}>{amount}</div>
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-dnd-border/60">
                  <button
                    type="button"
                    onClick={() => actions.adjustCoin(c.key, -1)}
                    className="w-10 h-10 bg-dnd-surface hover:bg-dnd-highlight text-dnd-muted hover:text-white rounded text-sm font-bold flex items-center justify-center active:scale-95 border border-dnd-border transition-colors min-h-10 min-w-10"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.adjustCoin(c.key, 1)}
                    className={`w-10 h-10 ${c.bg} ${c.color} hover:brightness-125 rounded text-sm font-bold flex items-center justify-center active:scale-95 transition-all min-h-10 min-w-10`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-dnd-surface border border-dnd-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-dnd-rose-faint text-dnd-rose">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-dnd-text uppercase tracking-wider">Itens na Mochila</h3>
              <span className="text-[10px] text-dnd-muted flex items-center gap-1 mt-0.5">
                <Scale className="w-3 h-3 text-dnd-dim" />
                <span>Peso: {totalWeight.toFixed(1)} / {maxCarryWeight} kg</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddItemModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dnd-rose-faint hover:bg-rose-600/30 text-rose-300 border border-dnd-rose/40 rounded-xl text-xs font-semibold active:scale-95 transition-all min-h-11 min-w-11"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-dnd-dim text-xs border border-dashed border-dnd-border rounded-xl">
            Sua mochila está vazia. Toque em "Adicionar" para registrar poções, equipamentos e tesouros.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-dnd-elevated hover:bg-dnd-highlight border border-dnd-border rounded-xl p-3 flex items-center justify-between transition-all group"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span className="text-xs font-semibold text-dnd-dim bg-dnd-surface px-1.5 py-0.5 rounded border border-dnd-border">
                      x{item.quantity}
                    </span>
                    {item.weight > 0 && (
                      <span className="text-[10px] text-dnd-muted">
                        ({(item.weight * item.quantity).toFixed(1)} kg)
                      </span>
                    )}
                  </div>
                  {item.effect && (
                    <p className="text-[11px] text-dnd-muted leading-relaxed mt-1">{item.effect}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => actions.deleteItem(item.id)}
                    className="p-2 text-dnd-dim hover:text-dnd-rose hover:bg-dnd-surface rounded-lg transition-colors min-h-10 min-w-10 flex items-center justify-center"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
