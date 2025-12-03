import type { GrayMatterFile } from 'gray-matter';

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  download_url: string | null;
  content?: string;
}

export interface PostEncryption {
  hash: string;
}

interface BaseContent {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt?: string;
  wordCount?: number;
  coverImage?: string | null;
  author?: string;
  encryption?: PostEncryption;
  encrypted?: boolean;
}

export interface BlogPost extends BaseContent {
  tags?: string[];
  category?: string;
  source?: 'github' | 'obsidian';
  // 资源相关字段
  resource?: boolean;
  resourceType?: string;
  format?: string;
  size?: string;
  downloadUrl?: string;
  resourceDetails?: Record<string, string>;
  usage?: string[];
}

export interface ArchivePost extends BaseContent {
  category?: string;
  tags?: string[];
  source?: 'github' | 'obsidian';
}

export interface ContentIndex {
  posts: Array<Omit<BlogPost | ArchivePost, 'content'>>;
}

export interface MatterResult extends GrayMatterFile<string> {
  data: {
    title: string;
    date: string;
    excerpt?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    author?: string;
  };
}

export interface Post extends BaseContent {
  tags?: string[];
}

export interface PostIndex {
  posts: Post[];
  generated: string;
}

