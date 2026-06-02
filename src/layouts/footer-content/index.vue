<template>
    <footer class="site-footer">
        <div class="footer-container">
            <!-- 版权声明 - 放在最上面 -->
            <p class="copyright">© 2026 <a
                    href="http://localhost:3307/">Knock_Fish</a></p>
            
            <!-- 备案信息 - 放在下面 -->
            <div class="footer-icp-group">
                <a href="https://beian.miit.gov.cn/" target="_blank"
                    rel="noopener noreferrer" class="footer-link">
                    粤ICP备2026051092号
                </a>

                <div class="footer-icp">
                    <img src="../../assets/imgs/head-logo.png" alt="公安备案图标"
                        width="20" height="20" />
                    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=44522102000378"
                        target="_blank" rel="noopener noreferrer"
                        class="footer-link">
                        粤公网安备44522102000378号
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang='ts'>
// 备案信息组件
</script>

<style lang="scss" scoped>
.site-footer {
    width: 100%;
    background-color: var(--bg-color-100);
    margin-top: auto;
    color: gray;
    margin-top: 100px;


    .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 3em 1.5em;
        text-align: center;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        @media (min-width: 768px) {
            // 桌面端保持垂直布局（版权在上，备案在下）
            flex-direction: column;
            gap: 0.8rem;
        }
    }

    // 备案信息组（水平排列）
    .footer-icp-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;

        @media (min-width: 640px) {
            flex-direction: row;
            gap: 1.5rem;
        }
    }

    .footer-icp {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;

        img {
            display: block;
            object-fit: contain;
        }
    }

    .copyright {
        font-size: 0.9rem;
        margin: 0;
        
        a {
            color: inherit;
            text-decoration: none;
            
            &:hover {
                text-decoration: underline;
            }
        }
    }

    .footer-link {
        color: inherit;
        text-decoration: none;
        transition: opacity 0.2s ease;
        font-size: 0.9rem;

        &:hover {
            opacity: 0.8;
            text-decoration: underline;
        }

        &:focus-visible {
            outline: 2px solid var(--primary-color, #0066cc);
            outline-offset: 2px;
            border-radius: 2px;
        }
    }
}
</style>