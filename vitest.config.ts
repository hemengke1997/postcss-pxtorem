import { defineConfig } from 'vitest/config'

// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  test: {
    onConsoleLog(log) {
      if (log.includes('Generated an empty chunk')) {
        return false
      }
      return undefined
    },
  },
})
