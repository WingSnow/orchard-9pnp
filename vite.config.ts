import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import externalGlobals from 'rollup-plugin-external-globals'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/orchard-9pnp/',
  plugins: [
    vue(),
    visualizer(),
  ],
  build: {
    rollupOptions: {
      plugins: [
        externalGlobals({
          vue: "Vue",
          pinia: "Pinia",
          gsap: "gsap",
          lodash: "_",
        })
      ]
    }
  }
})
