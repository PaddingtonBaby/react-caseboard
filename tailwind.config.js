/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'board-dark': '#1a1a2e',
        'board-darker': '#0f0f1a',
        'accent-primary': '#cbd5e1',
        'accent-primary-dim': '#64748b',
        'pin-primary': '#475569',
        'pin-dark': '#1e293b',
        'card-bg': '#f5f5f0',
        'card-border': '#e8e8e0',
        'neon-cyan': '#00f5ff',
        'neon-purple': '#bf00ff',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'marker': ['"Permanent Marker"', 'cursive'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'pin': '0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(71, 85, 105, 0.3)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(203, 213, 225, 0.3)',
        'glow-primary': '0 0 15px rgba(203, 213, 225, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'string-vibrate': 'vibrate 0.1s ease-in-out infinite',
      },
      keyframes: {
        vibrate: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(1px)' },
        }
      }
    },
  },
  plugins: [],
}
