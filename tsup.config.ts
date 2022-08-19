import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  minify: !option.watch,
  sourcemap: true,
  esbuildOptions: (options) => {
    options.footer = {
      js: 'module.exports = module.exports.default;',
    }
  },
}))
