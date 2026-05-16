import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setSession({ user, accessToken }) {
        set({
          user,
          accessToken,
          isAuthenticated: Boolean(accessToken),
        });
      },

      clearSession() {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'clinical-narrative-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
