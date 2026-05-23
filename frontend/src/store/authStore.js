import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession({ user }) {
    set({ user, isAuthenticated: Boolean(user) });
  },

  clearSession() {
    set({ user: null, isAuthenticated: false });
  },

  setInitialized(isInitializing) {
    set({ isInitializing });
  },
}));
