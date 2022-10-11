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
  isOptionComment,
  isRepeatRun,
  judgeIsExclude,
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
  include: string | RegExp | ((filePath: string) => boolean) | null
  exclude: string | RegExp | ((filePath: string) => boolean) | null
  disable: boolean
}>

export const defaultOptions: Required<PxtoremOptions> = {
  rootValue: 16,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  atRules: false,
  minPixelValue: 0,
  include: null,
  exclude: null,
  disable: false,
}

function pxtorem(options?: PxtoremOptions) {
  let opts = initOptions(options)
  let isExcludeFile = false

  let pxReplace: ReturnType<typeof createPxReplace>

  let rootValue: number

  const plugin: PostcssPlugin = {
    postcssPlugin: 'postcss-pxtorem',

    Root(r, { Warning }) {
      if (opts.disable) return

      const root = r.root()

      const firstNode = root.nodes[0]

      if (isOptionComment(firstNode)) {
        opts = {
          ...opts,
          ...getOptionsFromComment(firstNode, Warning),
        }
      }
      const filePath = root.source?.input.file

      const exclude = opts.exclude
      const include = opts.include

      isExcludeFile = judgeIsExclude(exclude, include, filePath)
      rootValue = typeof opts.rootValue === 'function' ? opts.rootValue(root.source!.input) : opts.rootValue

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

    RootExit(r) {
      const root = r.root()

      const firstNode = root.nodes[0]
      if (isOptionComment(firstNode) && firstNode.text.includes('pxtorem')) {
        firstNode.remove()
      }
      opts = initOptions(options)
      isExcludeFile = false
      rootValue = typeof opts.rootValue === 'function' ? opts.rootValue(root.source!.input) : opts.rootValue
      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },
  }

  return plugin
}

pxtorem.postcss = true

export default pxtorem
