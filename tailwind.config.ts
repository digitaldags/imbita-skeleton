import type { Config } from 'tailwindcss'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const raw = fs.readFileSync(path.join(process.cwd(), 'wedding.config.yaml'), 'utf8')
const weddingConfig = yaml.load(raw) as {
  theme: { primary: string; secondary: string; accent: string }
}

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddd0',
          300: '#d4c4b0',
          400: '#b8a088',
          500: '#9d7f6a',
          600: '#8a6b58',
          700: '#72584a',
          800: '#5f4a3f',
          900: '#4f3f36',
        },
        maroon: {
          50: '#faf5f5',
          100: '#f5e8e8',
          200: '#e8d0d0',
          300: '#d4b0b0',
          400: '#b88888',
          500: '#9d6a6a',
          600: '#8a5858',
          700: '#724a4a',
          800: '#5f3f3f',
          900: '#4f3636',
        },
        wedding: {
          primary: weddingConfig.theme.primary,
          secondary: weddingConfig.theme.secondary,
          accent: weddingConfig.theme.accent,
          beige: '#d4c4b0',
          'beige-dark': '#8a6b58',
          'maroon-light': '#b88888',
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 1.2s ease-out both',
      },
    },
  },
  plugins: [],
}
export default config

