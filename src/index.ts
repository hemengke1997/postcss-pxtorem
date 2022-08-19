import type { ChildNode, Comment, Container, Declaration, Input, Plugin as PostcssPlugin, Rule } from 'postcss'
import { filterPropList } from './filter-prop-list'
import { getOptionsFromComment, isRepeatRun } from './utils'
import { isFunction, isRegExp, isString } from './type'
import { pxRegex } from './pixel-unit-regex'

export type PxtoremOptions = Partial<{
  rootValue: number | ((input: Input) => number)
  unitPrecision: number
  selectorBlackList: (string | RegExp)[]
  propList: string[]
  replace: boolean
  mediaQuery: boolean
  minPixelValue: number
  exclude: string | RegExp | ((filePath: string) => boolean) | null
  disable: boolean
}>

export const defaultOptions: Required<PxtoremOptions> = {
  rootValue: 16,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
  disable: false,
}

function createPropListMatcher(propList: string[]) {
  const hasWild = propList.includes('*')
  const matchAll = hasWild && propList.length === 1
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList),
  }
  return function (prop: string) {
    if (matchAll) return true
    return (
      (hasWild ||
        lists.exact.includes(prop) ||
        lists.contain.some((m) => prop.includes(m)) ||
        lists.startWith.some((m) => prop.indexOf(m) === 0) ||
        lists.endWith.some((m) => prop.indexOf(m) === prop.length - m.length)) &&
      !(
        lists.notExact.includes(prop) ||
        lists.notContain.some((m) => prop.includes(m)) ||
        lists.notStartWith.some((m) => prop.indexOf(m) === 0) ||
        lists.notEndWith.some((m) => prop.indexOf(m) === prop.length - m.length)
      )
    )
  }
}

function toFixed(number: number, precision: number) {
  const multiplier = 10 ** (precision + 1)
  const wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

function createPxReplace(
  rootValue: number,
  unitPrecision: NonNullable<PxtoremOptions['unitPrecision']>,
  minPixelValue: NonNullable<PxtoremOptions['minPixelValue']>,
) {
  return (m: string, $1: string) => {
    if (!$1) return m
    const pixels = parseFloat($1)
    if (pixels < minPixelValue) return m
    const fixedVal = toFixed(pixels / rootValue, unitPrecision)
    return fixedVal === 0 ? '0' : `${fixedVal}rem`
  }
}

function blacklistedSelector(blacklist: NonNullable<PxtoremOptions['selectorBlackList']>, selector: string) {
  if (typeof selector !== 'string') return
  return blacklist.some((t) => {
    if (typeof t === 'string') {
      return selector.includes(t)
    }
    return selector.match(t)
  })
}

function declarationExists(decls: Container<ChildNode>, prop: string, value: string) {
  return decls.some((decl) => {
    return (decl as Declaration).prop === prop && (decl as Declaration).value === value
  })
}

const disableNextComment = 'pxtorem-disable-next-line'

function initOptions(options?: PxtoremOptions) {
  return Object.assign({}, defaultOptions, options)
}

function isOptionComment(node: ChildNode): node is Comment {
  return node.type === 'comment'
}
function pxtorem(options?: PxtoremOptions) {
  let opts = initOptions(options)
  let isExcludeFile = false

  let pxReplace: ReturnType<typeof createPxReplace>

  const plugin: PostcssPlugin = {
    postcssPlugin: 'postcss-pxtorem',
    Once(root, { Warning }) {
      if (opts.disable) return

      const firstNode = root.nodes[0]

      if (isOptionComment(firstNode)) {
        opts = {
          ...opts,
          ...getOptionsFromComment(firstNode, Warning),
        }
      }
      const filePath = root.source?.input.file

      const exclude = opts.exclude
      if (
        exclude &&
        ((isFunction(exclude) && exclude(filePath!)) ||
          (isString(exclude) && filePath?.includes(exclude)) ||
          (isRegExp(exclude) && filePath?.match(exclude) !== null))
      ) {
        isExcludeFile = true
      } else {
        isExcludeFile = false
      }

      const rootValue = typeof opts.rootValue === 'function' ? opts.rootValue(root.source!.input) : opts.rootValue
      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },

    Declaration(decl) {
      if (opts.disable) return
      if (isRepeatRun(decl)) return
      if (isExcludeFile) return
      const satisfyPropList = createPropListMatcher(opts.propList)

      if (
        !decl.value.includes('px') ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, (decl.parent as Rule).selector)
      ) {
        return
      }

      const prev = decl.prev()

      if (prev?.type === 'comment' && prev.text === disableNextComment) {
        prev.remove()
        return
      }

      const value = decl.value.replace(pxRegex, pxReplace)

      if (declarationExists(decl.parent!, decl.prop, value)) return
      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value })
      }
    },
    AtRule(atRule) {
      if (opts.disable) return
      if (isRepeatRun(atRule)) return
      if (isExcludeFile) return

      if (opts.mediaQuery && atRule.name === 'media') {
        if (!atRule.params.includes('px')) return
        atRule.params = atRule.params.replace(pxRegex, pxReplace)
      }
    },
    OnceExit(root) {
      const firstNode = root.nodes[0]
      if (isOptionComment(firstNode) && firstNode.text.includes('pxtorem')) {
        firstNode.remove()
      }
      opts = initOptions(options)
      isExcludeFile = false
    },
  }

  return plugin
}

pxtorem.postcss = true

// eslint-disable-next-line no-restricted-syntax
export default pxtorem
