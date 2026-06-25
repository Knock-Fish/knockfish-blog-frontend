/**
 * 从 Markdown 内容中解析标题
 * @param content - Markdown 文本内容
 * @param snippetId - 代码片段ID（用于生成唯一锚点）
 * @returns 标题列表
 */
export function parseMarkdownHeadings(
    content: string, 
    snippetId: number
): Array<{ id: string; text: string; level: number; snippetId: number }> {
    if (!content) return []
    
    const headings: Array<{ id: string; text: string; level: number; snippetId: number }> = []
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    
    let match: RegExpExecArray | null
    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length
        const text = match[2].trim()
        // 生成唯一锚点ID：snippet-{id}-heading-{规范化标题}
        const normalizedText = text
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
            .replace(/^-|-$/g, '')
        const id = `snippet-${snippetId}-heading-${normalizedText}`
        
        headings.push({ id, text, level, snippetId })
    }
    
    return headings
}

/**
 * 规范化标题文本用于生成ID
 */
export function normalizeHeadingId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '')
}
