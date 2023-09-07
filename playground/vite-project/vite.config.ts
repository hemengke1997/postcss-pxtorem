import type { HtmlTagDescriptor } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { publicTypescript } from 'vite-plugin-public-typescript'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    publicTypescript(),
    {
      name: 'add-script',
      async transformIndexHtml(html) {
        const tags: HtmlTagDescriptor[] = [
          {
            tag: 'script',
            injectTo: 'head-prepend',
          },
        ]
        return {
          html,
          tags,
        }
      },
    },
  ],
})
