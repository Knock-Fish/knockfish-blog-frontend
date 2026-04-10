let articleData = [
    {
        articleId: 25,
        title: 'Electron 桌面应用开发',
        cover: 'http://localhost:3306/src/assets/imgs/cover.webp',
        description: '使用 Web 技术构建跨平台桌面应用，主进程与渲染进程通信，打包发布。',
        status: 'PUBLISH',
        content: '<h1>介绍</h1><h2>快速开始</h2><p>Electron Forge 脚手架，进程模型。</p><h2>进程通信</h2><p>ipcMain、ipcRenderer、preload 脚本。</p><h2>原生能力</h2><p>系统托盘、菜单、文件读写、剪贴板。</p><h1>打包发布</h1><p>electron-builder 配置，代码签名，自动更新。</p><pre class="line-numbers" v-pre><code class="language-javascript">const message="Hello,highlight.js!"; console.log(message);</code></pre><h2>介绍2</h2><h3>介绍2</h3><h4>介绍2</h4><h5>介绍2</h5><h6>介绍2</h6>',
        publishTime: '2026-04-02 14:30:00',
        updatedTime: null,
        tags: [
            { tagId: 37, tagName: "Electron", color: "#47848F" },
            { tagId: 4, tagName: "JavaScript", color: "#F6D45A" }
        ]
    },
    {
        articleId: 24,
        title: 'Next.js 全栈开发实战',
        cover: 'http://localhost:3306/src/assets/imgs/cover.webp',
        description: 'SSR、SSG、ISR、API Routes、App Router 新特性，构建 SEO 友好的 React 应用。',
        status: 'PUBLISH',
        content: '<h2>路由系统</h2><p>App Router 与 Pages Router 对比，layout、loading、error 组件。</p><h2>数据获取</h2><p>fetch 扩展、缓存与 revalidate 配置。</p><h2>服务端组件与客户端组件</h2><p>组件渲染策略选择。</p><h2>部署优化</h2><p>Image 组件、字体优化、中间件。</p>',
        publishTime: '2026-03-05 08:30:00',
        updatedTime: '2026-03-07 16:20:00',
        tags: [
            { tagId: 27, tagName: "Next.js", color: "#000000" },
            { tagId: 9, tagName: "React", color: "#61DAFB" }
        ]
    },
    {
        articleId: 23,
        title: 'TypeScript 编程',
        cover: 'https://picsum.photos/id/9/300/200',
        description: '掌握泛型、条件类型、映射类型、模板字面量类型，打造类型安全的代码库。',
        status: 'PUBLISH',
        content: '<h2>泛型深入</h2><p>keyof、typeof、索引访问类型。</p><h2>条件类型</h2><p>extends、infer、分布式条件类型。</p><h2>映射类型与修饰符</h2><p>Partial、Required、Readonly、Pick、Record。</p><h2>模板字面量类型</h2><p>字符串拼接类型推导。</p>',
        publishTime: '2026-02-18 13:30:00',
        updatedTime: null,
        tags: [
            { tagId: 16, tagName: "TypeScript", color: "#3178C6" },
            { tagId: 10, tagName: "前端", color: "#F7DF1E" }
        ]
    },
    {
        articleId: 22,
        title: 'Vue3 源码解析',
        cover: 'https://picsum.photos/id/7/300/200',
        description: '深入Vue3响应式原理、编译器优化、运行时模块设计，提升Vue进阶能力。',
        status: 'PUBLISH',
        content: '<h2>响应式系统</h2><p>Proxy与Reflect，effect依赖收集。</p><h2>虚拟DOM优化</h2><p>静态提升、PatchFlags、Block树。</p><h2>编译器</h2><p>模板解析、transform、代码生成。</p><h2>组件渲染流程</h2><p>setup、render、mount、update。</p>',
        publishTime: '2026-01-10 18:45:00',
        updatedTime: '2026-01-12 12:20:00',
        tags: [
            { tagId: 13, tagName: "Vue3", color: "#42B883" },
            { tagId: 14, tagName: "源码", color: "#A855F7" }
        ]
    },
    {
        articleId: 21,
        title: 'Java基础教程',
        cover: 'https://picsum.photos/id/1/300/200',
        description: '从零开始学习Java语言，掌握面向对象编程核心概念，涵盖数据类型、流程控制、类与对象等基础知识。',
        content: '<h2>Java简介</h2><p>Java是一种面向对象的编程语言，由Sun Microsystems公司于1995年推出。</p><h2>环境搭建</h2><p>安装JDK，配置环境变量，编写第一个Hello World程序。</p><h2>基础语法</h2><p>变量、数据类型、运算符、条件语句、循环语句。</p><h2>面向对象</h2><p>类与对象、继承、多态、封装、接口、抽象类。</p>',
        status: 'PUBLISH',
        publishTime: '2025-11-16 20:30:00',
        updatedTime: '2025-11-18 10:15:00',
        tags: [
            { tagId: 1, tagName: "Java", color: "#5AB8F6" }
        ]
    },
    {
        articleId: 20,
        title: 'Web基础教程',
        cover: 'https://picsum.photos/id/2/300/200',
        description: '全面了解Web开发技术栈，从HTML、CSS到JavaScript，构建现代化网页应用。',
        status: 'PUBLISH',
        content: '<h2>HTML基础</h2><p>HTML是网页的骨架，学习常用标签、表单、语义化标签等。</p><h2>CSS样式</h2><p>选择器、盒模型、Flex布局、Grid布局、响应式设计。</p><h2>JavaScript核心</h2><p>变量、函数、DOM操作、事件处理、异步编程。</p><h2>综合案例</h2><p>打造一个完整的个人博客页面。</p>',
        publishTime: '2025-11-12 15:21:00',
        updatedTime: '2025-11-14 09:30:00',
        tags: [
            { tagId: 2, tagName: "HTML", color: "#2167AC" },
            { tagId: 3, tagName: "CSS", color: "#51ff62" },
            { tagId: 4, tagName: "JavaScript", color: "#F6D45A" }
        ]
    },
    {
        articleId: 19,
        title: '前端工程化实战',
        cover: 'https://picsum.photos/id/3/300/200',
        description: '深入浅出Webpack、Vite、ESLint等工具，提升前端开发效率与代码质量。',
        status: 'PUBLISH',
        content: '<h2>为什么需要工程化</h2><p>解决模块化、打包、代码检查、自动化构建等问题。</p><h2>Webpack配置</h2><p>entry、output、loader、plugin、devServer。</p><h2>Vite快速入门</h2><p>更快的开发服务器，基于ESM的按需编译。</p><h2>代码规范</h2><p>ESLint + Prettier + Husky 保障团队协作一致性。</p>',
        publishTime: '2025-11-10 08:00:00',
        updatedTime: null,
        tags: [
            { tagId: 5, tagName: "Webpack", color: "#1E90FF" },
            { tagId: 6, tagName: "Vite", color: "#FFD700" },
        ]
    },
    {
        articleId: 18,
        title: 'GraphQL 从入门到实践',
        cover: 'https://picsum.photos/id/23/300/200',
        description: '对比 RESTful，Schema 定义、Resolver 编写、客户端查询、Apollo 生态。',
        status: 'PUBLISH',
        content: '<h2>核心概念</h2><p>Query、Mutation、Subscription、Type。</p><h2>服务端实现</h2><p>Apollo Server、GraphQL-Java。</p><h2>客户端查询</h2><p>Apollo Client、React Hooks 集成。</p><h2>进阶优化</h2><p>DataLoader 解决 N+1 查询，持久化查询。</p>',
        publishTime: '2025-08-29 09:45:00',
        updatedTime: '2025-08-31 14:10:00',
        tags: [
            { tagId: 34, tagName: "GraphQL", color: "#E10098" },
            { tagId: 10, tagName: "前端", color: "#F7DF1E" }
        ]
    },
    {
        articleId: 17,
        title: 'WebSocket 实时通信入门',
        cover: 'https://picsum.photos/id/19/300/200',
        description: 'WebSocket 协议原理、前后端实现、心跳机制、断线重连，搭建在线聊天室。',
        status: 'PUBLISH',
        content: '<h2>WebSocket 与 HTTP 区别</h2><p>全双工通信，持久连接。</p><h2>前端 API</h2><p>WebSocket 对象、事件、方法。</p><h2>后端实现</h2><p>Spring Boot + WebSocket，Socket.IO。</p><h2>进阶话题</h2><p>消息广播、房间管理、认证授权。</p>',
        publishTime: '2025-06-17 16:45:00',
        updatedTime: '2025-06-19 10:15:00',
        tags: [
            { tagId: 30, tagName: "WebSocket", color: "#E91E63" },
            { tagId: 10, tagName: "前端", color: "#F7DF1E" }
        ]
    },
    {
        articleId: 16,
        title: 'Redis 核心原理与实战',
        cover: 'https://picsum.photos/id/15/300/200',
        description: '深入 Redis 数据类型、持久化机制、主从复制、哨兵模式、集群方案。',
        status: 'PUBLISH',
        content: '<h2>五大数据类型</h2><p>String、Hash、List、Set、Sorted Set 底层实现。</p><h2>持久化</h2><p>RDB 快照、AOF 日志、混合持久化。</p><h2>高可用架构</h2><p>主从复制、哨兵自动故障转移、Cluster 分片。</p><h2>缓存问题</h2><p>穿透、击穿、雪崩解决方案。</p>',
        publishTime: '2025-03-22 15:10:00',
        updatedTime: '2025-03-24 11:30:00',
        tags: [
            { tagId: 25, tagName: "Redis", color: "#DC382D" },
            { tagId: 26, tagName: "缓存", color: "#FFA500" }
        ]
    },
    {
        articleId: 15,
        title: 'Kubernetes 入门到实践',
        cover: 'https://picsum.photos/id/20/300/200',
        description: 'Pod、Deployment、Service、Ingress、ConfigMap、PV/PVC，掌握容器编排核心概念。',
        status: 'PUBLISH',
        content: '<h2>核心概念</h2><p>Pod 最小部署单元，控制器管理。</p><h2>服务发现与负载均衡</h2><p>ClusterIP、NodePort、LoadBalancer、Ingress。</p><h2>配置与存储</h2><p>ConfigMap、Secret、持久化存储。</p><h2>调度与扩缩容</h2><p>亲和性、污点容忍、HPA 自动伸缩。</p>',
        publishTime: '2025-01-25 14:00:00',
        updatedTime: '2025-01-27 11:45:00',
        tags: [
            { tagId: 31, tagName: "K8s", color: "#326CE5" },
            { tagId: 12, tagName: "DevOps", color: "#E95420" }
        ]
    },
    {
        articleId: 14,
        title: '数据结构与算法',
        cover: 'https://picsum.photos/id/24/300/200',
        description: '数组、链表、树、图、动态规划、回溯算法详解。',
        status: 'PUBLISH',
        content: '<h2>线性结构</h2><p>数组、链表、栈、队列。</p><h2>树与图</h2><p>二叉树遍历、BST、堆、DFS/BFS、最短路径。</p><h2>算法思想</h2><p>递归、分治、贪心、动态规划、回溯。</p><h2>排序与查找</h2><p>快排、归并、堆排、二分查找。</p>',
        publishTime: '2024-12-10 20:00:00',
        updatedTime: '2024-12-12 12:30:00',
        tags: [
            { tagId: 35, tagName: "算法", color: "#2C3E50" },
            { tagId: 36, tagName: "数据结构", color: "#8E44AD" }
        ]
    },
    {
        articleId: 13,
        title: '机器学习基础：线性回归与逻辑回归',
        cover: 'https://picsum.photos/id/13/300/200',
        description: '从数学原理到手写实现，理解回归算法的核心思想与评估方法。',
        status: 'PUBLISH',
        content: '<h2>线性回归</h2><p>最小二乘法、梯度下降、R² 评估。</p><h2>逻辑回归</h2><p>Sigmoid 函数、交叉熵损失、决策边界。</p><h2>正则化</h2><p>L1、L2 防止过拟合。</p><h2>实战案例</h2><p>房价预测与二分类问题。</p>',
        publishTime: '2024-11-03 09:00:00',
        updatedTime: '2024-11-05 14:20:00',
        tags: [
            { tagId: 22, tagName: "机器学习", color: "#FF6B6B" },
            { tagId: 7, tagName: "Python", color: "#3776AB" }
        ]
    },
    {
        articleId: 12,
        title: 'ES6+ 核心特性完全指南',
        cover: 'https://picsum.photos/id/21/300/200',
        description: '箭头函数、解构赋值、Promise、async/await、模块化、Proxy、Reflect 全覆盖。',
        status: 'PUBLISH',
        content: '<h2>变量声明</h2><p>let、const 与块级作用域。</p><h2>函数增强</h2><p>箭头函数、默认参数、rest 参数。</p><h2>异步编程</h2><p>Promise、async/await、事件循环。</p><h2>新数据结构</h2><p>Map、Set、Symbol、WeakMap。</p>',
        publishTime: '2024-09-09 12:30:00',
        updatedTime: '2024-09-11 08:00:00',
        tags: [
            { tagId: 4, tagName: "JavaScript", color: "#F6D45A" },
            { tagId: 32, tagName: "ES6", color: "#F0DB4F" }
        ]
    },
    {
        articleId: 11,
        title: 'Python数据分析入门',
        cover: 'https://picsum.photos/id/4/300/200',
        description: '使用Pandas、NumPy进行数据清洗、分析和可视化，快速入门数据科学领域。',
        status: 'PUBLISH',
        content: '<h2>NumPy基础</h2><p>数组创建、索引、切片、广播机制。</p><h2>Pandas核心</h2><p>Series、DataFrame、缺失值处理、数据聚合与分组。</p><h2>Matplotlib绘图</h2><p>折线图、柱状图、散点图、子图绘制。</p><h2>实战案例</h2><p>电商销售数据分析。</p>',
        publishTime: '2024-08-05 14:20:00',
        updatedTime: '2024-08-07 11:45:00',
        tags: [
            { tagId: 7, tagName: "Python", color: "#3776AB" },
            { tagId: 8, tagName: "数据分析", color: "#2CA02C" }
        ]
    },
    {
        articleId: 10,
        title: '设计模式：从入门到精通',
        cover: 'https://picsum.photos/id/17/300/200',
        description: '23 种设计模式详解，包含单例、工厂、策略、观察者等，结合实际代码示例。',
        status: 'PUBLISH',
        content: '<h2>创建型模式</h2><p>单例、工厂方法、抽象工厂、建造者、原型。</p><h2>结构型模式</h2><p>适配器、装饰器、代理、外观、桥接。</p><h2>行为型模式</h2><p>策略、观察者、模板方法、责任链、命令。</p><h2>实际应用场景</h2><p>Spring 框架中的设计模式分析。</p>',
        publishTime: '2024-06-28 19:00:00',
        updatedTime: null,
        tags: [
            { tagId: 28, tagName: "设计模式", color: "#9B59B6" },
            { tagId: 1, tagName: "Java", color: "#5AB8F6" }
        ]
    },
    {
        articleId: 9,
        title: 'React 18 新特性详解',
        cover: 'https://picsum.photos/id/5/300/200',
        description: '探索React 18中的并发渲染、自动批处理、Suspense、useTransition等全新特性。',
        status: 'PUBLISH',
        content: '<h2>并发渲染</h2><p>时间切片，可中断渲染。</p><h2>自动批处理</h2><p>更少渲染次数，提升性能。</p><h2>useTransition与useDeferredValue</h2><p>区分紧急与非紧急更新。</p><h2>Suspense增强</h2><p>支持服务端组件与数据获取。</p>',
        publishTime: '2024-05-20 09:15:00',
        updatedTime: '2024-05-22 16:30:00',
        tags: [
            { tagId: 9, tagName: "React", color: "#61DAFB" },
            { tagId: 10, tagName: "前端", color: "#F7DF1E" }
        ]
    },
    {
        articleId: 8,
        title: 'Flutter 跨平台开发入门',
        cover: 'https://picsum.photos/id/12/300/200',
        description: '使用 Flutter 构建 iOS 和 Android 应用，掌握 Dart 语言、Widget 体系、状态管理。',
        status: 'PUBLISH',
        content: '<h2>Dart 基础</h2><p>空安全、异步、扩展方法。</p><h2>Widget 体系</h2><p>StatelessWidget、StatefulWidget、布局组件。</p><h2>状态管理</h2><p>Provider、Riverpod、Bloc 对比。</p><h2>原生交互</h2><p>Platform Channel 调用原生功能。</p>',
        publishTime: '2024-02-14 10:30:00',
        updatedTime: '2024-02-16 15:45:00',
        tags: [
            { tagId: 20, tagName: "Flutter", color: "#02569B" },
            { tagId: 21, tagName: "Dart", color: "#00B4AB" }
        ]
    },
    {
        articleId: 7,
        title: 'Docker容器化部署实践',
        cover: 'https://picsum.photos/id/6/300/200',
        description: '从零学习Docker，镜像构建、容器管理、Docker Compose编排，实现应用快速部署。',
        status: 'PUBLISH',
        content: '<h2>Docker基础</h2><p>镜像、容器、仓库核心概念。</p><h2>Dockerfile编写</h2><p>常用指令，优化构建缓存。</p><h2>数据卷与网络</h2><p>持久化存储，自定义网络。</p><h2>Docker Compose</h2><p>多容器应用编排。</p>',
        publishTime: '2023-12-01 10:00:00',
        updatedTime: null,
        tags: [
            { tagId: 11, tagName: "Docker", color: "#2496ED" },
            { tagId: 12, tagName: "DevOps", color: "#E95420" }
        ]
    },
    {
        articleId: 6,
        title: 'MySQL 性能优化指南',
        cover: 'https://picsum.photos/id/10/300/200',
        description: '索引优化、SQL重写、慢查询分析、数据库参数调优，提升数据库响应速度。',
        status: 'PUBLISH',
        content: '<h2>索引原理</h2><p>B+树结构，聚集索引与二级索引，索引下推。</p><h2>EXPLAIN详解</h2><p>type、key、rows、Extra字段含义。</p><h2>SQL改写技巧</h2><p>避免索引失效，分页优化，join优化。</p><h2>慢查询日志</h2><p>开启与分析方法，pt-query-digest工具。</p>',
        publishTime: '2023-10-25 16:00:00',
        updatedTime: '2023-10-27 14:30:00',
        tags: [
            { tagId: 17, tagName: "MySQL", color: "#4479A1" },
            { tagId: 18, tagName: "性能优化", color: "#F39C12" }
        ]
    },
    {
        articleId: 5,
        title: 'Spring Boot 微服务实战',
        cover: 'https://picsum.photos/id/8/300/200',
        description: 'Spring Boot整合MyBatis、Redis、RabbitMQ，搭建高可用微服务架构。',
        status: 'PUBLISH',
        content: '<h2>快速搭建Spring Boot项目</h2><p>starter依赖，自动配置原理。</p><h2>数据访问层</h2><p>MyBatis Plus，多数据源配置。</p><h2>缓存与消息队列</h2><p>Redis缓存，RabbitMQ异步处理。</p><h2>微服务治理</h2><p>Nacos注册中心，Feign远程调用。</p>',
        publishTime: '2023-09-15 22:10:00',
        updatedTime: '2023-09-18 08:05:00',
        tags: [
            { tagId: 1, tagName: "Java", color: "#5AB8F6" },
            { tagId: 15, tagName: "Spring Boot", color: "#6DB33F" }
        ]
    },
    {
        articleId: 4,
        title: 'JVM 内存模型与性能调优',
        cover: 'https://picsum.photos/id/18/300/200',
        description: '深入 JVM 内存结构、垃圾回收算法、GC 日志分析、常用调优参数。',
        status: 'PUBLISH',
        content: '<h2>运行时数据区</h2><p>堆、栈、方法区、程序计数器。</p><h2>垃圾回收</h2><p>可达性分析、引用类型、GC 算法（标记清除、复制、标记整理）。</p><h2>常用 GC 实现</h2><p>Serial、Parallel、CMS、G1、ZGC。</p><h2>调优实战</h2><p>JVM 参数配置、OOM 排查、MAT 分析堆转储。</p>',
        publishTime: '2023-08-12 11:00:00',
        updatedTime: '2023-08-14 09:30:00',
        tags: [
            { tagId: 1, tagName: "Java", color: "#5AB8F6" },
            { tagId: 29, tagName: "JVM", color: "#E67E22" }
        ]
    },
    {
        articleId: 3,
        title: 'Git 协作开发最佳实践',
        cover: 'https://picsum.photos/id/11/300/200',
        description: '掌握 Git 工作流、分支管理、冲突解决、Rebase 与 Merge 的选择，提升团队协作效率。',
        status: 'PUBLISH',
        content: '<h2>Git 基础回顾</h2><p>工作区、暂存区、版本库概念。</p><h2>分支策略</h2><p>Git Flow、GitHub Flow、GitLab Flow。</p><h2>冲突解决技巧</h2><p>merge 冲突、rebase 冲突处理。</p><h2>交互式 Rebase</h2><p>合并 commit、修改历史消息。</p>',
        publishTime: '2023-07-08 11:20:00',
        updatedTime: '2023-07-10 09:15:00',
        tags: [
            { tagId: 19, tagName: "Git", color: "#F05032" },
            { tagId: 12, tagName: "DevOps", color: "#E95420" }
        ]
    },
    {
        articleId: 2,
        title: 'Nginx 高性能配置实战',
        cover: 'https://picsum.photos/id/14/300/200',
        description: '反向代理、负载均衡、动静分离、HTTPS 配置、限流熔断，打造高可用网关。',
        status: 'PUBLISH',
        content: '<h2>安装与基础配置</h2><p>配置文件结构、location 匹配规则。</p><h2>反向代理与负载均衡</h2><p>proxy_pass、upstream 多种调度算法。</p><h2>动静分离</h2><p>静态资源缓存、Gzip 压缩。</p><h2>安全配置</h2><p>限流、防 CC 攻击、SSL 证书配置。</p>',
        publishTime: '2023-05-17 13:45:00',
        updatedTime: '2023-05-19 17:00:00',
        tags: [
            { tagId: 23, tagName: "Nginx", color: "#009639" },
            { tagId: 24, tagName: "运维", color: "#4A5568" }
        ]
    },
    {
        articleId: 1,
        title: 'Linux 常用命令与 Shell 编程',
        cover: 'https://picsum.photos/id/22/300/200',
        description: '文件处理、进程管理、文本三剑客（grep/sed/awk）、Shell 脚本编写。',
        status: 'PUBLISH',
        content: '<h2>基础命令</h2><p>ls、cd、cp、mv、rm、find、grep。</p><h2>权限与进程</h2><p>chmod、ps、top、kill、systemctl。</p><h2>文本处理</h2><p>sed 流编辑器、awk 编程语言。</p><h2>Shell 脚本</h2><p>变量、循环、条件判断、函数。</p>',
        publishTime: '2023-04-03 10:15:00',
        updatedTime: '2023-04-05 16:30:00',
        tags: [
            { tagId: 33, tagName: "Linux", color: "#FCC624" },
            { tagId: 24, tagName: "运维", color: "#4A5568" }
        ]
    }
]
import { parseUrlParams } from "../utils/parseUrlParams"
export default {
    /**
     * 模拟分页数据，实际开发由后端处理
     */
    getAllArticleWithTags: (options: Record<string, any>) => {
        const params = parseUrlParams(options.url)
        const pageNum = params.pageNum || 1
        const pageSize = params.pageSize || 10
        let filteredData = [...articleData]
        // 根据 title 搜索过滤
        if (params.keyword.title) {
            const searchTitle = params.keyword.title.toLowerCase()
            filteredData = filteredData.filter(item =>
                item.title?.toLowerCase().includes(searchTitle)
            )
        }
        // 分页
        const start = (pageNum - 1) * pageSize
        const end = pageNum * pageSize
        let articleList = filteredData.slice(start, end)
        return {
            code: 200,
            message: "请求成功",
            data: {
                current: pageNum,
                size: pageSize,
                total: filteredData.length,
                list: articleList
            }
        }
    },
    getArticleTimeline: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                list: articleData.map(item => ({
                    articleId: item.articleId,
                    title: item.title,
                    publishTime: item.publishTime,
                    tags: item.tags
                }))
            }
        }
    },
    getArticleById: (option: number) => {
        let article = articleData.find(item => item.articleId == option)
        return {
            code: 200,
            message: "请求成功",
            data: article
        }
    }
}