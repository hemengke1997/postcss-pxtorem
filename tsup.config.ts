import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  dts: !option.watch,
  clean: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: !!option.watch,
  esbuildOptions: (options) => {
    // postcss plugin export default plugin config
    if (options.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default;',
      }
    }
  },
}))
