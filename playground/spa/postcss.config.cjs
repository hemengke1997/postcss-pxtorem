module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    'tailwindcss': {
      config: `${__dirname}/tailwind.config.cjs`,
    },
    '@minko-fe/postcss-pxtorem': {
      convertUnitOnEnd: {
        sourceUnit: /px$/i,
        targetUnit: 'px',
      },
    },
  },
}
