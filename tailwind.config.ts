import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: '#1a1a2e',
        slate: '#16213e',
        deep: '#0f3460',
        accent: '#e94560',
        gold: '#f5a623',
        mist: '#a8b2d8',
        surface: '#1e2a4a',
        card: '#243050',
      }
    },
  },
  plugins: [],
}
export default config
