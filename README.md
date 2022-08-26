# postcss-pxtorem

English docs: [[README-en.md](./README-en.md)]

[PostCSS](https://github.com/ai/postcss)插件，可以从像素单位生成rem单位


## 新功能

- 在样式文件中设置任意 `postcss-pxtorem` 支持的选项
- 在样式文件中忽略某一行

## 安装

```bash
pnpm install postcss @minko-fe/postcss-pxtorem -D
```

## 用法

> 像素是最容易使用的单位。它们的唯一问题是，它们不能让浏览器改变默认的16号字体大小。postcss-pxtorem将每一个px值转换为你所选择的属性中的rem，以便让浏览器设置字体大小。


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
| rootValue | `number` \| `((input: Input) => number)` | 16 | 代表根元素的字体大小或根据 [`input`](https://api.postcss.org/Input.html) 参数返回根元素的字体大小
| unitPrecision | `number` | 5 | 小数点后精度
| propList | `string[]` | ['*'] | 可以从px改变为rem的属性，参考：[propList](#propList)
| selectorBlackList | `(string \| RegExp)[]` | [] | 忽略的选择器，保留为px。参考：[selectorBlackList](#selectorBlackList)
| replace | `boolean` | true | 直接在css规则上替换值而不是添加备用
| atRules | `boolean` \| `string[]` | false | 允许`at-rules`中转换rem。参考 [At-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule)
| minPixelValue | `number` | 0 | 最小的px转化值（小于这个值的不转化）
| include | `string` \| `RegExp` \| `((filePath: string) => boolean)` \| `null` | null | 包括的文件（与exclude相反）。优先级比exclude高。规则同 `exclude`
| exclude | `string` \| `RegExp` \| `((filePath: string) => boolean)` \| `null` | /node_modules/i | 忽略的文件路径。参考：[exclude](#exclude)
| disable | `boolean` | false | 关闭插件

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
- 如果值是函数，你可以使用排除函数返回true，文件将被忽略
  - 回调将传递文件路径作为一个参数，它应该返回一个boolean
  - `function (file) { return file.includes('exclude') }`

## ✨ 关于新特性

### ⚙️ 在css中，动态设置插件选项

#### 当前文件禁用插件
```css
/* pxtorem?disabled=true */
.rule {
  font-size: 15px; // 15px
}
```

#### 设置rootValue
```css
/* pxtorem?rootValue=32 */
.rule {
  font-size: 30px; // 0.9375rem
}
```

🌰 以上只是简单的栗子，你可以在css文件中设置任意 `postcss-pxtorem` 支持的选项

聪明的你，或许已经看出来了，`/* pxtorem?disabled=true */` 很像浏览器url？😼
没错。关于规范，只需参考：[query-string](https://github.com/sindresorhus/query-string)

#### 例子

```css
/* postcss-pxtorem?disable=false&rootValue=32&propList[]=*&replace=false&selectorBlackList[]=/some-class/i */
```

### 在css中，忽略某一行
```css
.rule {
  /* pxtorem-disable-next-line */
  font-size: 15px; // 15px
}
```

> 如果这个仓库帮了你的忙，请不吝给个star，谢谢！😎

## ❤️ 感谢

[postcss-pxtorem](https://github.com/cuth/postcss-pxtorem)

[@tcstory/postcss-px-to-viewport](https://github.com/tcstory/postcss-px-to-viewport)

## 👀 相关

A CSS post-processor that converts px to viewport: [postcss-pxtoviewport](https://github.com/hemengke1997/postcss-pxtoviewport)
