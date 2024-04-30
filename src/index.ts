import { cloneDeep, isArray, isBoolean } from '@minko-fe/lodash-pro'
import { type Plugin as PostcssPlugin, type Rule } from 'postcss'
import { type PxtoremOptions } from './types'
import {
  OPTION_SYMBOL,
  blacklistedSelector,
  checkIfDisable,
  convertUnitFn,
  createPropListMatcher,
  declarationExists,
  initOptions,
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
  convertUnit: false,
  parseOptions: {},
}

const postcssPlugin = 'postcss-pxtorem'

function pxtorem(options?: PxtoremOptions) {
  const RAW_OPTIONS = initOptions(options)

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
        originOpts: cloneDeep(RAW_OPTIONS), // avoid reference pollution
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
      const { convertUnit } = opts
      if (convertUnit) {
        if (isArray(convertUnit)) {
          decl.value = convertUnit.reduce((c, conv) => {
            return convertUnitFn(c, conv)
          }, decl.value)
        } else {
          decl.value = convertUnitFn(decl.value, convertUnit)
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
