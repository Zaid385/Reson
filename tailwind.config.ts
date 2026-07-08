import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-surface-raised': 'var(--bg-surface-raised)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-disabled': 'var(--text-disabled)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-cyan-hover': 'var(--accent-cyan-hover)',
        'accent-lime': 'var(--accent-lime)',
        'accent-pink': 'var(--accent-pink)',
        'accent-amber': 'var(--accent-amber)',
        'accent-danger': 'var(--accent-danger)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        'pad-gap': '8px',
        'panel-padding': '20px',
        'grid-margin': '32px',
      },
      borderRadius: {
        'xl': '24px',
      },
    },
  },
  plugins: [],
} satisfies Config
