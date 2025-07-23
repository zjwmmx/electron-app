import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const commonAlias = {
  '@base': resolve('src/base'),
  '@core': resolve('src/core'),
  '@dicts': resolve('src/dicts')
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/react-renderer',
    resolve: {
      alias: {
        '@react-renderer': resolve('src/react-renderer/src'),
        ...commonAlias
      }
    },
    server: {
      port: 2222
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/react-renderer/index.html')
        }
      }
    }
  }
})
