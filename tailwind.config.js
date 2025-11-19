/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        'cherry-swash': ['Cherry Swash', 'serif'],
        'dancing-script': ['Dancing Script', 'cursive'],
      },
    },
  },
}

