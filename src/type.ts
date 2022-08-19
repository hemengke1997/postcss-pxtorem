enum EnumDataType {
  number = 'Number',
  string = 'String',
  boolean = 'Boolean',
  null = 'Null',
  undefined = 'Undefined',
  object = 'Object',
  array = 'Array',
  date = 'Date',
  regexp = 'RegExp',
  function = 'Function',
}

function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}
export function isNumber(data: unknown): data is number {
  return is(data, EnumDataType.number)
}
export function isString(data: unknown): data is string {
  return is(data, EnumDataType.string)
}
export function isBoolean(data: unknown): data is boolean {
  return is(data, EnumDataType.boolean)
}
export function isNull(data: unknown): data is null {
  return is(data, EnumDataType.null)
}
export function isUndefined(data: unknown): data is undefined {
  return is(data, EnumDataType.undefined)
}
export function isObject(data: unknown): data is Object {
  return is(data, EnumDataType.object)
}
export function isArray(data: unknown): data is Array<any> {
  return is(data, EnumDataType.array)
}
export function isRegExp(data: unknown): data is RegExp {
  return is(data, EnumDataType.regexp)
}
export function isFunction(data: unknown): data is Function {
  return is(data, EnumDataType.function)
}
