interface SnippetData {
    codeSnippetId: number
    codeContent: string
}

interface ParsedHeading {
    id: string
    text: string
    level: number
    snippetId: number
}

interface WorkerMessage {
    type: 'parse' | 'done'
    data?: SnippetData[]
    result?: ParsedHeading[]
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    if (e.data.type === 'parse' && e.data.data) {
        const headings: ParsedHeading[] = []
        const headingRegex = /^(#{1,6})\s+(.+)$/gm

        e.data.data.forEach(snippet => {
            let match
            const content = snippet.codeContent || ''
            
            while ((match = headingRegex.exec(content)) !== null) {
                const level = match[1].length
                const text = match[2].trim()
                const normalizedText = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                const id = `snippet-${snippet.codeSnippetId}-heading-${normalizedText}`
                
                headings.push({
                    id,
                    text,
                    level,
                    snippetId: snippet.codeSnippetId
                })
            }
        })

        self.postMessage({
            type: 'done',
            result: headings
        } as WorkerMessage)
    }
}
