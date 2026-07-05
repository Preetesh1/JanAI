import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EC",
        ink: "#181511",
        marigold: "#FFB627",
        indigo: "#1B3A6B",
        peacock: "#0B6E4F",
        clay: "#C1440E",
        slate: {
          bg: "#0E141B",
          panel: "#161E27",
          line: "#26313D",
        },
        roadway: "#E8630A",
        cobalt: "#2F6690",
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        blob: "2rem",
      },
      boxShadow: {
        hard: "6px 6px 0 0 #181511",
        "hard-sm": "4px 4px 0 0 #181511",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        rise: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
