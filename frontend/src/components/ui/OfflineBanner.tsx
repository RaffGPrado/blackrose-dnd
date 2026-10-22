import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface OfflineBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  onSync: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isSyncing,
  pendingCount,
  onSync,
}) => {
  // If online and nothing pending, don't show any disruptive banner
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <aside
      aria-label="Status de sincronização offline"
      className={`px-3 py-2 text-xs flex items-center justify-between border-b transition-all ${
        !isOnline
          ? 'bg-amber-950/80 border-amber-800/80 text-amber-200'
          : isSyncing
          ? 'bg-blue-950/80 border-blue-800/80 text-blue-200'
          : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        )}

        <span>
          {!isOnline
            ? pendingCount > 0
              ? `Offline — ${pendingCount} alteraç${pendingCount === 1 ? 'ão salva' : 'ões salvas'} no dispositivo`
              : 'Modo Offline — Ficha funcionando localmente'
            : isSyncing
            ? `Sincronizando ${pendingCount} alteraç${pendingCount === 1 ? 'ão' : 'ões'} com o servidor...`
            : `${pendingCount} pendente(s)`}
        </span>
      </div>

      {isOnline && pendingCount > 0 && !isSyncing && (
        <button
          type="button"
          onClick={onSync}
          className="px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-[11px] font-bold text-white transition-colors"
        >
          Sincronizar
        </button>
      )}
    </aside>
  );
};
