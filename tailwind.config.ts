import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Roboto Mono', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'industrial-grid': 'linear-gradient(rgba(51, 65, 85, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 65, 85, 0.3) 1px, transparent 1px)',
        'carbon-texture': 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Eagle Industrial Dark Theme
        eagle: {
          yellow: '#FACC15',
          'yellow-bright': '#FDE047',
          'yellow-dim': '#CA8A04',
          gold: '#EAB308',
        },
        carbon: {
          DEFAULT: '#0f172a',
          deep: '#020617',
          light: '#1e293b',
          surface: '#334155',
        },
        industrial: {
          green: '#22c55e',
          'green-glow': '#4ade80',
          red: '#ef4444',
          'red-glow': '#f87171',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)',
            borderColor: 'rgba(239, 68, 68, 0.8)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.5)',
            borderColor: 'rgba(239, 68, 68, 1)',
          },
        },
        'pulse-yellow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(250, 204, 21, 0.5), 0 0 20px rgba(250, 204, 21, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.5)',
          },
        },
        'flow-pulse': {
          '0%': { opacity: '0.3', transform: 'translateX(-100%)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.3', transform: 'translateX(100%)' },
        },
        'blink-alert': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'glow-green': {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.9)',
            backgroundColor: 'rgba(34, 197, 94, 0.4)',
          },
        },
        'scanner': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-yellow': 'pulse-yellow 2s ease-in-out infinite',
        'flow-pulse': 'flow-pulse 1.5s ease-in-out infinite',
        'blink-alert': 'blink-alert 0.8s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'scanner': 'scanner 2s ease-in-out infinite',
      },
      boxShadow: {
        'industrial': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-yellow': '0 0 20px rgba(250, 204, 21, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'inset-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
