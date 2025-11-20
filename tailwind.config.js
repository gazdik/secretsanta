/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        'cherry-swash': ['Arial', 'Helvetica', 'sans-serif'],
        'dancing-script': ['"Comic Sans MS"', '"Comic Sans"', 'cursive'],
      },
    },
  },
}
