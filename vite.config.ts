import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-pdf',
              test: /pdf-lib/,
              priority: 20,
            },
            {
              name: 'vendor-motion',
              test: /framer-motion|motion/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})
