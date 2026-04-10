import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Icons from "unplugin-icons/vite";
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { prismjsPlugin } from "vite-plugin-prismjs"
// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  // 获取.env文件里定义的环境变量
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL } = env

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
    plugins: [
      vue(),
      Icons({}),
      prismjsPlugin({
        languages: 'all',
        plugins: ['line-numbers','show-language','copy-to-clipboard','inline-color'],
        theme: 'tomorrow',
        css: true,
      }),
      // 自动导入 components 下面的组件，无需 import 引入
      Components({
        deep: true,
        extensions: ['vue'],
        dirs: ['src/components', 'src/layouts'], // 自动导入的组件目录
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts' // 指定类型声明文件的路径
      }),
      AutoImport({
        imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          // 这里先设置成true然后pnpm dev 运行之后会生成 .auto-import.json 文件之后，在改为false
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
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
    }
  })
}
function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}