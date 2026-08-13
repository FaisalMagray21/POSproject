/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F231C",
          50: "#F2F6F4",
          100: "#DDE7E2",
          200: "#B8CBC1",
          400: "#5C7A6C",
          600: "#2C4438",
          700: "#1B332A",
          800: "#152920",
          900: "#0F231C",
          950: "#0A1712",
        },
        brand: {
          DEFAULT: "#0B6E4F",
          50: "#EAF7F1",
          100: "#CFEEDF",
          200: "#9DDCC0",
          300: "#5FC298",
          400: "#2FA87C",
          500: "#0B6E4F",
          600: "#095C42",
          700: "#084B36",
          800: "#073A2A",
        },
        gold: {
          DEFAULT: "#C08A2E",
          50: "#FBF3E3",
          100: "#F3E0B6",
          300: "#DBAE5C",
          500: "#C08A2E",
          700: "#8F6620",
        },
        brick: {
          DEFAULT: "#B3432B",
          50: "#FBEBE7",
          100: "#F3CCC2",
          500: "#B3432B",
          700: "#8A331F",
        },
        paper: "#F6F8F6",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(15, 35, 28, 0.06), 0 1px 3px 0 rgba(15, 35, 28, 0.06)",
        card: "0 2px 8px -2px rgba(15, 35, 28, 0.08), 0 1px 2px -1px rgba(15, 35, 28, 0.06)",
        lift: "0 8px 24px -6px rgba(15, 35, 28, 0.16)",
      },
    },
  },
  plugins: [],
};
