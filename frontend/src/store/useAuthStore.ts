import { create } from 'zustand';
import { Result } from 'neverthrow';
import { api, requestSafe } from '../services/api';
import type { UserProfile, AuthResponse } from '../types/dnd5e';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('black_rose_token'),
  loading: true,

  initAuth: async () => {
    const savedToken = localStorage.getItem('black_rose_token');
    const savedUser = localStorage.getItem('black_rose_user');

    if (savedToken && savedUser) {
      const parseResult = Result.fromThrowable(
        () => JSON.parse(savedUser) as UserProfile,
        (err) => (err instanceof Error ? err : new Error(String(err)))
      )();

      if (parseResult.isOk()) {
        set({ user: parseResult.value });
        const meResult = await requestSafe<{ user: UserProfile }>('/auth/me');
        meResult.match(
          (res) => {
            set({ user: res.user });
            localStorage.setItem('black_rose_user', JSON.stringify(res.user));
          },
          () => {
            get().logout();
          }
        );
      } else {
        get().logout();
      }
    }
    set({ loading: false });
  },

  login: async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('black_rose_token', data.token);
    localStorage.setItem('black_rose_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('black_rose_token', data.token);
    localStorage.setItem('black_rose_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
    return data;
  },

  logout: () => {
    localStorage.removeItem('black_rose_token');
    localStorage.removeItem('black_rose_user');
    set({ token: null, user: null });
  },
}));
