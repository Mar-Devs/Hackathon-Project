/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1B2A',
        'ink-soft': '#16293D',
        paper: '#F5F7F9',
        slate: { ink: '#23323F', muted: '#647585', faint: '#9AA8B4' },
        hair: '#DCE3E9',
        signal: { DEFAULT: '#0EA5A4', deep: '#0B7E7D', glow: '#3FD3CE' },
        tier: {
          emerging: '#E07A45',
          developing: '#E0B341',
          advanced: '#3FA66B',
          leading: '#1F8A70',
        },
        alert: '#D9534F',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,27,42,.04), 0 8px 24px -12px rgba(14,27,42,.18)',
        lift: '0 10px 40px -16px rgba(14,27,42,.35)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'draw': { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.2,.7,.2,1) both',
        'spin-slow': 'spin-slow 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
