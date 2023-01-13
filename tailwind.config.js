/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./content/**/*.md",  // for example
    "./layouts/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        nord_gray_1: '#2e3440',
        nord_gray_2: '#3b4252',
        nord_gray_3: '#434c5e',
        nord_gray_4: '#4c566a',
        nord_gray_5: '#616E88',

        nord_white_1: '#d8dee9',
        nord_white_2: '#e5e9f0',
        nord_white_3: '#eceff4',

        nord_teal: '#8fbcbb',
        nord_cyan: '#88c0d0',
        nord_blue_gray: '#81a1c1',
        nord_blue: '#5e81ac',

        nord_red: '#bf616a',
        nord_orange: '#d08770',
        nord_yellow: '#ebcb8b',
        nord_green: '#a3be8c',
        nord_indigo: '#b48ead',

        light0: '#fbfbfc',
        light1: '#f8f9fb',
        light2: '#f3f4f6',
        link_blue: '#0079c0'
      }
    },
  },
  plugins: [  // if installed
    require('@tailwindcss/typography'),
  ]
}

