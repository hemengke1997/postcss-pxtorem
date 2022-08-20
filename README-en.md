# @minko-fe/postcss-pxtorem

A plugin for [PostCSS](https://github.com/ai/postcss) that generates rem units from pixel units.


## New Feature

- specify any `postcss-pxtorem` option in css.
- ignore line in css.

## Install

```bash
pnpm install postcss @minko-fe/postcss-pxtorem -D
```

## Usage

> Pixels are the easiest unit to use (*opinion*). The only issue with them is that they don't let browsers change the default font size of 16. This script converts every px value to a rem from the properties you choose to allow the browser to set the font size.

### postcss.config.js

```js
module.exports = {
  plugins: [
    require('@minko-fe/postcss-pxtorem')({
      propList: ['*'],
    }),
  ],
}
```

### options

Type: `Object | Null`
Default:
```js
const defaultOption = {
    rootValue: 16,
    unitPrecision: 5,
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    selectorBlackList: [],
    replace: true,
    mediaQuery: false,
    minPixelValue: 0,
    exclude: /node_modules/i,
    disable: false
}
```

- `rootValue` (Number | Function) Represents the root element font size or returns the root element font size based on the [`input`](https://api.postcss.org/Input.html) parameter
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propList` (Array) The properties that can change from px to rem.
    - Values need to be exact matches.
    - Use wildcard `*` to enable all properties. Example: `['*']`
    - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']`
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `replace` (Boolean) Replaces rules containing rems instead of adding fallbacks.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `exclude` (String, Regexp, Function) The file path to ignore and leave as px.
    - If value is string, it checks to see if file path contains the string.
        - `'exclude'` will match `\project\postcss-pxtorem\exclude\path`
    - If value is regexp, it checks to see if file path matches the regexp.
        - `/exclude/i` will match `\project\postcss-pxtorem\exclude\path`
    - If value is function, you can use exclude function to return a true and the file will be ignored.
        - the callback will pass the file path as  a parameter, it should returns a Boolean result.
        - `function (file) { return file.indexOf('exclude') !== -1; }`
- `disable` (Boolean) disable this plugin

## ✨ About new feature

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

You may have seen that he is very much like the browser url?😼.
That's right. For the specification, just refer to: https://www.npmjs.com/package/query-string

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


## Thanks

[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[@tcstory/postcss-px-to-viewport](https://github.com/tcstory/postcss-px-to-viewport)
