import { useCallback, useEffect, useMemo } from 'react';

import { THEME_OPTIONS, useThemeStore } from '../store/themeStore.js';

const isBrowser = typeof window !== 'undefined';

const resolveMode = (mode) => {
  if (!isBrowser) return THEME_OPTIONS.LIGHT;
  if (mode !== THEME_OPTIONS.SYSTEM) return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_OPTIONS.DARK
    : THEME_OPTIONS.LIGHT;
};

const setHtmlClass = (resolvedMode, { animated = false } = {}) => {
  if (!isBrowser) return;
  const html = document.documentElement;

  if (animated) {
    html.classList.add('theme-transition');
    window.setTimeout(() => html.classList.remove('theme-transition'), 280);
  }

  html.classList.toggle('dark', resolvedMode === THEME_OPTIONS.DARK);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', resolvedMode === THEME_OPTIONS.DARK ? '#0b1220' : '#0ea5e9');
  }
};

export const useTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggle = useThemeStore((state) => state.toggle);

  const resolved = useMemo(() => resolveMode(mode), [mode]);

  useEffect(() => {
    setHtmlClass(resolved);
  }, [resolved]);

  useEffect(() => {
    if (!isBrowser || mode !== THEME_OPTIONS.SYSTEM) return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () =>
      setHtmlClass(
        media.matches ? THEME_OPTIONS.DARK : THEME_OPTIONS.LIGHT,
        { animated: true },
      );
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  const setModeAnimated = useCallback(
    (nextMode) => {
      setMode(nextMode);
      setHtmlClass(resolveMode(nextMode), { animated: true });
    },
    [setMode],
  );

  const toggleAnimated = useCallback(() => {
    toggle();
    setHtmlClass(
      resolved === THEME_OPTIONS.DARK ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK,
      { animated: true },
    );
  }, [resolved, toggle]);

  return {
    mode,
    resolved,
    isDark: resolved === THEME_OPTIONS.DARK,
    setMode: setModeAnimated,
    toggle: toggleAnimated,
  };
};
