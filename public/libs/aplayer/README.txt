请从 jsDelivr 或 npm 官方包下载 APlayer v1.10.1 的以下两个文件，放到当前目录（public/libs/aplayer/）：

1. APlayer.min.js
   下载地址：https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js

2. APlayer.min.css
   下载地址：https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css

（或自己用 `npm pack aplayer@1.10.1` 下载解压后取 dist/ 目录中的同名文件）

放入后目录结构应为：
  public/libs/aplayer/APlayer.min.js
  public/libs/aplayer/APlayer.min.css

这样 Vite dev 服务器会以 /libs/aplayer/* 的路径提供本地资源，
music 组件会从项目本地加载 APlayer，完全不依赖外部 CDN。
