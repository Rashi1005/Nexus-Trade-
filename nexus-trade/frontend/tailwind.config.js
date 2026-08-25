/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:   '#8B6FFF',
        secondary: '#22D3EE',
        success:   '#34D399',
        danger:    '#FB7185',
        warning:   '#F0B429',
        dark: { 50:'#1a1f35', 100:'#0D1428', 200:'#080D1A', 300:'#050910' }
      },
      fontFamily: {
        orbitron: ['Orbitron','sans-serif'],
        grotesk:  ['Space Grotesk','sans-serif'],
        mono:     ['JetBrains Mono','monospace'],
        sans:     ['Space Grotesk','system-ui','sans-serif'],
      },
      animation: {
        'float':       'float 5s ease-in-out infinite',
        'pulse-glow':  'pulse-warm 2.5s ease-in-out infinite',
        'spin-slow':   'spin-slow 8s linear infinite',
        'ticker':      'ticker 32s linear infinite',
        'fade-in-up':  'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float:       { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-10px)' } },
        'pulse-warm':{ '0%,100%':{ boxShadow:'0 0 16px rgba(139,111,255,0.3)' }, '50%':{ boxShadow:'0 0 32px rgba(139,111,255,0.55)' } },
        'spin-slow': { from:{ transform:'rotate(0deg)' }, to:{ transform:'rotate(360deg)' } },
        ticker:      { from:{ transform:'translateX(0)' }, to:{ transform:'translateX(-50%)' } },
        fadeInUp:    { from:{ opacity:'0', transform:'translateY(28px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
      },
      boxShadow: {
        'card':       '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,111,255,0.2)',
        'neon':       '0 0 20px rgba(139,111,255,0.35)',
        'neon-green': '0 0 20px rgba(52,211,153,0.3)',
        'neon-red':   '0 0 20px rgba(251,113,133,0.3)',
      },
      backdropBlur: { '4xl': '80px' },
    },
  },
  plugins: [],
}