module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    'tailwindcss': {
      config: `${__dirname}/tailwind.config.cjs`,
    },
    '@minko-fe/postcss-pxtorem': {
      convertUnitOnEnd: {
        sourceUnit: /[Pp][Xx]$/,
        targetUnit: 'px',
      },
    },
  },
}
