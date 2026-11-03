/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F7F7F4",
          surface: "#FFFFFF",
          secondary: "#F0F1EC",
          border: "#E8EAE5",
        },
        content: {
          primary: "#242A27",
          secondary: "#777F79",
          muted: "#A0A69F",
        },
        brand: {
          DEFAULT: "#315C4C",      // Deep forest green
          dark: "#26483B",
          light: "#3E7460",
          sage: "#8FA995",
          soft: "#EAF1EB",
        },
        warm: {
          DEFAULT: "#B68B5C",      // Warm accent
          dark: "#9E7448",
          light: "#C9A174",
          soft: "#F6F0E7",
        },
        status: {
          danger: "#BD6560",
          dangerSoft: "#F9ECEA",
          warning: "#C7954B",
          warningSoft: "#F8F1E6",
          success: "#648B70",
          successSoft: "#EAF1EB",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(36, 42, 39, 0.05)",
        card: "0 2px 8px -2px rgba(36, 42, 39, 0.06), 0 1px 4px -1px rgba(36, 42, 39, 0.04)",
        elevated: "0 10px 25px -5px rgba(36, 42, 39, 0.08), 0 8px 10px -6px rgba(36, 42, 39, 0.04)",
      },
    },
  },
  plugins: [],
};

