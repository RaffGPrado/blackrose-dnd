import React, { useState } from 'react';
import { Edit2, Sparkles, X, Check, RotateCcw } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import type { SpellSlot } from '../../types/dnd5e';

interface SpellSlotManagerProps {
  spellSlots: SpellSlot[];
  onToggleSlot: (slotLevel: number, currentUsed: number, maxSlots: number, circleIndex: number) => void;
  onRestoreAllSlots: () => void;
  isRestoringSlots: boolean;
  onSaveSlotsConfig: (newSlots: SpellSlot[]) => Promise<void>;
}

export const SpellSlotManager: React.FC<SpellSlotManagerProps> = ({
  spellSlots,
  onToggleSlot,
  onRestoreAllSlots,
  isRestoringSlots,
  onSaveSlotsConfig,
}) => {
  const activeSlots = spellSlots.filter((s) => s.max_slots > 0);
  const hasUsedSlots = activeSlots.some((s) => s.used_slots > 0);

  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [editingSlots, setEditingSlots] = useState<SpellSlot[]>([]);

  const openSlotsModal = () => {
    setEditingSlots([...spellSlots]);
    setShowSlotsModal(true);
  };

  const updateEditingSlotMax = (slotLevel: number, delta: number) => {
    setEditingSlots((prev) =>
      prev.map((s) => {
        if (s.slot_level === slotLevel) {
          const next = Math.max(0, Math.min(10, (s.max_slots || 0) + delta));
          return { ...s, max_slots: next };
        }
        return s;
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSlotsConfig(editingSlots);
    setShowSlotsModal(false);
  };

  return (
    <div className="bg-dnd-surface border border-dnd-border rounded-xl p-4 shadow-dnd-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-dnd-blue-faint text-dnd-blue">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-dnd-text uppercase tracking-wider">Espaços de Magia</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasUsedSlots && (
            <button
              type="button"
              onClick={onRestoreAllSlots}
              disabled={isRestoringSlots}
              className="text-[10px] font-bold text-dnd-blue hover:text-white bg-dnd-blue-faint px-2 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isRestoringSlots ? 'animate-spin' : ''}`} />
              Restaurar
            </button>
          )}
          <button
            type="button"
            onClick={openSlotsModal}
            className="text-dnd-muted hover:text-white p-1 transition-colors"
            title="Editar quantidade de slots"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeSlots.length === 0 ? (
        <div className="text-center py-4 bg-dnd-elevated rounded-xl border border-dashed border-dnd-border">
          <p className="text-xs text-dnd-dim mb-2">Seu personagem não possui espaços de magia configurados.</p>
          <button
            type="button"
            onClick={openSlotsModal}
            className="text-xs font-bold text-dnd-blue underline"
          >
            Configurar Slots
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSlots.map((slot) => (
            <div key={slot.slot_level} className="flex items-center justify-between bg-dnd-elevated p-2 rounded-xl">
              <span className="text-[11px] font-bold text-dnd-muted w-16 text-center bg-[#191a24] rounded-lg py-1 border border-dnd-border/50">
                {slot.slot_level}º Círculo
              </span>
              <div className="flex gap-1.5 flex-1 justify-end flex-wrap pl-2">
                {Array.from({ length: slot.max_slots }).map((_, i) => {
                  const isUsed = i < slot.used_slots;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onToggleSlot(slot.slot_level, slot.used_slots, slot.max_slots, i)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        isUsed
                          ? 'bg-dnd-elevated border-dnd-border/60 text-transparent opacity-40 shadow-inner'
                          : 'bg-gradient-to-br from-dnd-blue to-indigo-600 border-indigo-400/30 text-white shadow-md shadow-dnd-blue/20 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {!isUsed && <div className="w-2.5 h-2.5 rounded-full bg-white/30" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE SLOTS */}
      <BottomSheet
        isOpen={showSlotsModal}
        onClose={() => setShowSlotsModal(false)}
        title="Configurar Espaços de Magia"
        icon={<Sparkles className="w-4 h-4 text-dnd-blue" />}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-xs text-dnd-dim text-center mb-4">
            Ajuste a quantidade máxima de slots que seu personagem possui para cada círculo de magia (conforme a tabela da sua classe).
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {editingSlots.map((slot) => (
              <div key={slot.slot_level} className="bg-dnd-elevated border border-dnd-border rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-white">{slot.slot_level}º Círculo</span>
                <div className="flex items-center gap-2 bg-dnd-surface rounded-lg p-0.5 border border-dnd-border">
                  <button
                    type="button"
                    onClick={() => updateEditingSlotMax(slot.slot_level, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-dnd-elevated hover:bg-dnd-muted/20 text-white active:scale-95 transition-all"
                  >-</button>
                  <span className="text-xs font-black w-3 text-center">{slot.max_slots || 0}</span>
                  <button
                    type="button"
                    onClick={() => updateEditingSlotMax(slot.slot_level, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-dnd-elevated hover:bg-dnd-muted/20 text-white active:scale-95 transition-all"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowSlotsModal(false)}
              className="w-1/2 py-3 bg-dnd-surface hover:bg-dnd-elevated text-dnd-muted font-bold text-xs rounded-xl transition-colors border border-dnd-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-dnd-blue hover:bg-dnd-blue/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-dnd-blue/20 active:scale-95 transition-all flex justify-center items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Salvar Slots
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
