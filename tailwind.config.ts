import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        panel: '#0a0a0a',
        panelHover: '#121212',
        inputBg: '#050505',
        borderSubtle: '#1f1f1f',
        borderMuted: '#2e2e2e',
        borderFocus: '#ffffff',
        primary: '#ffffff',
        secondary: '#888888',
        silver: '#a1a1aa',
        gammaPos: '#10b981',
        gammaNeg: '#f43f5e',
        warning: '#f59e0b',
        textPrimary: '#ffffff',
        textSecondary: '#888888',
        textMuted: '#444444',
      },
      fontSize: {
        'xxs': '0.7rem',
        'xxxs': '0.6rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;
