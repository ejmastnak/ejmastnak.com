/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./content/**/*.md",  // for example
    "./layouts/**/*.html",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              textDecoration: 'none',
              color: theme('colors.sky.600'),
              '&:hover': {
                textDecoration: 'underline',
                color: theme('colors.sky.800'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}

