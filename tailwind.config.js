/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // ativar modo escuro via classe 'dark'
  theme: {
    extend: {
      colors: {
        "google-blue": "#1a73e8",
        "google-blue-light": "#4285f4",
        "google-blue-dark": "#174ea6",
        "google-red": "#ea4335",
        "google-yellow": "#fbbc04",
        "google-green": "#34a853",
        "google-gray-light": "#f1f3f4",
        "google-gray-mid": "#5f6368",
        "google-gray-dark": "#202124",
      },
      fontFamily: {
        sans: ["system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}
