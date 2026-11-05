import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBackToClose } from '../../hooks/useBackToClose';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className,
}) => {
  useBackToClose(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-200 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-lg bg-card border-t sm:border border-rule rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 pb-safe',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sm:hidden w-12 h-1.5 bg-rule-strong rounded-full mx-auto mb-3 cursor-pointer"
          onClick={onClose}
        />

        {(title || icon) && (
          <div className="flex items-center justify-between pb-3 border-b border-rule mb-3">
            <div className="flex items-center gap-2 text-ink font-serif font-bold text-base sm:text-lg">
              {icon}
              <span className="truncate">{title}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar janela"
              className="p-2 text-ink-soft hover:text-ink rounded-xl bg-elevated hover:bg-rule transition-colors min-h-11 min-w-11 flex items-center justify-center tap-control"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-0.5 space-y-4">{children}</div>
      </div>
    </div>
  );
};
