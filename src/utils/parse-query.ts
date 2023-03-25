// Taken from query-string
import decodeComponent from 'decode-uri-component'
import splitOnFirst from 'split-on-first'

function validateArrayFormatSeparator(value: string | undefined) {
  if (typeof value !== 'string' || value.length !== 1) {
    throw new TypeError('arrayFormatSeparator must be single character string')
  }
}

export type ParsedQuery<T = string> = Record<string, T | null | Array<T | null>>

export type ParseOptions = {
  /**
	Decode the keys and values. URI components are decoded with [`decode-uri-component`](https://github.com/SamVerschueren/decode-uri-component).

	@default true
	*/
  readonly decode?: boolean

  /**
	@default 'none'

	- `bracket`: Parse arrays with bracket representation:

		```
		import queryString from 'query-string';

		queryString.parse('foo[]=1&foo[]=2&foo[]=3', {arrayFormat: 'bracket'});
		//=> {foo: ['1', '2', '3']}
		```

	- `index`: Parse arrays with index representation:

		```
		import queryString from 'query-string';

		queryString.parse('foo[0]=1&foo[1]=2&foo[3]=3', {arrayFormat: 'index'});
		//=> {foo: ['1', '2', '3']}
		```

	- `comma`: Parse arrays with elements separated by comma:

		```
		import queryString from 'query-string';

		queryString.parse('foo=1,2,3', {arrayFormat: 'comma'});
		//=> {foo: ['1', '2', '3']}
		```

	- `separator`: Parse arrays with elements separated by a custom character:

		```
		import queryString from 'query-string';

		queryString.parse('foo=1|2|3', {arrayFormat: 'separator', arrayFormatSeparator: '|'});
		//=> {foo: ['1', '2', '3']}
		```

	- `bracket-separator`: Parse arrays (that are explicitly marked with brackets) with elements separated by a custom character:

		```
		import queryString from 'query-string';

		queryString.parse('foo[]', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
		//=> {foo: []}

		queryString.parse('foo[]=', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
		//=> {foo: ['']}

		queryString.parse('foo[]=1', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
	 	//=> {foo: ['1']}

		queryString.parse('foo[]=1|2|3', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
		//=> {foo: ['1', '2', '3']}

		queryString.parse('foo[]=1||3|||6', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
		//=> {foo: ['1', '', 3, '', '', '6']}

		queryString.parse('foo[]=1|2|3&bar=fluffy&baz[]=4', {arrayFormat: 'bracket-separator', arrayFormatSeparator: '|'});
		//=> {foo: ['1', '2', '3'], bar: 'fluffy', baz:['4']}
		```

	- `colon-list-separator`: Parse arrays with parameter names that are explicitly marked with `:list`:

		```
		import queryString from 'query-string';

		queryString.parse('foo:list=one&foo:list=two', {arrayFormat: 'colon-list-separator'});
		//=> {foo: ['one', 'two']}
		```

	- `none`: Parse arrays with elements using duplicate keys:

		```
		import queryString from 'query-string';

		queryString.parse('foo=1&foo=2&foo=3');
		//=> {foo: ['1', '2', '3']}
		```
	*/
  readonly arrayFormat?:
    | 'bracket'
    | 'index'
    | 'comma'
    | 'separator'
    | 'bracket-separator'
    | 'colon-list-separator'
    | 'none'

  /**
	The character used to separate array elements when using `{arrayFormat: 'separator'}`.

	@default ,
	*/
  readonly arrayFormatSeparator?: string

  /**
	Supports both `Function` as a custom sorting function or `false` to disable sorting.

	If omitted, keys are sorted using `Array#sort`, which means, converting them to strings and comparing strings in Unicode code point order.

	@default true

	@example
	```
	import queryString from 'query-string';

	const order = ['c', 'a', 'b'];

	queryString.parse('?a=one&b=two&c=three', {
		sort: (itemLeft, itemRight) => order.indexOf(itemLeft) - order.indexOf(itemRight)
	});
	//=> {c: 'three', a: 'one', b: 'two'}
	```

	@example
	```
	import queryString from 'query-string';

	queryString.parse('?a=one&c=three&b=two', {sort: false});
	//=> {a: 'one', c: 'three', b: 'two'}
	```
	*/
  readonly sort?: ((itemLeft: string, itemRight: string) => number) | boolean

  /**
	Parse the value as a number type instead of string type if it's a number.

	@default false

	@example
	```
	import queryString from 'query-string';

	queryString.parse('foo=1', {parseNumbers: true});
	//=> {foo: 1}
	```
	*/
  readonly parseNumbers?: boolean

  /**
	Parse the value as a boolean type instead of string type if it's a boolean.

	@default false

	@example
	```
	import queryString from 'query-string';

	queryString.parse('foo=true', {parseBooleans: true});
	//=> {foo: true}
	```
	*/
  readonly parseBooleans?: boolean
}

export function parse(
  query: string,
  options: { parseBooleans: true; parseNumbers: true } & ParseOptions,
): ParsedQuery<string | boolean | number>
export function parse(query: string, options: { parseBooleans: true } & ParseOptions): ParsedQuery<string | boolean>
export function parse(query: string, options: { parseNumbers: true } & ParseOptions): ParsedQuery<string | number>
export function parse(query: string, options?: ParseOptions): ParsedQuery
export function parse(query: any, options: any): any {
  options = {
    decode: true,
    sort: true,
    arrayFormat: 'none',
    arrayFormatSeparator: ',',
    parseNumbers: false,
    parseBooleans: false,
    ...options,
  }

  validateArrayFormatSeparator(options.arrayFormatSeparator)

  const formatter = parserForArrayFormat(options)

  // Create an object with no prototype
  const returnValue = Object.create(null)

  if (typeof query !== 'string') {
    return returnValue
  }

  query = query.trim().replace(/^[?#&]/, '')

  if (!query) {
    return returnValue
  }

  for (const parameter of query.split('&')) {
    if (parameter === '') {
      continue
    }

    const parameter_ = options.decode ? parameter.replace(/\+/g, ' ') : parameter

    let [key, value] = splitOnFirst(parameter_, '=')

    if (key === undefined) {
      key = parameter_
    }

    // Missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value =
      value === undefined
        ? (null as any)
        : ['comma', 'separator', 'bracket-separator'].includes(options.arrayFormat!)
        ? value
        : decode(value, options)
    formatter(decode(key, options), value, returnValue)
  }

  for (const [key, value] of Object.entries(returnValue)) {
    if (typeof value === 'object' && value !== null) {
      for (const [key2, value2] of Object.entries(value)) {
        value[key2] = parseValue(value2, options)
      }
    } else {
      returnValue[key] = parseValue(value, options)
    }
  }

  if (options.sort === false) {
    return returnValue
  }

  return (options.sort === true ? Object.keys(returnValue).sort() : Object.keys(returnValue).sort(options.sort)).reduce(
    (result, key) => {
      const value = returnValue[key]
      if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
        // Sort object keys, not values
        result[key] = keysSorter(value)
      } else {
        result[key] = value
      }

      return result
    },
    Object.create(null),
  )
}

function parserForArrayFormat(options: ParseOptions) {
  let result

  switch (options.arrayFormat) {
    case 'index': {
      return (key, value, accumulator) => {
        result = /\[(\d*)]$/.exec(key)

        key = key.replace(/\[\d*]$/, '')

        if (!result) {
          accumulator[key] = value
          return
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = {}
        }

        accumulator[key][result[1]] = value
      }
    }

    case 'bracket': {
      return (key, value, accumulator) => {
        result = /(\[])$/.exec(key)
        key = key.replace(/\[]$/, '')

        if (!result) {
          accumulator[key] = value
          return
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value]
          return
        }

        accumulator[key] = [...accumulator[key], value]
      }
    }

    case 'colon-list-separator': {
      return (key, value, accumulator) => {
        result = /(:list)$/.exec(key)
        key = key.replace(/:list$/, '')

        if (!result) {
          accumulator[key] = value
          return
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value]
          return
        }

        accumulator[key] = [...accumulator[key], value]
      }
    }

    case 'comma':
    case 'separator': {
      return (key, value, accumulator) => {
        const isArray = typeof value === 'string' && value.includes(options.arrayFormatSeparator!)
        const isEncodedArray =
          typeof value === 'string' && !isArray && decode(value, options).includes(options.arrayFormatSeparator!)
        value = isEncodedArray ? decode(value, options) : value
        const newValue =
          isArray || isEncodedArray
            ? value.split(options.arrayFormatSeparator).map((item) => decode(item, options))
            : value === null
            ? value
            : decode(value, options)
        accumulator[key] = newValue
      }
    }

    case 'bracket-separator': {
      return (key, value, accumulator) => {
        const isArray = /(\[])$/.test(key)
        key = key.replace(/\[]$/, '')

        if (!isArray) {
          accumulator[key] = value ? decode(value, options) : value
          return
        }

        const arrayValue =
          value === null ? [] : value.split(options.arrayFormatSeparator).map((item) => decode(item, options))

        if (accumulator[key] === undefined) {
          accumulator[key] = arrayValue
          return
        }

        accumulator[key] = [...accumulator[key], ...arrayValue]
      }
    }

    default: {
      return (key, value, accumulator) => {
        if (accumulator[key] === undefined) {
          accumulator[key] = value
          return
        }

        accumulator[key] = [...[accumulator[key]].flat(), value]
      }
    }
  }
}
function decode(value: string, options: ParseOptions) {
  if (options.decode) {
    return decodeComponent(value)
  }

  return value
}

function parseValue(value, options: ParseOptions) {
  if (options.parseNumbers && !Number.isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '') {
    value = Number(value)
  } else if (
    options.parseBooleans &&
    value !== null &&
    (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')
  ) {
    value = value.toLowerCase() === 'true'
  }

  return value
}

function keysSorter(input) {
  if (Array.isArray(input)) {
    return input.sort()
  }

  if (typeof input === 'object') {
    return keysSorter(Object.keys(input))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => input[key])
  }

  return input
}
