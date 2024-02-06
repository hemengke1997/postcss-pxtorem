import { type Input } from 'postcss'
import { type ParseOptions } from './utils/parse-query'

export interface ConvertUnit {
  sourceUnit: string | RegExp
  targetUnit: string
}

export type XCludeType = string | RegExp | ((filePath: string) => boolean) | null

export type PxtoremOptions = Partial<{
  rootValue: number | ((input: Input | undefined) => number)
  unitToConvert: string
  unitPrecision: number
  selectorBlackList: (string | RegExp)[]
  propList: string[]
  replace: boolean
  atRules: boolean | string[]
  minPixelValue: number
  include: XCludeType
  exclude: XCludeType
  disable: boolean
  convertUnitOnEnd: ConvertUnit | ConvertUnit[] | false
  parseOptions: ParseOptions
}>
