<template>
    <div class="code-snippets">
        <div class="snippet-search">
            <ElInput 
                v-model="searchQuery" 
                placeholder="搜索代码片段..."
                prefix-icon="Search"
                class="search-input"
            />
            <ElSelect 
                v-model="selectedLanguage" 
                placeholder="选择语言"
                class="language-select"
            >
                <ElOption label="全部" value="" />
                <ElOption label="JavaScript" value="javascript" />
                <ElOption label="TypeScript" value="typescript" />
                <ElOption label="Python" value="python" />
                <ElOption label="Go" value="go" />
                <ElOption label="Rust" value="rust" />
            </ElSelect>
        </div>
        
        <div class="snippet-list">
            <ElCard 
                v-for="snippet in filteredSnippets" 
                :key="snippet.id"
                class="snippet-card"
                hover
                @click="viewSnippet(snippet)"
            >
                <div class="snippet-header">
                    <div class="snippet-title">{{ snippet.title }}</div>
                    <ElTag :color="getLanguageColor(snippet.language)">
                        {{ snippet.language }}
                    </ElTag>
                </div>
                <pre class="snippet-preview"><code>{{ snippet.code }}</code></pre>
                <div class="snippet-meta">
                    <span class="snippet-date">{{ snippet.createdAt }}</span>
                    <div class="snippet-tags">
                        <ElTag 
                            v-for="tag in snippet.tags" 
                            :key="tag"
                            size="small"
                            effect="light"
                        >
                            {{ tag }}
                        </ElTag>
                    </div>
                </div>
            </ElCard>
        </div>
        
        <div v-if="filteredSnippets.length === 0" class="empty-state">
            <ElEmpty description="暂无代码片段" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElInput, ElSelect, ElOption, ElCard, ElTag, ElEmpty } from 'element-plus'

interface CodeSnippet {
    id: number
    title: string
    language: string
    code: string
    tags: string[]
    createdAt: string
}

const searchQuery = ref('')
const selectedLanguage = ref('')

const mockSnippets: CodeSnippet[] = [
    { id: 1, title: 'Debounce 防抖函数', language: 'typescript', code: 'export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {\n  let timer: ReturnType<typeof setTimeout> | null = null\n  return ((...args: unknown[]) => {\n    if (timer) clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }) as T\n}', tags: ['utils', 'function'], createdAt: '2026-06-15' },
    { id: 2, title: 'Throttle 节流函数', language: 'typescript', code: 'export function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {\n  let lastTime = 0\n  return ((...args: unknown[]) => {\n    const now = Date.now()\n    if (now - lastTime >= delay) {\n      lastTime = now\n      fn(...args)\n    }\n  }) as T\n}', tags: ['utils', 'function'], createdAt: '2026-06-14' },
    { id: 3, title: '深拷贝函数', language: 'javascript', code: 'function deepClone(obj, map = new WeakMap()) {\n  if (obj === null || typeof obj !== "object") return obj\n  if (map.has(obj)) return map.get(obj)\n  const clone = Array.isArray(obj) ? [] : {}\n  map.set(obj, clone)\n  for (const key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      clone[key] = deepClone(obj[key], map)\n    }\n  }\n  return clone\n}', tags: ['utils', 'object'], createdAt: '2026-06-13' },
    { id: 4, title: 'Python 单例装饰器', language: 'python', code: 'def singleton(cls):\n    instances = {}\n    def wrapper(*args, **kwargs):\n        if cls not in instances:\n            instances[cls] = cls(*args, **kwargs)\n        return instances[cls]\n    return wrapper', tags: ['decorator', 'pattern'], createdAt: '2026-06-12' },
    { id: 5, title: 'Go 并发安全 Map', language: 'go', code: 'type SafeMap struct {\n    mu sync.RWMutex\n    m  map[string]interface{}\n}\n\nfunc NewSafeMap() *SafeMap {\n    return &SafeMap{m: make(map[string]interface{})}\n}\n\nfunc (sm *SafeMap) Set(k string, v interface{}) {\n    sm.mu.Lock()\n    defer sm.mu.Unlock()\n    sm.m[k] = v\n}', tags: ['concurrency', 'map'], createdAt: '2026-06-11' },
    { id: 6, title: 'Rust Result 处理', language: 'rust', code: 'fn process_result<T, E>(result: Result<T, E>) -> Option<T> {\n    match result {\n        Ok(value) => Some(value),\n        Err(e) => {\n            eprintln!(\"Error: {:?}\", e);\n            None\n        }\n    }\n}', tags: ['error-handling', 'rust'], createdAt: '2026-06-10' },
]

const filteredSnippets = computed(() => {
    return mockSnippets.filter(snippet => {
        const matchSearch = snippet.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          snippet.code.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchLanguage = !selectedLanguage.value || snippet.language === selectedLanguage.value
        return matchSearch && matchLanguage
    })
})

const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
        javascript: '#F6D45A',
        typescript: '#3178C6',
        python: '#3776AB',
        go: '#00ADD8',
        rust: '#DEA584'
    }
    return colors[language] || '#909399'
}

const viewSnippet = (snippet: CodeSnippet) => {
    console.log('View snippet:', snippet)
}
</script>

<style lang="scss" scoped>
.code-snippets {
    padding: 20px;
}

.snippet-search {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.search-input {
    flex-grow: 1;
    max-width: 300px;
}

.language-select {
    width: 160px;
}

.snippet-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.snippet-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
    }
    
    :deep(.el-card__body) {
        padding: 16px;
    }
}

.snippet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.snippet-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-color-100);
}

.snippet-preview {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 12px;
    max-height: 120px;
    overflow-y: auto;
    
    code {
        font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
    }
}

.snippet-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.snippet-date {
    font-size: 12px;
    color: var(--text-color-400);
}

.snippet-tags {
    display: flex;
    gap: 6px;
}

.empty-state {
    padding: 60px 0;
}
</style>