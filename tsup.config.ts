import { type Options, defineConfig } from 'tsup'

const commonConfig = (option: Options): Options => ({
  entry: ['src/index.ts'],
  target: 'node16',
  dts: !option.watch,
  clean: true,
  minify: false,
  sourcemap: !!option.watch,
})

export const tsup = defineConfig((option) => [
  {
    format: ['esm'],
    ...commonConfig(option),
  },
  {
    noExternal: ['decode-uri-component', 'split-on-first'],
    format: ['cjs'],
    esbuildOptions: (options) => {
      // postcss plugin export default plugin config
      options.footer = {
        js: 'module.exports = module.exports.default;',
      }
    },
    ...commonConfig(option),
  },
])
