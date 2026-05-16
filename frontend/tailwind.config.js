/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-top": "#1a1a3e",
        "bg-mid": "#3d2b5e",
        "bg-bottom": "#f2c4ce",
        "accent-primary": "#e8547a",
        "accent-gold": "#f5c842",
        "accent-lavender": "#9b7fc7",
        "deep-navy": "#0f0f2e",
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      backgroundImage: {
        "twilight":
          "linear-gradient(180deg, #1a1a3e 0%, #3d2b5e 40%, #b48ca8 70%, #f2c4ce 100%)",
      },
      animation: {
        "wing-flap-up": "wingFlapUp 0.18s ease-in-out infinite",
        "wing-flap-down": "wingFlapDown 0.18s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
      },
      keyframes: {
        wingFlapUp: {
          "0%,100%": { transform: "scaleY(1) scaleX(1)" },
          "50%": { transform: "scaleY(0.3) scaleX(0.85)" },
        },
        wingFlapDown: {
          "0%,100%": { transform: "scaleY(1) scaleX(1)" },
          "50%": { transform: "scaleY(0.4) scaleX(0.9)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(232,84,122,0.5)" },
          "50%": { boxShadow: "0 0 30px 10px rgba(232,84,122,0.25)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
