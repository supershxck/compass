import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => ({
  base: mode === 'standalone' ? './' : '/',
  plugins: [
    react(),
    viteSingleFile({
      // One HTML file. WASM inlining is the main constraint.
    }),
  ],
  build: {
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
}))
