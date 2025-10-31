/**
 * 计算文章阅读时间
 * @param htmlContent - HTML 格式的文章内容
 * @returns 阅读时间（分钟）
 */
export function calculateReadingTime(htmlContent: string): number {
  // 移除 HTML 标签
  const text = htmlContent.replace(/<[^>]*>/g, '')
  
  // 移除多余空白
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // 统计中文字符数（包括中文标点）
  const chineseChars = cleanText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []
  const chineseCount = chineseChars.length
  
  // 统计英文单词数
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, '') // 移除中文
    .match(/\b[a-zA-Z]+\b/g) || []
  const englishCount = englishWords.length
  
  // 中文阅读速度：约 350 字/分钟
  // 英文阅读速度：约 200 词/分钟
  const chineseReadingTime = chineseCount / 350
  const englishReadingTime = englishCount / 200
  
  const totalMinutes = chineseReadingTime + englishReadingTime
  
  // 最少显示 1 分钟
  return Math.max(1, Math.ceil(totalMinutes))
}

