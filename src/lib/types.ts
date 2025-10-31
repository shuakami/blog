// 文章卡片类型
export interface ArticleCard {
  area?: 'featured' | 'side-1' | 'side-2'
  title: string
  category: string
  author: string
  authorAvatar: string
  imageUrl?: string
  description?: string
  link: string
  className?: string
  pinned?: boolean
}

// 导航项类型
export interface NavItem {
  label: string
  href: string
  enabled: boolean
}

// 音乐相关类型
export interface UnifiedSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number; // in seconds
  url?: string; // Music URL
  lyrics?: {
    original?: string; // Original LRC content
    translated?: string; // Translated LRC content
  };
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}
