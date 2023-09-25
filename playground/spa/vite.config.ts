import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { injectScripts, publicTypescript } from 'vite-plugin-public-typescript'
import manifest from './public-typescript/manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    publicTypescript(),
    injectScripts([
      {
        injectTo: 'head-prepend',
        attrs: {
          src: manifest.flexible,
        },
      },
    ]),
  ],
})
