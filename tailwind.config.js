/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./content/**/*.md",  // for example
    "./layouts/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [  // if installed
    require('@tailwindcss/typography'),
  ]
}
