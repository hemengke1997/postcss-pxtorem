import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: !!option.watch,
  esbuildOptions: (options) => {
    if (options.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default;',
      }
    }
  },
}))
