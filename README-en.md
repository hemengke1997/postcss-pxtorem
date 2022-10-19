# postcss-pxtorem

**English** | [中文](./README.md)

A plugin for [PostCSS](https://github.com/ai/postcss) that generates rem units from pixel units.


## New Features

- specify any `postcss-pxtorem` option in css.
- ignore line in css.

## Install

```bash
pnpm install postcss @minko-fe/postcss-pxtorem -D
```

## Usage

> Pixels are the easiest unit to use (*opinion*). The only issue with them is that they don't let browsers change the default font size of 16. This script converts every px value to a rem from the properties you choose to allow the browser to set the font size.

### postcss.config.js


#### example

```js
module.exports = {
  plugins: [
    require('@minko-fe/postcss-pxtorem')({
      rootValue: 16,
      selectorBlackList: ['some-class'],
      propList: ['*'],
      atRules: ['media'],
      // ...
    }),
  ],
}
```

### options

| Name | Type | Default | Description
|---------|----------|---------|---------
| rootValue | `number` \| `((input: Input) => number)` | 16 | Represents the root element font size or returns the root element font size based on the [`input`](https://api.postcss.org/Input.html) parameter
| unitPrecision | `number` | 5 | The decimal numbers to allow the REM units to grow to.
| propList | `string[]` | `['*']` | The properties that can change from px to rem. Refer to: [propList](#propList)
| selectorBlackList | `(string \| RegExp)[]` | [] | The selectors to ignore and leave as px. Refer to: [selectorBlackList](#selectorBlackList)
| replace | `boolean` | true | Replaces rules containing rems instead of adding fallbacks.
| atRules | `boolean` \| `string[]` | false | Allow px to be converted in at-rules. Refer to [At-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule)
| minPixelValue | `number` | 0 | Set the minimum pixel value to replace.
| exclude | `string` \| `RegExp` \| `((filePath: string) => boolean) \| null` | /node_modules/i | The file path to ignore and leave as px. Refer to: [exclude](#exclude)
| include | `string` \| `RegExp` \| `((filePath: string) => boolean)` \| `null` | null | The file path to convert px to rem, in contrast to `exclude`, have higher priority than `exclude`. Same rules as `exclude`
| disable | `boolean` | false |  disable plugin

#### propList

- Values need to be exact matches.
- Use wildcard `*` to enable all properties. Example: `['*']`
- Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
- Use `!` to not match a property. Example: `['*', '!letter-spacing']`
- Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']`

#### selectorBlackList

- If value is string, it checks to see if selector contains the string.
  - `['body']` will match `.body-class`
- If value is regexp, it checks to see if the selector matches the regexp.
  - `[/^body$/]` will match `body` but not `.body`

#### exclude
- If value is string, it checks to see if file path contains the string.
  - `'exclude'` will match `\project\postcss-pxtorem\exclude\path`
- If value is regexp, it checks to see if file path matches the regexp.
  - `/exclude/i` will match `\project\postcss-pxtorem\exclude\path`
- If value is function, you can use exclude function to return a true and the file will be ignored.
  - the callback will pass the file path as  a parameter, it should returns a Boolean result.
  - `function (file) { return file.includes('exclude') }`


## ✨ About new features

### ⚙️ Dynamically set plugin options in css

#### disable plugin
```css
/* pxtorem?disabled=true */
.rule {
  font-size: 15px; // 15px
}
```

#### set rootValue
```css
/* pxtorem?rootValue=32 */
.rule {
  font-size: 30px; // 0.9375rem
}
```

🌰 The above is just a simple example, you can set any of the options supported by `postcss-pxtorem` in the css file

You may have seen that the css comment is very much like the browser url?😼.
That's right. For the specification, just refer to: [query-string](https://github.com/sindresorhus/query-string)

#### example

```css
/* postcss-pxtorem?disable=false&rootValue=32&propList[]=*&replace=false&selectorBlackList[]=/some-class/i */
```

### disable the next line in css file
```css
.rule {
  /* pxtorem-disable-next-line */
  font-size: 15px; // 15px
}
```

> If this has helped you, please don't hesitate to give a STAR, thanks! 😎


## ❤️ Thanks

[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[@tcstory/postcss-px-to-viewport](https://github.com/tcstory/postcss-px-to-viewport)

## 👀 Related

A CSS post-processor that converts px to viewport: [postcss-pxtoviewport](https://github.com/hemengke1997/postcss-pxtoviewport)
