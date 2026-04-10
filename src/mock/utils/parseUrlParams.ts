export const parseUrlParams = (url: string) => {
    const urlObj = new URL(url)
    const params = Object.fromEntries(urlObj.searchParams.entries())
    const { pageNum = '1', pageSize = '10', ...keyword } = params
    return {
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
        keyword
    }
}