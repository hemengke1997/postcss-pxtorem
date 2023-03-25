import type { Input, Plugin as PostcssPlugin, Rule } from 'postcss'
import {
  blacklistedSelector,
  checkoutDisable,
  convertUnit,
  createPropListMatcher,
  createPxReplace,
  declarationExists,
  getOptionsFromComment,
  initOptions,
  isArray,
  isBoolean,
  isFunction,
  isOptionComment,
  isPxtoremReg,
  judgeIsExclude,
} from './utils'
import { getUnitRegexp } from './utils/pixel-unit-regex'
import { DISABLE_NEXT_COMMENT } from './utils/constant'
import type { ParseOptions } from './utils/parse-query'

export interface ConvertUnit {
  sourceUnit: string | RegExp
  targetUnit: string
}

export type PxtoremOptions = Partial<{
  rootValue: number | ((input: Input) => number)
  unitToConvert: string
  unitPrecision: number
  selectorBlackList: (string | RegExp)[]
  propList: string[]
  replace: boolean
  atRules: boolean | string[]
  minPixelValue: number
  include: string | RegExp | ((filePath: string) => boolean) | null
  exclude: string | RegExp | ((filePath: string) => boolean) | null
  disable: boolean
  convertUnitOnEnd: ConvertUnit | ConvertUnit[] | false | null
  parseOptions: ParseOptions
}>

export const defaultOptions: Required<PxtoremOptions> = {
  rootValue: 16,
  unitToConvert: 'px',
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  atRules: false,
  minPixelValue: 0,
  include: null,
  exclude: null,
  disable: false,
  convertUnitOnEnd: null,
  parseOptions: {},
}

const postcssPlugin = 'postcss-pxtorem'

function pxtorem(options?: PxtoremOptions) {
  let opts = initOptions(options)
  let isExcludeFile = false

  let pxReplace: ReturnType<typeof createPxReplace>

  let rootValue: number

  const plugin: PostcssPlugin = {
    postcssPlugin,

    Once(r, { Warning }) {
      const node = r.root()
      const firstNode = node.nodes[0]
      const filePath = node.source?.input.file

      if (isOptionComment(firstNode)) {
        opts = {
          ...opts,
          ...getOptionsFromComment(firstNode, Warning, opts.parseOptions),
        }
      }

      const exclude = opts.exclude
      const include = opts.include
      isExcludeFile = judgeIsExclude(exclude, include, filePath)

      if (checkoutDisable({ disable: opts.disable, isExcludeFile })) {
        return
      }

      rootValue = isFunction(opts.rootValue) ? opts.rootValue(node.source!.input) : opts.rootValue
      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },
    Declaration(decl) {
      if (checkoutDisable({ disable: opts.disable, isExcludeFile, r: decl })) {
        return
      }

      const satisfyPropList = createPropListMatcher(opts.propList)

      if (
        !decl.value.includes(opts.unitToConvert) ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, (decl.parent as Rule).selector)
      ) {
        return
      }

      const prev = decl.prev()

      if (prev?.type === 'comment' && prev.text === DISABLE_NEXT_COMMENT) {
        prev.remove()
        return
      }

      const pxRegex = getUnitRegexp(opts.unitToConvert)
      const value = decl.value.replace(pxRegex, pxReplace)

      if (declarationExists(decl.parent!, decl.prop, value)) return

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value })
      }
    },
    DeclarationExit(decl) {
      const { convertUnitOnEnd } = opts
      if (convertUnitOnEnd) {
        if (Array.isArray(convertUnitOnEnd)) {
          convertUnitOnEnd.forEach((conv) => {
            decl.value = convertUnit(decl.value, conv)
          })
        } else {
          decl.value = convertUnit(decl.value, convertUnitOnEnd)
        }
      }
    },
    AtRule(atRule) {
      if (checkoutDisable({ disable: opts.disable, isExcludeFile, r: atRule })) {
        return
      }

      function replacePxInRules() {
        if (!atRule.params.includes(opts.unitToConvert)) return
        const pxRegex = getUnitRegexp(opts.unitToConvert)
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
    Comment(node, { Warning }) {
      const filePath = node.source?.input.file

      opts = {
        ...opts,
        ...getOptionsFromComment(node, Warning, opts.parseOptions),
      }

      const exclude = opts.exclude
      const include = opts.include

      isExcludeFile = judgeIsExclude(exclude, include, filePath)

      if (checkoutDisable({ disable: opts.disable, isExcludeFile })) {
        return
      }

      rootValue = isFunction(opts.rootValue) ? opts.rootValue(node.source!.input) : opts.rootValue

      pxReplace = createPxReplace(rootValue, opts.unitPrecision, opts.minPixelValue)
    },
    CommentExit(comment) {
      if (comment.text.match(isPxtoremReg)?.length) {
        comment.remove()
      }
    },
    OnceExit() {
      isExcludeFile = false
      opts = initOptions(options)
    },
  }

  if (options?.disable) {
    return {
      postcssPlugin,
    }
  }
  return plugin
}

pxtorem.postcss = true

export default pxtorem

export { pxtorem }
