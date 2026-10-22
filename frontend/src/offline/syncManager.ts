import { requestSafe } from '../services/api';
import { getPendingMutations, removeMutation } from './offlineStorage';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

type SyncStatusListener = (status: SyncStatus) => void;

class SyncManager {
  private status: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
  };

  private readonly listeners = new Set<SyncStatusListener>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateStatus({ isOnline: true });
        void this.syncPending();
      });
      window.addEventListener('offline', () => {
        this.updateStatus({ isOnline: false });
      });
    }
    void this.updatePendingCount();
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateStatus(partial: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...partial };
    const snapshot = this.getStatus();
    for (const listener of Array.from(this.listeners)) {
      listener(snapshot);
    }
  }

  public async updatePendingCount(): Promise<void> {
    const pending = await getPendingMutations();
    this.updateStatus({ pendingCount: pending.length });
  }

  public triggerSync(): void {
    if (this.status.isOnline && !this.status.isSyncing) {
      void this.syncPending();
    }
  }

  public async syncPending(): Promise<void> {
    if (this.status.isSyncing || !this.status.isOnline) return;
    const pending = await getPendingMutations();
    if (pending.length === 0) {
      this.updateStatus({ pendingCount: 0 });
      return;
    }

    this.updateStatus({ isSyncing: true, pendingCount: pending.length });

    for (const item of pending) {
      const ok = await requestSafe(item.endpoint, {
        method: item.method,
        body: item.body !== undefined ? JSON.stringify(item.body) : undefined,
      }).match(
        () => true,
        () => false
      );

      if (ok && item.id !== undefined) {
        await removeMutation(item.id);
      } else if (!ok) {
        break;
      }
    }

    const remaining = await getPendingMutations();
    this.updateStatus({
      isSyncing: false,
      pendingCount: remaining.length,
    });
  }
}

export const syncManager = new SyncManager();
