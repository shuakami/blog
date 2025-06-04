export function formatDate(date: string | Date | undefined): string {
  if (!date) {
    return '未知日期';
  }

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // 检查日期是否有效
    if (isNaN(d.getTime())) {
      console.error('❌ [日期格式化] 无效的日期:', date);
      return '无效日期';
    }
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (error) {
    console.error('❌ [日期格式化] 处理出错:', error);
    return '日期处理错误';
  }
} 