/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f1a",
        card: "#111827",
        accent: "#8b5cf6",
        text: "#e5e7eb",
      },
    },
  },
  plugins: [],
}