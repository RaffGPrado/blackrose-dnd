import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import App from './App';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

const idbStorage = {
  getItem: async (key: string) => {
    const value = await get(key);
    return value === undefined ? null : value;
  },
  setItem: async (key: string, value: string) => {
    await set(key, value);
  },
  removeItem: async (key: string) => {
    await del(key);
  },
};

const persister = createAsyncStoragePersister({
  storage: idbStorage,
});

import { requestSafe } from './services/api';

queryClient.setMutationDefaults(['updateCharacter'], {
  mutationFn: async ({ characterId, updates }: { characterId: number; updates: Record<string, unknown> }) => {
    return requestSafe(`/characters/${characterId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }).match(d => d, e => { throw e; });
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
      onSuccess={() => {
        queryClient.resumePausedMutations().then(() => {
          console.log('Resumed paused mutations!');
        });
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
