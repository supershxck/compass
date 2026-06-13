import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({
      // We want one big HTML. The WASM will be the main challenge.
    }),
  ],
  build: {
    // Helps with single-file by reducing chunking
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // try to inline as much as possible
  },
})
