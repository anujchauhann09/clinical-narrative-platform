/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--cnp-bg)',
        surface: 'var(--cnp-surface)',
        'surface-2': 'var(--cnp-surface-2)',
        border: 'var(--cnp-border)',
        text: 'var(--cnp-text)',
        muted: 'var(--cnp-text-muted)',
        primary: {
          DEFAULT: 'var(--cnp-primary)',
          strong: 'var(--cnp-primary-strong)',
          soft: 'var(--cnp-primary-soft)',
          contrast: 'var(--cnp-primary-contrast)',
        },
        accent: 'var(--cnp-accent)',
        success: 'var(--cnp-success)',
        warning: 'var(--cnp-warning)',
        danger: 'var(--cnp-danger)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        elevated: '0 8px 24px -8px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.06)',
        glow: '0 0 0 1px var(--cnp-primary-soft), 0 8px 28px -10px rgba(14, 165, 233, 0.35)',
      },
      backgroundImage: {
        'ai-grad': 'linear-gradient(135deg, var(--cnp-grad-from), var(--cnp-grad-to))',
        'surface-grad':
          'radial-gradient(1200px circle at 0% 0%, var(--cnp-primary-soft), transparent 40%)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
        'rise-in': 'rise-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
