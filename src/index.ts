import type { Input, Plugin as PostcssPlugin, Rule } from 'postcss'
import {
  blacklistedSelector,
  createPropListMatcher,
  createPxReplace,
  declarationExists,
  getOptionsFromComment,
  initOptions,
  isArray,
  isBoolean,
  isFunction,
  isOptionComment,
  isRegExp,
  isRepeatRun,
  isString,
} from './utils'
import { pxRegex } from './pixel-unit-regex'
import { disableNextComment } from './constant'

export type PxtoremOptions = Partial<{
  rootValue: number | ((input: Input) => number)
  unitPrecision: number
  selectorBlackList: (string | RegExp)[]
  propList: string[]
  replace: boolean
  atRules: boolean | string[]
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
  atRules: false,
  minPixelValue: 0,
  exclude: /node_modules/i,
  disable: false,
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

      function replacePxInRules() {
        if (!atRule.params.includes('px')) return
        atRule.params = atRule.params.replace(pxRegex, pxReplace)
      }

      if (isBoolean(opts.atRules) && opts.atRules) {
        replacePxInRules()
      }
      if (isArray(opts.atRules) && opts.atRules.length) {
        if (opts.atRules.includes(atRule.name)) {
          replacePxInRules()
        }
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
