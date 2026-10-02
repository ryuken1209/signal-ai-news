/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080B10",
        surface: {
          DEFAULT: "#10151E",
          subtle: "#131924",
          hover: "#17202E",
          elevated: "#151C28",
        },
        line: {
          DEFAULT: "#1E2634",
          subtle: "#161D28",
          bright: "#2A3547",
        },
        text: {
          primary: "#E6EDF3",
          muted: "#8B95A1",
          faint: "#5B6472",
        },
        signal: {
          DEFAULT: "#5FC9F8",
          muted: "rgba(95, 201, 248, 0.15)",
          glow: "rgba(95, 201, 248, 0.35)",
        },
        amber: {
          DEFAULT: "#FFB454",
          muted: "rgba(255, 180, 84, 0.15)",
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-snappy": "cubic-bezier(0.2, 0.9, 0.3, 1.1)",
      },
      keyframes: {
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-subtle": {
          "0%": { transform: "scale(0.97)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.95)" },
        },
        "gradient-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-slide-up": "fade-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-subtle": "scale-subtle 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2.2s infinite linear",
        "pulse-subtle": "pulse-subtle 2.5s ease-in-out infinite",
        "gradient-flow": "gradient-flow 3s ease infinite",
      },
      fontFamily: {
        display: ["Spectral", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
}

