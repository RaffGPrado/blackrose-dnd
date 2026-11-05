import React from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Sparkles, X } from 'lucide-react';
import type { ExplainEntry } from '../../hooks/useHoldToExplain';
import { useBackToClose } from '../../hooks/useBackToClose';

interface InfoDrawerProps {
  entry: ExplainEntry | null;
  onClose: () => void;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({ entry, onClose }) => {
  const isOpen = entry !== null;
  useBackToClose(isOpen, onClose);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby="codex-drawer-description"
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-card border-t border-rule px-5 pt-3 pb-safe focus:outline-none shadow-2xl"
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rule-strong" />

          {entry && (
            <div className="space-y-4 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                      {entry.subtitle || 'Consulta de Regra (D&D 5e)'}
                    </span>
                  </div>
                  <Drawer.Title className="font-serif text-2xl font-bold text-ink mt-0.5">
                    {entry.title}
                  </Drawer.Title>
                </div>

                <div className="flex items-center gap-2">
                  {entry.badge && (
                    <span className="font-serif text-xl font-bold tabular-nums px-3 py-1 rounded-xl bg-rose-soft text-rose border border-rose/30">
                      {entry.badge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar explicação"
                    className="w-11 h-11 rounded-xl bg-elevated text-ink-soft flex items-center justify-center tap-control"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {entry.formula && (
                <div className="rounded-xl bg-elevated border border-rule px-3.5 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Cálculo na Ficha (Some ao seu d20 físico)
                  </span>
                  <p className="text-sm font-semibold text-ink tabular-nums mt-0.5">
                    {entry.formula}
                  </p>
                </div>
              )}

              <p
                id="codex-drawer-description"
                className="text-sm leading-relaxed text-ink"
              >
                {entry.description}
              </p>

              {entry.tip && (
                <div className="flex items-start gap-2.5 rounded-xl bg-gold-soft/70 border border-gold/30 p-3 text-xs text-ink">
                  <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>{entry.tip}</span>
                </div>
              )}

              {entry.actionLabel && entry.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    entry.onAction?.();
                    onClose();
                  }}
                  className="w-full min-h-tap rounded-xl bg-rose text-white font-semibold text-sm py-3 tap-control shadow-sm"
                >
                  {entry.actionLabel}
                </button>
              )}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
