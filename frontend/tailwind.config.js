/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src_vite/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000",
        white: "#fff",
        red: "#ff004d",
        creme: "#f4efd7",
        flourYellow: "#e9e778",
        ivory: {
          25: "#f9f8f6",
          50: "#f2efea",
          100: "#ebe7df",
          200: "#e4ded3",
          300: "#d2cdc4",
          400: "#beb9b0",
        },
        stoneBrown: {
          100: "#e2dede",
          300: "#c3bcbb",
          500: "#988f8b",
          600: "#7a716d",
          700: "#524945",
          800: "#241f21",
        },
        forestGreen: "#042d2b",
        natureKraft: "#c6af88",
        urbanCoral: "#f76c46",
        golfCeladon: "#bacfa3",
        replasticVistaBlue: "#85a1c5",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
        display: ["Outfit", "sans-serif"],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};
