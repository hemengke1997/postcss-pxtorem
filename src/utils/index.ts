import {
  type AtRule,
  type ChildNode,
  type Comment,
  type Container,
  type Declaration,
  type Root,
  type Rule,
} from 'postcss'
import { DEFAULT_OPTIONS } from '..'
import { type ConvertUnit, type PxtoremOptions, type XCludeType } from '../types'
import { MAYBE_REGEXP } from './constant'
import { type ParseOptions, parse } from './parse-query'

function reRegExp() {
  return /^\/((?:\\\/|[^/])+)\/([gimy]*)$/
}

export const filterRule = Object.freeze({
  exact(list: string[]) {
    return list.filter((m) => m.match(/^[^!*]+$/))
  },
  contain(list: string[]) {
    return list.filter((m) => m.match(/^\*.+\*$/)).map((m) => m.slice(1, -1))
  },
  endWith(list: string[]) {
    return list.filter((m) => m.match(/^\*[^*]+$/)).map((m) => m.slice(1))
  },
  startWith(list: string[]) {
    return list.filter((m) => m.match(/^[^!*]+\*$/)).map((m) => m.slice(0, Math.max(0, m.length - 1)))
  },
  notExact(list: string[]) {
    return list.filter((m) => m.match(/^![^*].*$/)).map((m) => m.slice(1))
  },
  notContain(list: string[]) {
    return list.filter((m) => m.match(/^!\*.+\*$/)).map((m) => m.slice(2, -1))
  },
  notEndWith(list: string[]) {
    return list.filter((m) => m.match(/^!\*[^*]+$/)).map((m) => m.slice(2))
  },
  notStartWith(list: string[]) {
    return list.filter((m) => m.match(/^![^*]+\*$/)).map((m) => m.slice(1, -1))
  },
})

export function initOptions(options?: PxtoremOptions) {
  return Object.assign({}, DEFAULT_OPTIONS, options)
}

export function isOptionComment(node: ChildNode | undefined): node is Comment {
  return node?.type === 'comment'
}

const processd = Symbol('processed')

export function isRepeatRun(r?: Rule | Declaration | AtRule) {
  if (!r) return false
  if ((r as unknown as Record<symbol, boolean>)[processd]) {
    return true
  }
  ;(r as unknown as Record<symbol, boolean>)[processd] = true
  return false
}

function parseRegExp(maybeRegExpArg: unknown) {
  const RE_REGEXP = reRegExp()
  if (isString(maybeRegExpArg) && RE_REGEXP.test(maybeRegExpArg)) {
    return new RegExp(RE_REGEXP.exec(maybeRegExpArg)?.[1] || '', RE_REGEXP.exec(maybeRegExpArg)?.[2])
  }
  return maybeRegExpArg
}

export const isPxtoremReg = /(?<=^pxtorem\?).+/g

export function getOptionsFromComment(comment: Comment, parseOptions: ParseOptions): PxtoremOptions | undefined {
  try {
    const index = comment.text.search(isPxtoremReg)

    const ret: Record<string, any> = {}
    let query = comment.text.slice(index)

    if (!query || index === -1) return ret
    query = query.replace(/\s+/g, '')

    const defaultKeys = Object.keys(DEFAULT_OPTIONS)
    const parsed = parse(query, {
      parseBooleans: true,
      parseNumbers: true,
      arrayFormat: 'bracket-separator',
      arrayFormatSeparator: '|',
      ...parseOptions,
    })
    const RE_REGEXP = reRegExp()
    for (const k of Object.keys(parsed)) {
      if (defaultKeys.includes(k)) {
        let cur = parsed[k]
        if (MAYBE_REGEXP.includes(k)) {
          if (isArray(cur)) {
            cur = cur.map((t) => {
              return parseRegExp(t)
            }) as any
          } else if (isString(cur) && RE_REGEXP.test(cur)) {
            cur = parseRegExp(cur) as any
          }
        }

        ret[k] = cur
      }
    }
    return ret
  } catch {
    console.warn('Unexpected comment', { start: comment.source?.start, end: comment.source?.end })
  }
}

export function createFilterMatcher(filterList: string[]) {
  const hasWild = filterList.includes('*')
  const matchAll = hasWild && filterList.length === 1
  const lists = {
    exact: filterRule.exact(filterList),
    contain: filterRule.contain(filterList),
    startWith: filterRule.startWith(filterList),
    endWith: filterRule.endWith(filterList),
    notExact: filterRule.notExact(filterList),
    notContain: filterRule.notContain(filterList),
    notStartWith: filterRule.notStartWith(filterList),
    notEndWith: filterRule.notEndWith(filterList),
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

export function toFixed(number: number, precision: number) {
  const multiplier = 10 ** (precision + 1)
  const wholeNumber = Math.floor(number * multiplier)
  return (Math.round(wholeNumber / 10) * 10) / multiplier
}

export function createPxReplace(
  rootValue: number,
  unitPrecision: NonNullable<PxtoremOptions['unitPrecision']>,
  minPixelValue: NonNullable<PxtoremOptions['minPixelValue']>,
) {
  return (m: string, $1: string) => {
    if (!$1) return m
    const pixels = Number.parseFloat($1)
    if (pixels <= minPixelValue) return m
    const fixedVal = toFixed(pixels / rootValue, unitPrecision)
    return fixedVal === 0 ? '0' : `${fixedVal}rem`
  }
}

export function blacklistedSelector(blacklist: NonNullable<PxtoremOptions['selectorBlackList']>, selector: string) {
  if (!isString(selector)) return
  return blacklist.some((t) => {
    if (isString(t)) {
      return selector.includes(t)
    }
    return selector.match(t)
  })
}

export function declarationExists(decls: Container<ChildNode>, prop: string, value: string) {
  return decls.some((decl) => {
    return (decl as Declaration).prop === prop && (decl as Declaration).value === value
  })
}

function isXClude(Xclude: XCludeType, filePath: string | undefined) {
  return (
    Xclude &&
    filePath &&
    ((isFunction(Xclude) && Xclude(filePath)) ||
      (isString(Xclude) && filePath.includes(Xclude)) ||
      (isRegExp(Xclude) && Xclude.test(filePath)))
  )
}

/**
 * Judge if the file is excluded
 * @returns if filePath is excluded, return true, else return false
 */
export function judgeIsExclude<T extends XCludeType>(exclude: T, include: T, filePath: string | undefined) {
  console.log({ exclude, include, filePath })
  // exec exclude filter first.
  // { include: /path/, exclude: 'path/a' } means path/a will be excluded
  if (isXClude(exclude, filePath)) {
    // excluded
    return true
  }

  if (include) {
    if (isXClude(include, filePath)) {
      // included, return false
      return false
    }
    return true
  }

  return false
}

export function convertUnit(value: string, convert: ConvertUnit) {
  if (typeof convert.sourceUnit === 'string') {
    return value.replace(new RegExp(`${convert.sourceUnit}$`), convert.targetUnit)
  } else if (isRegExp(convert.sourceUnit)) {
    return value.replace(new RegExp(convert.sourceUnit), convert.targetUnit)
  }
  return value
}

export function checkIfDisable(p: { disable: boolean; isExcludeFile: boolean; r?: Parameters<typeof isRepeatRun>[0] }) {
  const { disable, isExcludeFile, r } = p
  return disable || isExcludeFile || isRepeatRun(r)
}

export const OPTION_SYMBOL = Symbol('OPTION_SYMBOL')

export type H = {
  [OPTION_SYMBOL]: {
    isExcludeFile: boolean
    pxReplace: ReturnType<typeof createPxReplace> | undefined
    originOpts: ReturnType<typeof initOptions>
  }
}

export function setupCurrentOptions(
  h: H,
  {
    node,
    comment,
  }: {
    node?: ChildNode | Root
    comment?: ChildNode | Comment
  },
) {
  if (isOptionComment(comment)) {
    h[OPTION_SYMBOL].originOpts = {
      ...h[OPTION_SYMBOL].originOpts,
      ...getOptionsFromComment(comment, h[OPTION_SYMBOL].originOpts.parseOptions),
    }
  }

  const { originOpts } = h[OPTION_SYMBOL]

  const { include, exclude, rootValue, disable } = originOpts

  h[OPTION_SYMBOL].isExcludeFile = judgeIsExclude(exclude, include, node?.source?.input.file)

  if (checkIfDisable({ disable, isExcludeFile: h[OPTION_SYMBOL].isExcludeFile })) {
    return
  }

  h[OPTION_SYMBOL].originOpts.rootValue = isFunction(rootValue) ? rootValue(node?.source!.input) : rootValue

  h[OPTION_SYMBOL].pxReplace = createPxReplace(
    h[OPTION_SYMBOL].originOpts.rootValue,
    originOpts.unitPrecision,
    originOpts.minPixelValue,
  )
}

enum DataType {
  number = 'Number',
  string = 'String',
  boolean = 'Boolean',
  null = 'Null',
  undefined = 'Undefined',
  object = 'Object',
  array = 'Array',
  regexp = 'RegExp',
  function = 'Function',
}

function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

export function isNumber(data: unknown): data is number {
  return is(data, DataType.number)
}

export function isString(data: unknown): data is string {
  return is(data, DataType.string)
}

export function isBoolean(data: unknown): data is boolean {
  return is(data, DataType.boolean)
}

export function isObject(data: unknown): data is Object {
  return is(data, DataType.object)
}

export function isArray(data: unknown): data is Array<any> {
  return is(data, DataType.array)
}

export function isRegExp(data: unknown): data is RegExp {
  return is(data, DataType.regexp)
}

export function isFunction(data: unknown): data is Function {
  return is(data, DataType.function)
}
