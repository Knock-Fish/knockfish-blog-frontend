<template>
    <div class="about">
        <div class="about-content">
            <section class="section">
                <h2>🐟关于我</h2>
                <hr />
                <p>
                    KnockFish，中文全称敲打键盘的鱼
                </p>
                <p>
                    每天手不停敲击键盘写代码，写接口、调页面，手指疯狂敲打键盘，像一条不停
                    “敲打” 的鱼
                </p>
                <p>
                    程序员真实日常：一半敲代码，一半摸鱼（doge）
                </p>
            </section>

            <section class="section">
                <h2>🏗️ 网站</h2>
                <hr />
                <p>用于记录技术学习过程中的思考与实践，形成知识体系</p>
                <p>
                    这个博客是我从零开始独立开发的个人项目，基于Springboot +
                    Vue开发，采用前后端分离架构，分为面向读者的前台展示站点，以及一套自己开发的后台管理系统
                </p>
                <p>为什么选择从零自研，而不用现成静态博客模板？</p>
                <h3>优点</h3>
                <ul>
                    <li>界面、功能高度自定义</li>
                    <li>后期维护起来更加灵活方便</li>
                    <li>可以锻炼自己的编程能力</li>
                </ul>
                <h3>缺点</h3>
                <ul>
                    <li>自己从0造轮子，实现周期更长</li>
                    <li>页面布局、样式、交互全部需要自行设计开发</li>
                    <li>需要投入大量时间与精力</li>
                </ul>
            </section>

            <section class="section">
                <h2>📬 联系方式</h2>
                <ul class="contact-list">
                    <li><strong>GitHub：</strong><span class="placeholder">
                            <a href="https://github.com/Knock-Fish"
                                target="_blank">Knock-Fish</a></span></li>
                    <li><strong>邮箱：</strong><span
                            class="placeholder">984645367@qq.com</span></li>
                    <li><strong>B站：</strong><span class="placeholder">
                            <a href="https://space.bilibili.com/185570350"
                                target="_blank">敲打键盘的鱼</a></span></li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup lang='ts'>
defineOptions({ name: 'About' })
</script>

<style lang="scss" scoped>
.about {
    width: 100%;
    height: 100%;
    // padding: 40px 20px;
    overflow-y: auto;

    .about-content {
        width: 80%;
        margin: 0 auto;
        line-height: 1.8;
        color: var(--text-color-200);

        .section {
            margin-bottom: 40px;

            h2 {
                font-size: 24px;
                font-weight: 600;
                color: var(--text-color-100);
            }

            h3 {
                font-size: 18px;
                font-weight: 600;
                margin: 20px 0 12px;
                color: var(--text-color-300);
            }

            p {
                margin-bottom: 12px;
                text-align: justify;
            }

            ul {
                margin: 12px 0;
                padding-left: 24px;

                li {
                    margin-bottom: 8px;
                }
            }
        }

        .contact-list {
            li {
                margin-bottom: 12px;

                .placeholder {
                    color: #999;
                    font-style: italic;

                    a {
                        color: #77a2ff;
                    }
                }
            }
        }
    }
}
</style>