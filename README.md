# knockfish-blog-frontend

![Vue](https://img.shields.io/badge/Vue-3.5-42b883)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.13-409EFF)
![Pinia](https://img.shields.io/badge/Pinia-3-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 相关项目

| 项目 | 说明 |
| --- | --- |
| [knockfish-blog-backend](https://github.com/Knock-Fish/knockfish-blog-backend) | Spring Boot 后端服务 |
| **knockfish-blog-frontend** | **Vue 3 前台展示端（当前仓库）** |
| [knockfish-blog-admin](https://github.com/Knock-Fish/knockfish-blog-admin) | Vue 3 后台管理端 |
| [knockfish-blog-agent](https://github.com/Knock-Fish/knockfish-blog-agent) | FastAPI + LangGraph AI Agent |

KnockFish 博客系统的前台展示端，面向访客提供文章浏览、归档检索、笔记查看、友链导航等功能。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 + TypeScript |
| 构建 | Vite 8 |
| UI | Element Plus 2.13 |
| 状态管理 | Pinia 3 + pinia-plugin-persistedstate |
| 路由 | Vue Router 5 |
| HTTP | axios |
| Markdown | md-editor-v3 + @vavt/v3-extension + @vavt/cm-extension |
| 代码高亮 | highlight.js + marked-highlight |
| 图标 | @iconify/vue + unplugin-icons（@iconify-json/mdi） |
| 动效 | animate.css + typed.js（打字机） |
| Live2D | pixi.js + pixi-live2d-display |
| Mock | mockjs |
| 自动导入 | unplugin-auto-import + unplugin-vue-components |
| 压缩 | vite-plugin-compression（gzip + brotli） |

## 功能模块

- 首页：文章列表、博主卡片、标签云、打字机介绍
- 文章详情：md-editor-v3 渲染、代码高亮、行号、标题锚点导航
- 归档：按标签 / 分类 / 笔记 / 代码片段多维度归档
- 友链：友链展示
- 导航：站点导航、分类导航
- 搜索：全文搜索
- 关于：博主信息
- 背景：波浪动画、页面背景图、Live2D 看板娘
- 图片懒加载：自定义指令 v-lazy

## 目录结构

```
src/
├── api/                # 接口请求封装（articleApi、noteApi、tagApi 等）
├── assets/
│   ├── imgs/           # 封面、头图、loading 图等静态图片
│   ├── styles/         # 全局样式（变量、mixin、markdown、暗色、移动端）
│   └── svg/            # SVG 图标
├── components/          # 业务组件
│   ├── background-image/
│   ├── live2d-widget/  # Live2D 看板娘
│   ├── menu/           # 侧边菜单
│   ├── search-bar/
│   └── svg-icon/
├── composables/        # 组合式函数（IntersectionObserver）
├── directives/         # 自定义指令（v-lazy 图片懒加载）
├── layouts/            # 布局（header-bar、footer-content、wave、page-bg）
├── mock/               # mock 数据
├── router/             # 路由（静态路由 + 守卫）
├── store/              # Pinia（cover、user）
├── types/              # 自动生成的类型声明
├── typings/            # api.d.ts 业务类型
├── utils/
│   ├── http/           # axios 封装 + 状态码
│   └── headingParser   # 标题解析（含 worker）
├── views/
│   ├── home/           # 首页
│   ├── article-detail/ # 文章详情
│   ├── archive/        # 归档
│   ├── link/           # 友链
│   ├── about/          # 关于
│   ├── navigation/     # 导航
│   ├── search-view/    # 搜索
│   └── index/          # 入口布局
├── App.vue
└── main.ts
```

## 快速开始

### 环境要求

- Node.js 20.19+ 或 22.12+
- pnpm（推荐）或 npm

### 配置

环境变量位于根目录：

- `.env`：通用配置（版本号、端口 5173、base 路径 `/knockfish-blog/`）
- `.env.development`：开发环境（`VITE_API_URL = http://localhost:8081`）
- `.env.production`：生产环境（`VITE_API_URL = /`，同源部署）

### 安装与运行

```sh
# 安装依赖
pnpm install
# 或 npm install

# 开发模式（默认端口 5173）
npm run dev

# 类型检查 + 生产构建
npm run build

# 预览生产构建
npm run preview
```

开发服务器已配置代理：`/api` → `http://localhost:8081`。

## 路径别名

```
@         → src
@views    → src/views
@comps    → src/components
@imgs     → src/assets/imgs
@styles   → src/assets/styles
@utils    → src/utils
@api      → src/api
```

## 构建特性

- 生产环境使用 terser 压缩，自动移除 `console` 与 `debugger`
- 分包策略：vue 全家桶、element-plus、md-editor-v3 各自独立 chunk
- 资源内联：小于 4KB 的资源自动转 base64
- 输出 gzip + brotli 双压缩
- CSS 按路由代码分割
