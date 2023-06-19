import type { Input, Plugin as PostcssPlugin, Rule } from 'postcss'
import {
  blacklistedSelector,
  checkIfDisable,
  convertUnit,
  createPropListMatcher,
  currentOptions,
  declarationExists,
  initOptions,
  isArray,
  isBoolean,
  isPxtoremReg,
  setupCurrentOptions,
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
  const ORIGINAL_OPTIONS = initOptions(options)

  const plugin: PostcssPlugin = {
    postcssPlugin,
    Once(r, h) {
      const node = r.root()
      const firstNode = node.nodes[0]

      h[currentOptions] = {
        isExcludeFile: false,
        pxReplace: undefined,
        rootValue: undefined,
        originOpts: ORIGINAL_OPTIONS,
      }

      setupCurrentOptions(h as any, firstNode)
    },
    Comment(node, h) {
      setupCurrentOptions(h as any, node)
    },
    CommentExit(comment) {
      if (comment.text.match(isPxtoremReg)?.length) {
        comment.remove()
      }
    },
    Declaration(decl, h) {
      const opts = h[currentOptions].originOpts

      if (checkIfDisable({ disable: opts.disable, isExcludeFile: h[currentOptions].isExcludeFile, r: decl })) {
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
      const value = h[currentOptions].pxReplace ? decl.value.replace(pxRegex, h[currentOptions].pxReplace) : decl.value

      if (declarationExists(decl.parent!, decl.prop, value)) return

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value })
      }
    },
    DeclarationExit(decl, h) {
      const opts = h[currentOptions].originOpts
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
    AtRule(atRule, h) {
      const opts = h[currentOptions].originOpts

      if (checkIfDisable({ disable: opts.disable, isExcludeFile: h[currentOptions].isExcludeFile, r: atRule })) {
        return
      }

      function replacePxInRules() {
        if (!atRule.params.includes(opts.unitToConvert)) return
        const pxRegex = getUnitRegexp(opts.unitToConvert)
        atRule.params = h[currentOptions].pxReplace
          ? atRule.params.replace(pxRegex, h[currentOptions].pxReplace)
          : atRule.params
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
