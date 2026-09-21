import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'
import type { Plugin } from 'vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'


const COMPRESS_EXT = /\.(js|mjs|css|html|json|svg|xml|txt|md)$/
const COMPRESS_THRESHOLD = 1024

function compressionPlugin(): Plugin {
  return {
    name: 'knockfish:compression',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      let gzTotal = 0
      let brTotal = 0
      let rawTotal = 0

      for (const [fileName, output] of Object.entries(bundle)) {
        if (!COMPRESS_EXT.test(fileName)) continue
        const source = output.type === 'chunk' ? output.code : output.source
        if (typeof source !== 'string' && !Buffer.isBuffer(source)) continue

        const buf = Buffer.isBuffer(source) ? source : Buffer.from(source, 'utf8')
        if (buf.length < COMPRESS_THRESHOLD) continue

        const gz = gzipSync(buf, { level: 9 })
        const br = brotliCompressSync(buf, {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 11,
            [constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
          },
        })

        this.emitFile({ type: 'asset', fileName: `${fileName}.gz`, source: gz })
        this.emitFile({ type: 'asset', fileName: `${fileName}.br`, source: br })

        rawTotal += buf.length
        gzTotal += gz.length
        brTotal += br.length
      }

      if (rawTotal > 0) {
        const kb = (n: number) => `${(n / 1024).toFixed(1)}kb`
        console.log(
          `\n[compression] 已压缩 ${kb(rawTotal)} -> gzip ${kb(gzTotal)} / brotli ${kb(brTotal)}`
        )
      }
    },
  }
}

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
      // 图标编译期按需：模板里写 <i-mdi-xxx /> 即自动引入对应图标组件，
      // 产物只包含实际用到的图标，且随所在路由 chunk 分包（不再由脚本裁剪）
      Icons({
        compiler: 'vue3',
        autoInstall: false, // @iconify-json/mdi 已安装，禁止构建时联网补装
        scale: 1, // 默认尺寸 1em，跟随父级 font-size
        defaultClass: 'svg-icon'
      }),
      Components({
        deep: true,
        extensions: ['vue'],
        dirs: ['src/components', 'src/layouts'],
        resolvers: [
          ElementPlusResolver(),
          // 只解析 mdi 集合，避免误匹配其他前缀的组件名
          IconsResolver({ enabledCollections: ['mdi'] })
        ],
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
      compressionPlugin()
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
          join_vars: true,
          reduce_vars: true,
          dead_code: true
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            // Vue 生态核心：单独成块，版本稳定，利于长期缓存
            if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/@vueuse')) {
              return 'vue'
            }
            if (id.includes('node_modules/element-plus')) {
              return 'elementPlus'
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