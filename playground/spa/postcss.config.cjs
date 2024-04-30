const path = require('node:path')

module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    'tailwindcss': {
      config: path.join(__dirname, 'tailwind.config.cjs'),
    },
    '@minko-fe/postcss-pxtorem': {
      rootValue: ({ file }) => {
        if (file.includes('node_modules/react-vant')) {
          return 4
        }
        return 16
      },
      convertUnit: {
        source: /px$/i,
        target: 'px',
      },
    },
  },
}
