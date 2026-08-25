# 网易云音乐 / Meting 解析配置

当前博客默认用公共 Meting 服务解析歌单 → `https://api.i-meto.com/meting/api`。
如果你本地播放时 APlayer 控制台出现：

```
NotSupportedError: The element has no supported sources.
NotSupportedError: Failed to load because no supported source was found.
```

说明 Meting 返回的网易云音频 `url`（一般是 `http(s)://music.163.com/song/media/outer/url?id=xxx.mp3`）被网易云 **403 防盗链 / 重定向到版权页 / CORS 拦截**，浏览器 `<audio>` 拿到后拿不到真实 mp3 流，才会报"无可用源"。

## 解决方案（按推荐顺序）

### 方案 1：换成 QQ 音乐歌单（最省心，99% 能直接播放）

在 `header-bg/index.vue` 改 `<Music>` props：
```vue
<Music server="tencent" type="playlist" playlist-id="QQ音乐歌单ID" theme="#ff758c" />
```
QQ 音乐的 Meting 解析出来的直链 `music.128.net` 基本没有防盗链。
获取 ID：打开 y.qq.com → 进入歌单 → URL 中 `id=` 后面的那串数字。

### 方案 2：自建一个 Meting 服务（功能完整、稳定可控）

参考：https://github.com/injahow/meting-api
1. 部署到任意 Vercel / VPS / 自己博客后端
2. 部署完得到你自己的地址，如 `https://your-api.example.com/api`
3. 在 `<Music>` 里加 prop：
   ```vue
   <Music api="https://your-api.example.com/api" server="netease" type="playlist" playlist-id="你的ID" />
   ```
自建服务能正确处理网易云的 302/重定向，返回可直接播放的直链。

### 方案 3：用本地 mp3（完全离线，最稳）

1. 把想播放的 `.mp3` 放到 `public/musics/`（没有就创建），顺便放一张封面 `cover.jpg`
2. 在 `<Music>` 上新增自定义 prop 或直接改组件 `fetchPlaylist`，返回本地文件列表（推荐在组件里加一个 `customAudio` prop）：
   ```vue
   <Music
     :custom-audio="[
       { title: '曲1', author: '作者1', url: '/musics/1.mp3', pic: '/musics/cover.jpg' },
       { title: '曲2', author: '作者2', url: '/musics/2.mp3', pic: '/musics/cover.jpg' },
     ]"
   />
   ```

### 方案 4：换公共解析源（临时，随时会挂）

已在组件里内置 `api` prop，换成其它公共 Meting 实例试试：

```vue
<!-- 备选 1 -->
<Music api="https://meting.fczbl.vip/api" server="netease" type="playlist" playlist-id="..." />
<!-- 备选 2 -->
<Music api="https://api.injahow.cn/meting/" server="netease" type="playlist" playlist-id="..." />
```

---

## 快速排查步骤

打开 DevTools → Network → 刷新页面 → 过滤 `Fetch/XHR`：
1. 看 `api.i-meto.com/meting/api?...` 的响应是不是一个 `[{title, author, url, pic}]` 数组
2. 把其中一条的 `url` 直接粘到新标签页打开：

   - 若出现 **403 / 跳转到了一个版权 HTML 页** → 就是防盗链，用方案 1 / 2 / 3 解决
   - 若能直接开始下载/播放 mp3 → 不是防盗链问题，检查 URL 是否带 `http://` 却在 `https://` 页面加载（混合内容被浏览器拦截），换成 `https://` 即可
3. Network 再过滤 `media`：点 `<audio>` 请求的那条，看 Response 的 Content-Type 必须是 `audio/mpeg` 或 `audio/*`；如果是 `text/html` 就一定是被跳转了。
