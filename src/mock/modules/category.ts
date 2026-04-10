export default {
    getAllCategoryWithSites: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                list: [
                    {
                        categoryId: 1,
                        categoryName: "学习交流",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "哔哩哔哩",
                                url: "https://www.bilibili.com/",
                                ico: "https://www.bilibili.com/favicon.ico",
                                description: "现代年轻人高度聚集的文化社区和视频平台"
                            },
                            {
                                siteId: 2,
                                siteName: "Github",
                                url: "https://github.com/",
                                ico: "https://github.com/favicon.ico",
                                description: "开发者的代码托管平台，优质开源项目"
                            },
                            {
                                siteId: 3,
                                siteName: "Gitee",
                                url: "https://gitee.com/",
                                ico: "https://gitee.com/favicon.ico",
                                description: "基于 Git 的代码托管和研发协作平台"
                            },
                            {
                                siteId: 4,
                                siteName: "稀土掘金",
                                url: "https://juejin.cn/",
                                ico: "https://lf-web-assets.juejin.cn/obj/juejin-web/xitu_juejin_web/static/favicons/favicon-32x32.png",
                                description: "面向中文开发者的技术社区"
                            },
                            {
                                siteId: 5,
                                siteName: "博客园",
                                url: "https://www.cnblogs.com/",
                                ico: "https://www.cnblogs.com/favicon.ico",
                                description: "以纯净极客风格著称的中文技术社区"
                            },
                            {
                                siteId: 6,
                                siteName: "51CTO博客",
                                url: "https://blog.51cto.com/",
                                ico: "https://blog.51cto.com/favicon.ico",
                                description: "面向IT技术从业者的综合性博客平台"
                            },
                            {
                                siteId: 7,
                                siteName: "知乎",
                                url: "https://www.zhihu.com/",
                                ico: "https://www.zhihu.com/favicon.ico",
                                description: "以问答为核心的综合性中文知识社区"
                            },
                            {
                                siteId: 8,
                                siteName: "腾讯云开发者社区",
                                url: "https://cloud.tencent.com/developer",
                                ico: "https://cloud.tencent.com/favicon.ico",
                                description: "开发者的技术分享型社区"
                            },
                            {
                                siteId: 9,
                                siteName: "阿里云开发者社区",
                                url: "https://developer.aliyun.com/",
                                ico: "https://developer.aliyun.com/favicon.ico",
                                description: "一站式技术交流与学习平台"
                            },
                        ]
                    },
                    {
                        categoryId: 2,
                        categoryName: "开发工具",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "Visual Studio Code",
                                url: "https://code.visualstudio.com/",
                                ico: "https://code.visualstudio.com/favicon.ico",
                                description: "前端必备的开发编辑器"
                            },
                            {
                                siteId: 2,
                                siteName: "HBuilderX",
                                url: "https://hbuilderx.org/cn/",
                                ico: "https://hbuilderx.org/media/logo.png",
                                description: "前端和跨平台移动开发设计的轻量级集成开发环境"
                            },
                            {
                                siteId: 3,
                                siteName: "Navicat",
                                url: "https://www.navicat.com.cn/",
                                ico: "https://www.navicat.com/images/Navicat_16_Premium_win_256x256.ico",
                                description: "功能全面的数据库管理工具"
                            }
                        ]
                    },
                    {
                        categoryId: 3,
                        categoryName: "图片处理",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "iLoveIMG",
                                url: "https://www.iloveimg.com/zh-cn",
                                ico: "https://www.iloveimg.com/img/favicons-img/favicon-16x16.png",
                                description: "免费的在线图片处理"
                            },
                        ]
                    },
                    {
                        categoryId: 4,
                        categoryName: "在线工具",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "Regex101",
                                url: "https://regex101.com/",
                                ico: "https://regex101.com/favicon.ico",
                                description: "在线正则表达式测试工具，支持多种语言风格"
                            },
                            {
                                siteId: 2,
                                siteName: "百川在线工具箱",
                                url: "https://rivers.chaitin.cn/tools/",
                                ico: "https://rivers.chaitin.cn/favicon.ico",
                                description: "综合型在线工具平台"
                            },
                            {
                                siteId: 3,
                                siteName: "FreeConvert",
                                url: "https://www.freeconvert.com/zh",
                                ico: "https://www.freeconvert.com/favicon.ico",
                                description: "在线文件转换器"
                            }
                        ]
                    },
                    {
                        categoryId: 4,
                        categoryName: "实用工具",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "Postman",
                                url: "https://www.postmann.cn/",
                                ico: "https://www.postmann.cn/favicon.ico",
                                description: "全球最流行的 API 开发和测试工具"
                            },
                        ]
                    },
                    {
                        categoryId: 5,
                        categoryName: "前端应用",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "Vue.js",
                                url: "https://cn.vuejs.org/",
                                ico: "https://vuejs.org/images/logo.png",
                                description: "渐近式JavaScript框架"
                            },
                            {
                                siteId: 2,
                                siteName: "React",
                                url: "https://react.dev/",
                                ico: "https://react.dev/favicon.ico",
                                description: "用于构建 Web 和原生交互界面的库"
                            },
                            {
                                siteId: 3,
                                siteName: "Element Plus",
                                url: "https://element-plus.org/zh-CN/",
                                ico: "https://element-plus.org/images/element-plus-logo-small.svg",
                                description: "基于 Vue 3，面向设计师和开发者的组件库"
                            },
                            {
                                siteId: 4,
                                siteName: "Ant Design",
                                url: "https://ant-design.antgroup.com/",
                                ico: "https://gw.alipayobjects.com/zos/rmsportal/rlpTLlbMzTNYuZGGCVYM.png",
                                description: "企业级 UI 设计语言和 React 组件库"
                            },
                            {
                                siteId: 5,
                                siteName: "VueUse",
                                url: "https://vueuse.org.cn/",
                                ico: "https://vueuse.org.cn/favicon.ico",
                                description: "Vue 组合式函数工具集"
                            },
                            {
                                siteId: 6,
                                siteName: "Animate.css",
                                url: "https://animate.style/",
                                ico: "https://animate.style/img/favicon.ico",
                                description: "开源的跨浏览器 CSS 动画库"
                            },
                            {
                                siteId: 7,
                                siteName: "Bootstrap",
                                url: "https://getbootstrap.com/",
                                ico: "https://getbootstrap.com/docs/5.3/assets/img/favicons/favicon-32x32.png",
                                description: "用于构建响应式、移动设备优先的网站"
                            },
                            {
                                siteId: 8,
                                siteName: "Lodash",
                                url: "https://lodash.com/",
                                ico: "https://lodash.com/icons/favicon-32x32.png",
                                description: "现代 JavaScript 实用工具库"
                            },
                            {
                                siteId: 9,
                                siteName: "Node.js",
                                url: "https://nodejs.org/",
                                ico: "https://nodejs.org/static/images/favicons/favicon.png",
                                description: "一个免费、开源、跨平台的 JavaScript 运行时环境"
                            },
                            {
                                siteId: 10,
                                siteName: "Sass",
                                url: "https://sass-lang.cn/",
                                ico: "https://sass-lang.cn/icon.png",
                                description: "成熟且功能强大的 CSS 预处理器"
                            },
                        ]
                    },
                    {
                        categoryId: 6,
                        categoryName: "技术文档",
                        sites: [
                            {
                                siteId: 1,
                                siteName: "MDN",
                                url: "https://developer.mozilla.org/zh-CN/",
                                ico: "https://developer.mozilla.org/favicon.ico",
                                description: "最全面的 Web 技术文档库"
                            },
                            {
                                siteId: 2,
                                siteName: "W3school",
                                url: "https://www.w3school.com.cn/index.html",
                                ico: "https://www.w3school.com.cn/ui2019/logo-16-red.png",
                                description: "在线编程学习平台，提供免费教程、案例和沙盒练习环境"
                            },
                            {
                                siteId: 3,
                                siteName: "菜鸟教程",
                                url: "https://www.runoob.com/",
                                ico: "https://www.runoob.com/favicon.ico",
                                description: "面向零基础初学者的编程技术教程网站"
                            }
                        ]
                    }
                ]
            }
        }
    },
    getAllCategory: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                list: [
                    {
                        categoryId: 1,
                        categoryName: "学习交流",
                    },
                    {
                        categoryId: 2,
                        categoryName: "开发工具",
                    },
                    {
                        categoryId: 3,
                        categoryName: "实用工具",
                    },
                    {
                        categoryId: 4,
                        categoryName: "在线工具",
                    },
                    {
                        categoryId: 5,
                        categoryName: "前端应用",
                    }
                ]
            }
        }
    }
}