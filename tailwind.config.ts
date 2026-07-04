import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: '#050505',
        panel: '#0a0a0a',
        panelHover: '#101010',
        inset: '#070707',
        inputBg: '#050505',

        // Borders
        borderSubtle: '#1c1c1c',
        borderMuted: '#2a2a2a',
        borderFocus: '#ededed',

        // Text
        textPrimary: '#ededed',
        textSecondary: '#8f8f8f',
        textMuted: '#4d4d4d',

        // Directional / status accents (always paired with a label or icon)
        bull: '#10b981',
        bear: '#f43f5e',
        warn: '#f59e0b',
        select: '#38bdf8',

        // Legacy aliases (pre-redesign pages)
        primary: '#ededed',
        secondary: '#8f8f8f',
        silver: '#a1a1aa',
        gammaPos: '#10b981',
        gammaNeg: '#f43f5e',
        warning: '#f59e0b',
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
