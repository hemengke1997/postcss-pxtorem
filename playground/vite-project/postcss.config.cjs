module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    'tailwindcss': {},
    '@minko-fe/postcss-pxtorem': {
      replace: true,
      minPixelValue: 1,
      atRules: false,
      propList: ['*'],
    },
  },
}
