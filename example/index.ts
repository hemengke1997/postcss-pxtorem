import fs from 'node:fs'
import postcss from 'postcss'
import nested from 'postcss-nested'
import pxtorem from '../src'

const css = fs.readFileSync('main.css', 'utf8')
const options = {
  replace: true,
  convertUnitOnEnd: {
    sourceUnit: /[Pp][Xx]$/,
    targetUnit: 'px',
  },
}
const processedCss = postcss(pxtorem(options), nested).process(css).css

fs.writeFile('main-rem.css', processedCss, (err) => {
  if (err) {
    throw err
  }
  console.log('Rem file written.')
})
