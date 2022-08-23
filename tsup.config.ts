import { defineConfig } from 'tsup'

export const tsup = defineConfig(() => ({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  minify: false,
  sourcemap: true,
  esbuildOptions: (options) => {
    if (options.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default;',
      }
    }
  },
}))
