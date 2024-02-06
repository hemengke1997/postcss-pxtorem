import { type Plugin as PostcssPlugin, type Rule } from 'postcss'
import { type PxtoremOptions } from './types'
import {
  OPTION_SYMBOL,
  blacklistedSelector,
  checkIfDisable,
  convertUnit,
  createFilterMatcher,
  declarationExists,
  initOptions,
  isArray,
  isBoolean,
  isPxtoremReg,
  setupCurrentOptions,
} from './utils'
import { DISABLE_NEXT_COMMENT } from './utils/constant'
import { getUnitRegexp } from './utils/pixel-unit-regex'

export type { PxtoremOptions }

export const DEFAULT_OPTIONS: Required<PxtoremOptions> = {
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
  convertUnitOnEnd: false,
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

      // `h` is a helper for keeping the options in current process context
      // fixed build mess in vite env
      h[OPTION_SYMBOL] = {
        isExcludeFile: false,
        pxReplace: undefined,
        originOpts: ORIGINAL_OPTIONS,
      }

      setupCurrentOptions(h as any, { node, comment: firstNode })
    },
    Comment(node, h) {
      setupCurrentOptions(h as any, { node, comment: node })
    },
    CommentExit(comment) {
      if (comment.text.match(isPxtoremReg)?.length) {
        comment.remove()
      }
    },
    Declaration(decl, h) {
      const opts = h[OPTION_SYMBOL].originOpts

      if (checkIfDisable({ disable: opts.disable, isExcludeFile: h[OPTION_SYMBOL].isExcludeFile, r: decl })) {
        return
      }

      const satisfyPropList = createFilterMatcher(opts.propList)

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
      const value = h[OPTION_SYMBOL].pxReplace ? decl.value.replace(pxRegex, h[OPTION_SYMBOL].pxReplace) : decl.value

      if (declarationExists(decl.parent!, decl.prop, value)) return

      if (opts.replace) {
        decl.value = value
      } else {
        decl.cloneAfter({ value })
      }
    },
    DeclarationExit(decl, h) {
      const opts = h[OPTION_SYMBOL].originOpts
      const { convertUnitOnEnd } = opts
      if (convertUnitOnEnd) {
        if (isArray(convertUnitOnEnd)) {
          convertUnitOnEnd.forEach((conv) => {
            decl.value = convertUnit(decl.value, conv)
          })
        } else {
          decl.value = convertUnit(decl.value, convertUnitOnEnd)
        }
      }
    },
    AtRule(atRule, h) {
      const opts = h[OPTION_SYMBOL].originOpts

      if (checkIfDisable({ disable: opts.disable, isExcludeFile: h[OPTION_SYMBOL].isExcludeFile, r: atRule })) {
        return
      }

      function replacePxInRules() {
        if (!atRule.params.includes(opts.unitToConvert)) return
        const pxRegex = getUnitRegexp(opts.unitToConvert)
        atRule.params = h[OPTION_SYMBOL].pxReplace
          ? atRule.params.replace(pxRegex, h[OPTION_SYMBOL].pxReplace)
          : atRule.params
      }

      if (isBoolean(opts.atRules) && opts.atRules) {
        replacePxInRules()
      }

      if (isArray(opts.atRules) && opts.atRules.length > 0 && opts.atRules.includes(atRule.name)) {
        replacePxInRules()
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
