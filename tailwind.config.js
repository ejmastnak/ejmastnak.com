/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./content/**/*.md",  // for example
    "./layouts/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: {
              fontSize: '2.25rem',
              lineHeight: '2.5rem',
              marginBottom: '2rem',
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
            img: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            '--tw-prose-bullets': theme('colors.gray.400'),
            'code::before': {
              content: '',
            },
            'code::after': {
              content: '',
            },
            code: {
              backgroundColor: theme('colors.gray.200'),
              borderRadius: '4px',
              padding: '.2rem .4rem',
              fontWeight: 'normal',
              fontSize: '85%',
            },
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
