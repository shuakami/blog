import type { GrayMatterFile } from 'gray-matter';

// GitHub API响应类型
export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  download_url: string | null;
  content?: string;
}

// 基础内容类型
interface BaseContent {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  coverImage?: string | null;
}

// 博客文章类型
export interface BlogPost extends BaseContent {
  tags?: string[];
}

// 归档文章类型
export interface ArchivePost extends BaseContent {
  category?: string;
}

// 索引类型
export interface ContentIndex {
  posts: Array<Omit<BlogPost | ArchivePost, 'content'>>;
}

// Matter 结果类型
export interface MatterResult extends GrayMatterFile<string> {
  data: {
    title: string;
    date: string;
    excerpt?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
  };
}

// 向后兼容的 Post 类型
export interface Post extends BaseContent {
  tags?: string[];
}

// 文章索引类型
export interface PostIndex {
  posts: Post[];
  generated: string;
}