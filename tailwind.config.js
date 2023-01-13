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
            h1: {
              fontSize: '2.25rem',
              lineHeight: '2.5rem',
              marginBottom: '1.5rem',
              color: theme('colors.gray.800'),
              fontWeight: '600',
            },
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

// a code {
//   padding: .2em .4em;
//   margin: 0;
//   font-size: 85%;
//   background-color: $inline-code-background-color;
//   color: $link-color;
//   border-radius: 3px;
// }


// // Element: code, highlight, pre, etc
// // -----------------------------------------------
// code,
// pre {
//   font-family: 'Computer Modern Typewriter',monospace;
// }
//
// pre {
//   margin-top: 0;
//   margin-bottom: 0;
//   word-wrap: normal;
// }
//
// // Note: Text color and background color of inline code
// code {
//   padding: .2em .4em;
//   margin: 0;
//   font-size: 85%;
//   background-color: $inline-code-background-color;
//   color: $inline-code-text-color;
//   border-radius: 3px;
// }
//
// pre>code {
//   padding: 0;
//   margin: 0;
//   font-size: 100%;
//   word-break: normal;
//   white-space: pre;
//   background: transparent;
//   border: 0;
// }
//
// .highlight {
//   margin-bottom: 16px;
// }
//
// .highlight pre {
//   margin-bottom: 0;
//   word-break: normal;
// }
//
// // Note: Background color of code blocks
// .highlight pre,
// pre {
//   padding: 16px;
//   overflow: auto;
//   font-size: 90%;
//   line-height: 1.45;
//   background-color: $block-code-background-color;
//   border-radius: 3px;
// }
//
// // Note: Text color and background color inside code blocks
// pre code {
//   display: inline;
//   max-width: auto;
//   padding: 0;
//   margin: 0;
//   overflow: visible;
//   line-height: inherit;
//   word-wrap: normal;
//   background-color: initial;
//   color: $block-code-text-color;
//   border: 0;
// }
