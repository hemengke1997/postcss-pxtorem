/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const timeout = process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './playground/test-utils'),
    },
  },
  test: {
    include: ['./playground/**/*.spec.[tj]s'],
    reporters: 'dot',
    coverage: {
      provider: undefined,
      reporter: ['text', 'clover', 'json'],
    },
    testTimeout: timeout,
    hookTimeout: timeout,
    setupFiles: ['./playground/vitestSetup.ts'],
    globalSetup: ['./playground/vitestGlobalSetup.ts'],
    server: {
      deps: {
        inline: ['vitest-e2e'],
        fallbackCJS: true,
      },
    },
  },
})
