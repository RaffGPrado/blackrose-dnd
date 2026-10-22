import { useState, useEffect } from 'react';
import { syncManager } from '../offline/syncManager';

export interface UseSyncStatusReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [status, setStatus] = useState(syncManager.getStatus());

  useEffect(() => {
    return syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const syncNow = async () => {
    await syncManager.syncPending();
  };

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    syncNow,
  };
}
