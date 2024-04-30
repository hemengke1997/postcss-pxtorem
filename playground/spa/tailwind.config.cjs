const path = require('node:path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}')],
  corePlugins: {
    preflight: true,
  },
  plugins: [],
}
