import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import Icons from "unplugin-icons/vite";
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import viteCompression from 'vite-plugin-compression'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL } = env
  const isProduction = mode === 'production'

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: parseInt(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      host: true
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@vueuse/core',
        'md-editor-v3'
      ],
    },
    plugins: [
      vue(),
      vueDevTools(),
      Icons({}),
      Components({
        deep: true,
        extensions: ['vue'],
        dirs: ['src/components', 'src/layouts'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts'
      }),
      AutoImport({
        imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
      viteCompression({
        verbose: true,
        disable: false,
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
      }),
      viteCompression({
        verbose: true,
        disable: false,
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false
      })
    ],
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@styles/variables.scss" as *; @use "@styles/mixin.scss" as *;`
        }
      }
    },
    resolve: {
      alias: {
        "@": resolvePath("src"),
        "@views": resolvePath("src/views"),
        "@comps": resolvePath("src/components"),
        "@imgs": resolvePath("src/assets/imgs"),
        "@icons": resolvePath("src/assets/icons"),
        "@utils": resolvePath("src/utils"),
        "@plugins": resolvePath("src/plugins"),
        "@styles": resolvePath("src/assets/styles"),
        "@fonts": resolvePath("src/assets/fonts"),
        "@api": resolvePath("src/api")
      }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: isProduction ? false : 'inline',
      minify: isProduction ? 'terser' : 'esbuild',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          join_vars: true, // 合并连续的变量声明，减少代码行数
          reduce_vars: true,  // 削减多余变量
          dead_code: true // 移除无法访问的代码（如 if(false)）
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vueuse')) {
              return 'vue'
            }
            if (id.includes('node_modules/element-plus')) {
              return 'elementPlus'
            }
            if (id.includes('node_modules/md-editor-v3')) {
              return 'mdEditor'
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true
    }
  })
}

function resolvePath(paths: string) {
  // 将相对路径转换为绝对路径（基于 import.meta.url）
  return fileURLToPath(new URL(paths, import.meta.url))
}