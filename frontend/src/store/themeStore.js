import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const THEME_OPTIONS = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

const isBrowser = typeof window !== 'undefined';

export const useThemeStore = create()(
  persist(
    (set) => ({
      mode: THEME_OPTIONS.SYSTEM,
      setMode: (mode) => set({ mode }),
      toggle: () =>
        set((state) => {
          if (!isBrowser) return state;
          const resolved =
            state.mode === THEME_OPTIONS.SYSTEM
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? THEME_OPTIONS.DARK
                : THEME_OPTIONS.LIGHT
              : state.mode;
          return { mode: resolved === THEME_OPTIONS.DARK ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK };
        }),
    }),
    {
      name: 'cnp:theme',
      storage: createJSONStorage(() => (isBrowser ? window.localStorage : undefined)),
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
