import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'
import react from '@vitejs/plugin-react'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

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
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        ...commonAlias
      }
    },
    server: {
      port: 6666,
    },
    plugins: [
      vue(),
      vueJsxPlugin(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false // css in js
          })
        ]
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "sass:math";
          @import "src/renderer/src/assets/css/styles.scss";`
        }
      }
    }
  },
  'react-renderer': {
    root: 'src/react-renderer',
    resolve: {
      alias: {
        '@react-renderer': resolve('src/react-renderer/src'),
        ...commonAlias
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "sass:math";
          @import "styles/include/index.scss";`
        }
      }
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
