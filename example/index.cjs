const fs = require('node:fs')
const postcss = require('postcss')
const pxtorem = require('../dist/index.cjs')
const css = fs.readFileSync('main.css', 'utf8')
const options = {
  replace: true,
}
const processedCss = postcss(pxtorem(options)).process(css).css

fs.writeFile('main-rem.css', processedCss, (err) => {
  if (err) {
    throw err
  }
  console.log('Rem file written.')
})
