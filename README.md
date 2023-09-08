# postcss-pxtorem

![npm][npm-img] ![npm][npm-download]


**中文** | [English](./README.md)

> [PostCSS](https://github.com/ai/postcss) 插件，可以从像素单位生成 rem 单位

**如果你不需要以下新功能，可以使用官方库：[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)**

## ✨ [新特性](#✨-关于新特性)

- 在样式文件中动态重写覆盖任意 `postcss-pxtorem` 支持的选项
- 在样式文件中动态禁用转化rem
- **兼容vite，_解决了打包后样式混乱的问题_**

## 🔧 安装

```bash
pnpm install postcss @minko-fe/postcss-pxtorem -D
```

## ✍️ 使用

> 像素是最容易使用的单位。它们的唯一问题是，它们不能让浏览器改变默认的 16 号字体大小。postcss-pxtorem 将每一个 px 值转换为你所选择的属性中的 rem，以便让浏览器设置字体大小。

### postcss.config.js

#### example

```js
// postcss.config.js
import pxtorom from '@minko-fe/postcss-pxtorem'

export default {
  plugins: [
    pxtorom({
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

| Name              | Type                                                                | Default | Description                                                                                        |
| ----------------- | ------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| rootValue         | `number` \| `((input: Input) => number)`                            | 16      | 代表根元素的字体大小或根据 [`input`](https://api.postcss.org/Input.html) 参数返回根元素的字体大小  |
| unitToConvert     | `string`                                                            | `px`    | 需要转化的单位，默认 `px`                                                                          |
| unitPrecision     | `number`                                                            | 5       | 小数点后精度                                                                                       |
| propList          | `string[]`                                                          | `['*']` | 可以从 px 改变为 rem 的属性，参考：[propList](#propList)                                           |
| selectorBlackList | `(string \| RegExp)[]`                                              | []      | 忽略的选择器，保留为 px。参考：[selectorBlackList](#selectorBlackList)                             |
| replace           | `boolean`                                                           | true    | 直接在 css 规则上替换值而不是添加备用                                                              |
| atRules           | `boolean` \| `string[]`                                             | false   | 允许`at-rules`中转换 rem。参考 [At-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule) |
| minPixelValue     | `number`                                                            | 0       | 最小的 px 转化值（小于这个值的不转化）                                                             |
| exclude           | `string` \| `RegExp` \| `((filePath: string) => boolean)` \| `null` | null    | 忽略的文件路径。参考：[exclude](#exclude)                                                          |
| include           | `string` \| `RegExp` \| `((filePath: string) => boolean)` \| `null` | null    | 包括的文件路径，与 `exclude` 相反，优先级高于 `exclude`。规则同 `exclude`                          |
| disable           | `boolean`                                                           | false   | 关闭插件                                                                                           |
| convertUnitOnEnd  | `ConvertUnit` \| `ConvertUnit[]` \| false \| null                   | null    | 插件处理的最后阶段转换单位                                                                         |

#### propList

- 值需要完全匹配
- 使用通配符 `*` 来启用所有属性. Example: `['*']`
- 在一个词的开头或结尾使用 `*`. (`['*position*']` will match `background-position-y`)
- 使用 `!` 不匹配一个属性. Example: `['*', '!letter-spacing']`
- 组合 `!` 与 `*`. Example: `['*', '!font*']`

#### selectorBlackList

- 如果值是字符串，它会检查选择器是否包含字符串.
  - `['body']` will match `.body-class`
- 如果值是正则，它会检查选择器是否与正则相匹配.
  - `[/^body$/]` will match `body` but not `.body`

#### exclude

- 如果值是字符串，它检查文件路径是否包含字符串
  - `'exclude'` will match `\project\postcss-pxtorem\exclude\path`
- 如果值是正则，它将检查文件路径是否与正则相匹配
  - `/exclude/i` will match `\project\postcss-pxtorem\exclude\path`
- 如果值是函数，你可以使用排除函数返回 true，文件将被忽略
  - 回调将传递文件路径作为一个参数，它应该返回一个 boolean
  - `function (file) { return file.includes('exclude') }`

## ✨ 关于新特性

### ⚙️ 在 css 中，动态设置插件选项

#### 整个文件禁用转换

```css
/* pxtorem?disable=true */
.rule {
  font-size: 15px; // 15px
}
```

#### 设置 rootValue

```css
/* pxtorem?rootValue=32 */
.rule {
  font-size: 30px; // 0.9375rem
}
```

🌰 以上只是简单的栗子，你可以在 css 文件中设置任意 `postcss-pxtorem` 支持的选项

聪明的你，或许已经看出来了，`/* pxtorem?disable=true */` 很像浏览器 url query？😼
没错。关于规范，只需参考：[query-string](https://github.com/sindresorhus/query-string)

#### 完整例子

```css
/* pxtorem?disable=false&rootValue=32&propList[]=*&replace=false&selectorBlackList[]=/some-class/i */
```

### 在 css 中，动态禁用转换

```css
.rule {
  /* pxtorem-disable-next-line */
  font-size: 15px; // 15px
}
```

如果你写 `15PX`（只要不是 `px`），插件也会忽略，因为 `unitToConvert` 默认是 `px`
如果你希望使用 `PX` 忽略并且希望最后得到的单位是 `px`，你可以这样

```js
// postcss.config.js
import pxtorem from '@minko-fe/postcss-pxtorem'

export default {
  plugins: [
    pxtorem({
      convertUnitOnEnd: {
        sourceUnit: /[p|P][x|X]$/,
        targetUnit: 'px',
      },
    }),
  ],
}
```

## 搭配[modern-flexible](https://github.com/hemengke1997/modern-flexible)使用

### example

#### 入口函数
```ts
import { flexible } from 'modern-flexible'

flexible({
  rootValue: 16,
  distinctDevice: [
    { isDevice: (clientWidth) => clientWidth < 750, UIWidth: 375, deviceWidthRange: [375, 750] },
    { isDevice: (clientWidth) => clientWidth >= 750, UIWidth: 1920, deviceWidthRange: [1080, 1920] },
  ],
})
```

## ❤️ 感谢

[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[@tcstory/postcss-px-to-viewport](https://github.com/tcstory/postcss-px-to-viewport)

## 👀 相关

转换 px 至 viewport 的 postcss 插件 [postcss-pxtoviewport](https://github.com/hemengke1997/postcss-pxtoviewport)

## 💕 支持

**如果这个仓库帮了你的忙，请右上角star，感谢！～ 😎**

## License

MIT

[npm-img]: https://img.shields.io/npm/v/%40minko-fe/postcss-pxtorem.svg
[npm-download]: https://img.shields.io/npm/dm/%40minko-fe/postcss-pxtorem

