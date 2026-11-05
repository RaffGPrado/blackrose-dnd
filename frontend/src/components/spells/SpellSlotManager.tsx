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
    <div className="codex-card p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-soft text-rose">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Espaços de Magia</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasUsedSlots && (
            <button
              type="button"
              onClick={onRestoreAllSlots}
              disabled={isRestoringSlots}
              className="text-[11px] font-bold text-rose bg-rose-soft border border-rose/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 tap-control"
            >
              <RotateCcw className={`w-3 h-3 ${isRestoringSlots ? 'animate-spin' : ''}`} />
              Restaurar
            </button>
          )}
          <button
            type="button"
            onClick={openSlotsModal}
            className="text-ink-soft hover:text-ink p-1.5 rounded-lg hover:bg-elevated transition-colors tap-control"
            title="Editar quantidade de slots"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeSlots.length === 0 ? (
        <div className="text-center py-4 bg-elevated rounded-xl border border-dashed border-rule">
          <p className="text-xs text-ink-soft mb-2">Seu personagem não possui espaços de magia configurados.</p>
          <button
            type="button"
            onClick={openSlotsModal}
            className="text-xs font-bold text-rose underline"
          >
            Configurar Slots
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeSlots.map((slot) => (
            <div key={slot.slot_level} className="flex items-center justify-between bg-elevated p-2 rounded-xl border border-rule">
              <span className="text-[11px] font-bold text-ink-soft w-20 text-center bg-card rounded-lg py-1 border border-rule shrink-0">
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
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all flex items-center justify-center tap-control ${
                        isUsed
                          ? 'bg-card border-rule-strong text-transparent opacity-45'
                          : 'bg-rose border-rose text-white shadow-sm'
                      }`}
                    >
                      {!isUsed && <div className="w-2.5 h-2.5 rounded-full bg-white/40" />}
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
        icon={<Sparkles className="w-4 h-4 text-rose" />}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-xs text-ink-soft text-center mb-4">
            Ajuste a quantidade máxima de slots que seu personagem possui para cada círculo de magia (conforme a tabela da sua classe).
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
            {editingSlots.map((slot) => (
              <div key={slot.slot_level} className="bg-elevated border border-rule rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{slot.slot_level}º Círculo</span>
                <div className="flex items-center gap-1.5 bg-card rounded-lg p-0.5 border border-rule">
                  <button
                    type="button"
                    onClick={() => updateEditingSlotMax(slot.slot_level, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-elevated hover:bg-rule text-ink font-bold tap-control"
                  >-</button>
                  <span className="text-xs font-bold text-ink w-4 text-center tabular-nums">{slot.max_slots || 0}</span>
                  <button
                    type="button"
                    onClick={() => updateEditingSlotMax(slot.slot_level, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-elevated hover:bg-rule text-ink font-bold tap-control"
                  >+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowSlotsModal(false)}
              className="w-1/2 py-3 bg-elevated hover:bg-rule text-ink-soft font-bold text-xs rounded-xl transition-colors border border-rule tap-control"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-rose text-white font-bold text-xs rounded-xl shadow-sm tap-control flex justify-center items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Salvar Slots
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
