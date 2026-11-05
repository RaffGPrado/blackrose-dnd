import React from 'react';
import { Plus, Trash2, Scale } from 'lucide-react';
import { useCharacterActions } from '../../context/CharacterContext';
import type { EnrichedCharacter, InventoryItem } from '../../types/dnd5e';
import { SectionTitle } from '../ui/SectionTitle';
import { triggerHaptic } from '../../hooks/useHaptics';
import { useHoldToExplain, type ExplainEntry } from '../../hooks/useHoldToExplain';

interface InventoryTabProps {
  characterId: number;
  character: EnrichedCharacter;
  items: InventoryItem[];
  onOpenAddItemModal: () => void;
  onExplain?: (entry: ExplainEntry) => void;
}

interface ItemRowCardProps {
  item: InventoryItem;
  onDelete: (id: number) => void;
  onExplain?: (entry: ExplainEntry) => void;
}

const ItemRowCard: React.FC<ItemRowCardProps> = ({ item, onDelete, onExplain }) => {
  const holdProps = useHoldToExplain(
    {
      title: item.name,
      subtitle: `Quantidade: x${item.quantity} • Peso: ${(item.weight * item.quantity).toFixed(1)} kg`,
      badge: `x${item.quantity}`,
      description: item.effect || 'Item registrado na mochila do personagem.',
    },
    onExplain
  );

  return (
    <div
      {...holdProps}
      className="codex-card p-3.5 flex items-center justify-between gap-3 holdable cursor-context-menu"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink truncate">{item.name}</span>
          <span className="text-xs font-bold text-ink-soft bg-elevated px-2 py-0.5 rounded-md border border-rule tabular-nums shrink-0">
            x{item.quantity}
          </span>
          {item.weight > 0 && (
            <span className="text-xs text-ink-soft tabular-nums shrink-0">
              ({(item.weight * item.quantity).toFixed(1)} kg)
            </span>
          )}
        </div>
        {item.effect && (
          <p className="text-xs text-ink-soft leading-relaxed mt-1">{item.effect}</p>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('tap');
          onDelete(item.id);
        }}
        className="w-11 h-11 text-ink-soft hover:text-rose hover:bg-elevated rounded-xl flex items-center justify-center tap-control shrink-0"
        title="Excluir item"
        aria-label={`Excluir ${item.name}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const InventoryTab: React.FC<InventoryTabProps> = ({
  character,
  items,
  onOpenAddItemModal,
  onExplain,
}) => {
  const actions = useCharacterActions();
  const totalWeight = items.reduce(
    (acc, item) => acc + (Number(item.weight) || 0) * (Number(item.quantity) || 1),
    0
  );
  const maxCarryWeight = (character.strength || 10) * 7.5;

  const COIN_CONFIG = [
    { key: 'coins_gp' as const, label: 'PO', name: 'Ouro', isGold: true },
    { key: 'coins_sp' as const, label: 'PP', name: 'Prata', isGold: false },
    { key: 'coins_cp' as const, label: 'PC', name: 'Cobre', isGold: false },
    { key: 'coins_pp' as const, label: 'PL', name: 'Platina', isGold: false },
  ];

  return (
    <div className="space-y-5">
      {/* 1. BOLSA DE MOEDAS */}
      <section aria-label="Bolsa de Moedas">
        <SectionTitle title="Bolsa de Moedas" right="Toque em − / + para ajustar" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COIN_CONFIG.map((c) => {
            const amount = character[c.key] || 0;
            return (
              <div
                key={c.key}
                className="codex-card p-3 flex flex-col justify-between gap-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  {c.label} ({c.name})
                </span>
                <div
                  className={`font-serif text-2xl font-bold tabular-nums ${
                    c.isGold ? 'text-gold' : 'text-ink'
                  }`}
                >
                  {amount}
                </div>
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-rule">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      actions.adjustCoin(c.key, -1);
                    }}
                    aria-label={`Diminuir ${c.name}`}
                    className="flex-1 h-11 bg-elevated hover:bg-rule text-ink rounded-xl text-sm font-bold flex items-center justify-center border border-rule tap-control"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      actions.adjustCoin(c.key, 1);
                    }}
                    aria-label={`Aumentar ${c.name}`}
                    className="flex-1 h-11 bg-elevated hover:bg-rule text-ink rounded-xl text-sm font-bold flex items-center justify-center border border-rule tap-control"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. ITENS NA MOCHILA */}
      <section aria-label="Itens na Mochila" className="space-y-2.5">
        <SectionTitle
          title="Itens na Mochila"
          right={
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-soft flex items-center gap-1 tabular-nums">
                <Scale className="w-3.5 h-3.5" />
                <span>
                  Peso: {totalWeight.toFixed(1)} / {maxCarryWeight} kg
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  onOpenAddItemModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-soft/80 hover:bg-rose-soft text-rose border border-rose/30 rounded-xl text-xs font-bold tap-control"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>
          }
        />

        {items.length === 0 ? (
          <div className="codex-card text-center py-8 px-4 text-ink-soft text-xs border-dashed">
            Sua mochila está vazia. Toque em "Adicionar" para registrar poções, equipamentos e tesouros.
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <ItemRowCard
                key={item.id}
                item={item}
                onDelete={(id) => actions.deleteItem(id)}
                onExplain={onExplain}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
