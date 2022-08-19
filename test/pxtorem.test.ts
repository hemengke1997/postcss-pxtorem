import postcss from 'postcss'
import { describe, expect, test } from 'vitest'
import type { Input } from 'postcss'
import pxtorem from '../src'
import { filterPropList } from '../src/filter-prop-list'

const basicCSS = '.rule { font-size: 15px }'

describe('pxtorem', () => {
  test('should work on the readme example', () => {
    const input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }'
    const output = 'h1 { margin: 0 0 20px; font-size: 2rem; line-height: 1.2; letter-spacing: 0.0625rem; }'
    const processed = postcss(pxtorem()).process(input).css
    expect(processed).toBe(output)
  })

  test('should replace the px unit with rem', () => {
    const processed = postcss(pxtorem()).process(basicCSS).css
    const expected = '.rule { font-size: 0.9375rem }'

    expect(processed).toBe(expected)
  })

  test('should ignore non px properties', () => {
    const expected = '.rule { font-size: 2em }'
    const processed = postcss(pxtorem()).process(expected).css

    expect(processed).toBe(expected)
  })

  test('should handle < 1 values and values without a leading 0', () => {
    const rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }'
    const expected = '.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }'
    const options = {
      propList: ['margin'],
    }
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  test('should ignore px in custom property names', () => {
    const rules = ':root { --rem-14px: 14px; } .rule { font-size: var(--rem-14px); }'
    const expected = ':root { --rem-14px: 0.875rem; } .rule { font-size: var(--rem-14px); }'
    const options = {
      propList: ['--*', 'font-size'],
    }
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  test('should handle < 1 values and values without a leading 0', () => {
    const rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }'
    const expected = '.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }'
    const options = {
      propList: ['margin'],
    }
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  test('should not add properties that already exist', () => {
    const expected = '.rule { font-size: 16px; font-size: 1rem; }'
    const processed = postcss(pxtorem()).process(expected).css

    expect(processed).toBe(expected)
  })

  test('should remain unitless if 0', () => {
    const expected = '.rule { font-size: 0px; font-size: 0; }'
    const processed = postcss(pxtorem()).process(expected).css

    expect(processed).toBe(expected)
  })
})
describe('value parsing', () => {
  test('should not replace values in double quotes or single quotes', () => {
    const options = {
      propList: ['*'],
    }
    const rules = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }'
    const expected = '.rule { content: \'16px\'; font-family: "16px"; font-size: 1rem; }'
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  test('should not replace values in `url()`', () => {
    const options = {
      propList: ['*'],
    }
    const rules = '.rule { background: url(16px.jpg); font-size: 16px; }'
    const expected = '.rule { background: url(16px.jpg); font-size: 1rem; }'
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })

  test('should not replace values with an uppercase P or X', () => {
    const options = {
      propList: ['*'],
    }
    const rules =
      '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }'
    const expected =
      '.rule { margin: 0.75rem calc(100% - 14PX); height: calc(100% - 1.25rem); font-size: 12Px; line-height: 1rem; }'
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})
describe('rootValue', () => {
  test('should replace using a root value of 10', () => {
    const expected = '.rule { font-size: 1.5rem }'
    const options = {
      rootValue: 10,
    }
    const processed = postcss(pxtorem(options)).process(basicCSS).css

    expect(processed).toBe(expected)
  })

  test('should replace using different root values with different files', () => {
    const css2 = '.rule { font-size: 20px }'
    const expected = '.rule { font-size: 1rem }'
    const options = {
      rootValue(input: Input): number {
        if (input.from.includes('basic.css')) {
          return 15
        }
        return 20
      },
    }
    const processed1 = postcss(pxtorem(options)).process(basicCSS, {
      from: '/tmp/basic.css',
    }).css
    const processed2 = postcss(pxtorem(options)).process(css2, {
      from: '/tmp/whatever.css',
    }).css

    expect(processed1).toBe(expected)
    expect(processed2).toBe(expected)
  })
})

describe('unitPrecision', () => {
  test('should replace using a decimal of 2 places', () => {
    const expected = '.rule { font-size: 0.94rem }'
    const options = {
      unitPrecision: 2,
    }
    const processed = postcss(pxtorem(options)).process(basicCSS).css

    expect(processed).toBe(expected)
  })
})

describe('replace', () => {
  test('should leave fallback pixel unit with root em value', () => {
    const options = {
      replace: false,
    }
    const processed = postcss(pxtorem(options)).process(basicCSS).css
    const expected = '.rule { font-size: 15px; font-size: 0.9375rem }'

    expect(processed).toBe(expected)
  })
})

describe('mediaQuery', () => {
  test('should replace px in media queries', () => {
    const options = {
      mediaQuery: true,
    }
    const processed = postcss(pxtorem(options)).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css
    const expected = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }'

    expect(processed).toBe(expected)
  })
})

describe('minPixelValue', () => {
  test('should not replace values below minPixelValue', () => {
    const options = {
      propList: ['*'],
      minPixelValue: 2,
    }
    const rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }'
    const expected = '.rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }'
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('filter-prop-list', () => {
  test('should find "exact" matches from propList', () => {
    const propList = ['font-size', 'margin', '!padding', '*border*', '*', '*y', '!*font*']
    const expected = 'font-size,margin'
    expect(filterPropList.exact(propList).join()).toBe(expected)
  })

  test('should find "contain" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', '*border*', '*', '*y', '!*font*']
    const expected = 'margin,border'
    expect(filterPropList.contain(propList).join()).toBe(expected)
  })

  test('should find "start" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*']
    const expected = 'border'
    expect(filterPropList.startWith(propList).join()).toBe(expected)
  })

  test('should find "end" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*']
    const expected = 'y'
    expect(filterPropList.endWith(propList).join()).toBe(expected)
  })

  test('should find "not" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*']
    const expected = 'padding'
    expect(filterPropList.notExact(propList).join()).toBe(expected)
  })

  test('should find "not contain" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*']
    const expected = 'font'
    expect(filterPropList.notContain(propList).join()).toBe(expected)
  })

  test('should find "not start" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*']
    const expected = 'border'
    expect(filterPropList.notStartWith(propList).join()).toBe(expected)
  })

  test('should find "not end" matches from propList and reduce to string', () => {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '!*y', '!*font*']
    const expected = 'y'
    expect(filterPropList.notEndWith(propList).join()).toBe(expected)
  })
})

describe('exclude', () => {
  test('should ignore file path with exclude RegEx', () => {
    const options = {
      exclude: /exclude/i,
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'exclude/path',
    }).css
    expect(processed).toBe(basicCSS)
  })

  test('should not ignore file path with exclude String', () => {
    const options = {
      exclude: 'exclude',
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'exclude/path',
    }).css
    expect(processed).toBe(basicCSS)
  })

  test('should not ignore file path with exclude function', () => {
    const options = {
      exclude(file) {
        return file.includes('exclude')
      },
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'exclude/path',
    }).css
    expect(processed).toBe(basicCSS)
  })
})

describe('top comment', () => {
  test('disable', () => {
    const css = '/* pxtorem?disable=true */\n.rule { font-size: 15px }'

    const expected = '.rule { font-size: 15px }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('rootValue', () => {
    const css = '/* pxtorem?rootValue=32 */\n.rule { font-size: 30px }'

    const expected = '.rule { font-size: 0.9375rem }'
    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('propList - string', () => {
    const css = '/* pxtorem?propList[]=font-size */\n.rule { font-size: 15px; margin-right: 15px }'

    const expected = '.rule { font-size: 0.9375rem; margin-right: 15px }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('propList - !', () => {
    const css = '/* pxtorem?propList[]=!font-size */\n.rule { font-size: 15px; margin-right: 15px }'

    const expected = '.rule { font-size: 15px; margin-right: 15px }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('propList - ! & *', () => {
    const css = '/* pxtorem?propList[]=!margin*|font* */\n.rule { font-size: 15px; margin-right: 15px }'

    const expected = '.rule { font-size: 0.9375rem; margin-right: 15px }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('unitPrecision', () => {
    const css = '/* pxtorem?unitPrecision=3 */\n.rule { font-size: 15px; }'

    const expected = '.rule { font-size: 0.938rem; }'
    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('selectorBlackList - string', () => {
    const css = '/* pxtorem?selectorBlackList[]=rule */\n.rule { font-size: 15px; }'

    const expected = '.rule { font-size: 15px; }'

    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('selectorBlackList - RegExp', () => {
    const css = '/* pxtorem?selectorBlackList[]=/rule/ */\n.rule { font-size: 15px; }'
    const expected = '.rule { font-size: 15px; }'

    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('selectorBlackList', () => {
    const css = '/* pxtorem?selectorBlackList[]=/rule/|other */\n.rule { font-size: 15px; } .other { font-size: 15px; }'

    const expected = '.rule { font-size: 15px; } .other { font-size: 15px; }'

    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('replace', () => {
    const css = '/* pxtorem?replace=false */\n.rule { font-size: 15px; }'
    const expected = '.rule { font-size: 15px; font-size: 0.9375rem; }'
    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('mediaQuery', () => {
    const css = '/* pxtorem?mediaQuery=true */\n@media (min-width: 500px) { .rule { font-size: 16px } }'
    const processed = postcss(pxtorem()).process(css).css
    const expected = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }'

    expect(processed).toBe(expected)
  })

  test('minPixelValue', () => {
    const css = '/* pxtorem?minPixelValue=2 */\n.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    const expected = '.rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }'
    expect(processed).toBe(expected)
  })
})

describe('inline comment', () => {
  test('should disable next line', () => {
    const css =
      '.rule { font-size: 15px; /* simple comment */ width: 15px; /* pxtorem-disable-next-line */ height: 15px; }'
    const expected = '.rule { font-size: 0.9375rem; /* simple comment */ width: 0.9375rem; height: 15px; }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('should disable next line in mutiline css', () => {
    const css =
      '.rule {\nfont-size: 15px;\n/* pxtorem-disable-next-line */\nwidth: 100px;\n/* pxtorem-disable-next-line */\nheight: 50px;\n}'

    const expected = '.rule {\nfont-size: 0.9375rem;\nwidth: 100px;\nheight: 50px;\n}'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })
})
