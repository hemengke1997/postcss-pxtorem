import type { AtRule, Comment, Declaration, Rule, Warning as postcssWarning } from 'postcss'
import queryString from 'query-string'
import reRegExp from '@stdlib/regexp-regexp'
import { isString } from './type'
import type { PxtoremOptions } from '.'
import { defaultOptions } from '.'

const processd = Symbol('processed')

export function isRepeatRun(r: Rule | Declaration | AtRule) {
  if ((r as unknown as Record<symbol, boolean>)[processd]) {
    return true
  }
  ;(r as unknown as Record<symbol, boolean>)[processd] = true
  return false
}

const maybeRegExpList = ['selectorBlackList', 'exclude']

function parseRegExp(maybuRegExp: unknown) {
  const RE_REGEXP = reRegExp()
  if (isString(maybuRegExp) && RE_REGEXP.test(maybuRegExp)) {
    return new RegExp(RE_REGEXP.exec(maybuRegExp)?.[1] || '', RE_REGEXP.exec(maybuRegExp)?.[2])
  }
  return maybuRegExp
}

export function getOptionsFromComment(comment: Comment, Warning: typeof postcssWarning) {
  try {
    let query = /(?<=pxtorem\?).+/g.exec(comment.text)?.[0]
    const ret: Record<string, any> = {}

    if (!query) return ret
    query = query.replaceAll(/\s+/g, '')

    const defaultKeys = Object.keys(defaultOptions)
    const parsed = queryString.parse(query, {
      parseBooleans: true,
      parseNumbers: true,
      arrayFormat: 'bracket-separator',
      arrayFormatSeparator: '|',
    })
    const RE_REGEXP = reRegExp()
    for (const k of Object.keys(parsed)) {
      if (defaultKeys.includes(k)) {
        let cur = parsed[k]
        if (maybeRegExpList.includes(k)) {
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
    return ret as PxtoremOptions
  } catch {
    // eslint-disable-next-line no-new
    new Warning('Unexpected comment', { start: comment.source?.start, end: comment.source?.end })
  }
}
