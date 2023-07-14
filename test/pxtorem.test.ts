import postcss from 'postcss'
import { describe, expect, test } from 'vitest'
import type { Input } from 'postcss'
import nested from 'postcss-nested'
import pxtorem from '../src'
import { filterPropList } from '../src/utils/filter-prop-list'

const basicCSS = '.rule { font-size: 15px }'
const basicExpected = '.rule { font-size: 0.9375rem }'

describe('pxtorem', () => {
  test('should work on the readme example', () => {
    const input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }'
    const output = 'h1 { margin: 0 0 1.25rem; font-size: 2rem; line-height: 1.2; letter-spacing: 0.0625rem; }'
    const processed = postcss(pxtorem()).process(input).css
    expect(processed).toBe(output)
  })

  test('should replace the px unit with rem', () => {
    const processed = postcss(pxtorem()).process(basicCSS).css

    expect(processed).toBe(basicExpected)
  })

  test('should ignore non px properties', () => {
    const expected = '.rule { font-size: 2em }'
    const processed = postcss(pxtorem()).process(expected).css

    expect(processed).toBe(expected)
  })

  test('should handle < 1 values and values without a leading 0', () => {
    const css = '.rule { margin: 0.5rem .5px -0.2px -.2em }'
    const expected = '.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }'
    const options = {
      propList: ['margin'],
    }
    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should ignore px in custom property names', () => {
    const css = ':root { --rem-14px: 14px; } .rule { font-size: var(--rem-14px); }'
    const expected = ':root { --rem-14px: 0.875rem; } .rule { font-size: var(--rem-14px); }'
    const options = {
      propList: ['--*', 'font-size'],
    }
    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should handle < 1 values and values without a leading 0', () => {
    const css = '.rule { margin: 0.5rem .5px -0.2px -.2em }'
    const expected = '.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }'
    const options = {
      propList: ['margin'],
    }
    const processed = postcss(pxtorem(options)).process(css).css

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

  test('should support atRules', () => {
    const css =
      '@supports (top: max(500px)) { .btn { bottom: (calc(var(--safe-bottom)), calc(var(--some-var, 10px) - 10px));left: (calc(var(--safe-left)), calc(var(--some-var, 10px) - 10px));}}'

    const expected =
      '@supports (top: max(31.25rem)) { .btn { bottom: (calc(var(--safe-bottom)), calc(var(--some-var, 0.625rem) - 0.625rem));left: (calc(var(--safe-left)), calc(var(--some-var, 0.625rem) - 0.625rem));}}'

    const processed = postcss(pxtorem({ atRules: ['supports'], propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('should include higher priority than exclude', () => {
    const options = {
      exclude: 'node_modules',
      include: 'node_modules',
    }

    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'node_modules/path',
    }).css
    expect(processed).toBe(basicExpected)
  })

  test('should disable all', () => {
    const options = {
      disable: true,
    }

    const expected = basicCSS

    const processd = postcss(pxtorem(options)).process(expected).css

    expect(expected).toBe(processd)
  })
})

describe('value parsing', () => {
  test('should not replace values in double quotes or single quotes', () => {
    const options = {
      propList: ['*'],
    }
    const css = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }'
    const expected = '.rule { content: \'16px\'; font-family: "16px"; font-size: 1rem; }'
    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should not replace values in `url()`', () => {
    const options = {
      propList: ['*'],
    }
    const css = '.rule { background: url(16px.jpg); font-size: 16px; }'
    const expected = '.rule { background: url(16px.jpg); font-size: 1rem; }'
    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should not replace values with an uppercase P or X', () => {
    const options = {
      propList: ['*'],
    }
    const css =
      '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }'
    const expected =
      '.rule { margin: 0.75rem calc(100% - 14PX); height: calc(100% - 1.25rem); font-size: 12Px; line-height: 1rem; }'
    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should number 0 take units', () => {
    const options = {
      propList: ['*'],
    }

    const css = '.rule { font-size: 0px }'
    const expected = '.rule { font-size: 0px }'

    const processed = postcss(pxtorem(options)).process(css).css

    expect(processed).toBe(expected)
  })

  test('should ignore px in custom property, but handle default values', () => {
    const rules = ':root { --rem-14px: 14px; } .rule { font-size: var(--rem-14px, 16px); }'
    const expected = ':root { --rem-14px: 0.875rem; } .rule { font-size: var(--rem-14px, 1rem); }'
    const options = {
      propList: ['--*', 'font-size'],
    }
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
      rootValue(input: Input | undefined): number {
        if (input?.from.includes('basic.css')) {
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

describe('atRules', () => {
  test('should replace px in media queries', () => {
    const options = {
      atRules: true,
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
      exclude(file: string) {
        return file.includes('exclude')
      },
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'exclude/path',
    }).css
    expect(processed).toBe(basicCSS)
  })
})

describe('include', () => {
  test('should convert file path with include RegEx', () => {
    const options = {
      include: /node_modules/i,
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'node_modules/path',
    }).css
    expect(processed).toBe(basicExpected)
  })

  test('should convert file path with include string', () => {
    const options = {
      include: 'node_modules',
    }

    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'node_modules/path',
    }).css
    expect(processed).toBe(basicExpected)
  })

  test('should convert file path with include function', () => {
    const options = {
      include: (file: string) => {
        return file.includes('node_modules')
      },
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'node_modules/path',
    }).css
    expect(processed).toBe(basicExpected)
  })

  test('should convert specified file path', () => {
    const options = {
      include: 'node_modules/pathA',
    }
    const processed = postcss(pxtorem(options)).process(basicCSS, {
      from: 'node_modules/path',
    }).css
    expect(processed).toBe(basicCSS)
  })
})

describe('comment', () => {
  test('regexp', () => {
    const css = '/* pxtorem?disable=false */\n.rule { font-size: 16px }'
    const expected = '.rule { font-size: 1rem }'
    const processed = postcss(pxtorem()).process(css).css

    expect(processed).toBe(expected)
  })

  test('empty', () => {
    const css = ''
    const expected = ''
    const processed = postcss(pxtorem()).process(css).css
    expect(processed).toBe(expected)
  })

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

  test('atRules', () => {
    const css = '/* pxtorem?atRules=true */\n@media (min-width: 500px) { .rule { font-size: 16px } }'
    const processed = postcss(pxtorem()).process(css).css
    const expected = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }'

    expect(processed).toBe(expected)
  })

  test('convertPxInMediaQuery', () => {
    const css = '.rule { font-size: 16px } @media (min-width: 500px) { .rule { font-size: 16px } }'
    const processed = postcss(
      pxtorem({
        convertInMediaQuery: false,
      }),
    ).process(css).css
    const expected = '.rule { font-size: 1rem } @media (min-width: 500px) { .rule { font-size: 16px } }'

    expect(processed).toBe(expected)
  })

  test('minPixelValue', () => {
    const css = '/* pxtorem?minPixelValue=2 */\n.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }'

    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    const expected = '.rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }'
    expect(processed).toBe(expected)
  })

  test('multipleComments', () => {
    const css =
      '/* pxtorem?disable=false */\n.enable { font-size: 15px; }\n/* pxtorem?disable=true */\n.disable { font-size: 15px; }'
    const expected = '.enable { font-size: 0.9375rem; }\n.disable { font-size: 15px; }'
    const processed = postcss(pxtorem({ propList: ['*'] })).process(css).css

    expect(processed).toBe(expected)
  })

  test('integrate postcss-nested', () => {
    const css = `/* pxtorem?disable=false */
    .class {
      margin: -10px 20px;
      padding: 5rem 0.5px;
      border: 3px solid black;
      font-size: 14px;
      line-height: 20px;
    }
    .mmm {
      /* pxtorem-disable-next-line */
      font-size: 32px;
      line-height: 1em;
      .nested {
        font-size: 16px;
      }
    }
    
    /* pxtorem?disable=true */
    @media (min-width: 750px) {
      .class3 {
        font-size: 16px;
        line-height: 22px;
        .nested {
          font-size: 16px;
        }
      }
    }
    
    /* pxtorem?disable=false */
    .class2 {
      margin: -10px 20px;
      padding: 5rem 0.5px;
      border: 3px solid black;
      font-size: 14px;
      line-height: 20px;
      .nested {
        font-size: 16px;
      }
    }`

    const expected = `.class {
      margin: -0.625rem 1.25rem;
      padding: 5rem 0.03125rem;
      border: 0.1875rem solid black;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    .mmm {
      font-size: 32px;
      line-height: 1em;
    }
    .mmm .nested {
        font-size: 1rem;
      }
    @media (min-width: 750px) {
      .class3 {
        font-size: 16px;
        line-height: 22px;
      }
        .class3 .nested {
          font-size: 16px;
        }
    }
    .class2 {
      margin: -0.625rem 1.25rem;
      padding: 5rem 0.03125rem;
      border: 0.1875rem solid black;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    .class2 .nested {
        font-size: 1rem;
      }`
    const processed = postcss(pxtorem(), nested).process(css).css

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

describe('unitToConvert', () => {
  test('should ignore non px values by default', () => {
    const expected = '.rule { font-size: 2em }'
    const processed = postcss(pxtorem()).process(expected).css

    expect(processed).toBe(expected)
  })

  test('should convert only values described in options', () => {
    const rules = '.rule { font-size: 30em; line-height: 2px }'
    const expected = '.rule { font-size: 1.875rem; line-height: 2px }'
    const options = {
      unitToConvert: 'em',
    }
    const processed = postcss(pxtorem(options)).process(rules).css

    expect(processed).toBe(expected)
  })
})

describe('convertUnitOnEnd', () => {
  test('should convert PX to px with RegExp', () => {
    const css = '.rule { font-size: 2PX }'
    const expected = '.rule { font-size: 2px }'
    const processed = postcss(
      pxtorem({
        convertUnitOnEnd: {
          sourceUnit: /[p|P][x|X]$/,
          targetUnit: 'px',
        },
      }),
    ).process(css).css

    expect(processed).toBe(expected)
  })

  test('should convert PX to px with String', () => {
    const css = '.rule { font-size: 2PX }'
    const expected = '.rule { font-size: 2px }'
    const processed = postcss(
      pxtorem({
        convertUnitOnEnd: {
          sourceUnit: 'PX',
          targetUnit: 'px',
        },
      }),
    ).process(css).css

    expect(processed).toBe(expected)
  })
})
