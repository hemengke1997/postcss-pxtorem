import type { AtRule, ChildNode, Comment, Container, Declaration, Root, Rule } from 'postcss'
import type { ConvertUnit, PxtoremOptions } from '..'
import { defaultOptions } from '..'
import { MAYBE_REGEXP } from './constant'
import { filterPropList } from './filter-prop-list'
import type { ParseOptions } from './parse-query'
import { parse } from './parse-query'

function reRegExp() {
  return /^\/((?:\\\/|[^\/])+)\/([imgy]*)$/
}

export function initOptions(options?: PxtoremOptions) {
  return Object.assign({}, defaultOptions, options)
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
    query = query.replaceAll(/\s+/g, '')

    const defaultKeys = Object.keys(defaultOptions)
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
          if (Array.isArray(cur)) {
            cur = cur.map((t) => {
              return parseRegExp(t)
            }) as any
          } else {
            if (isString(cur) && RE_REGEXP.test(cur)) {
              cur = parseRegExp(cur) as any
            }
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

export function createPropListMatcher(propList: string[]) {
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
    const pixels = parseFloat($1)
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

function isXClude(Xclude: PxtoremOptions['include'], filePath: string | undefined) {
  return (
    Xclude &&
    filePath &&
    ((isFunction(Xclude) && Xclude(filePath)) ||
      (isString(Xclude) && filePath.includes(Xclude)) ||
      (isRegExp(Xclude) && filePath.match(Xclude)))
  )
}

export function judgeIsExclude<T extends PxtoremOptions['include']>(
  exclude: T,
  include: T,
  filePath: string | undefined,
) {
  if (include) {
    if (isXClude(include, filePath)) {
      return false
    }
    return true
  }

  if (isXClude(exclude, filePath)) {
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

export const currentOptions = Symbol('currentOptions')

export type H = {
  [currentOptions]: {
    isExcludeFile: boolean
    pxReplace: ReturnType<typeof createPxReplace> | undefined
    rootValue: number | undefined
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
  const opts = h[currentOptions].originOpts

  const filePath = node?.source?.input.file

  if (isOptionComment(comment)) {
    h[currentOptions].originOpts = {
      ...opts,
      ...getOptionsFromComment(comment, opts.parseOptions),
    }
  }

  const exclude = opts.exclude
  const include = opts.include

  h[currentOptions].isExcludeFile = judgeIsExclude(exclude, include, filePath)

  if (checkIfDisable({ disable: opts.disable, isExcludeFile: h[currentOptions].isExcludeFile })) {
    return
  }

  h[currentOptions].rootValue = isFunction(opts.rootValue) ? opts.rootValue(node?.source!.input) : opts.rootValue

  h[currentOptions].pxReplace = createPxReplace(h[currentOptions].rootValue, opts.unitPrecision, opts.minPixelValue)
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

export function isNull(data: unknown): data is null {
  return is(data, DataType.null)
}

export function isUndefined(data: unknown): data is undefined {
  return is(data, DataType.undefined)
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
