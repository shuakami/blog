// src/utils/markdown.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import { LRUCache } from 'lru-cache';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import { parseProjectCard, renderProjectCard } from './project-card';

interface CodeNode extends Node {
  tagName: string;
  properties: {
    className?: string[];
  };
  children: CodeNode[];
}


const htmlCache = new LRUCache<string, string>({
  max: 800,
  ttl: 1000 * 60 * 60, // 1h
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});


// FNV-1a 32-bit
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  // 返回 8 字节十六进制字符串
  return ('0000000' + h.toString(16)).slice(-8);
}

// 快速判断是否有代码块/内联代码（决定是否启用 Prism）
function hasCode(markdown: string): boolean {
  // ```、~~~、<pre>、<code> 四种快速信号
  return /```|~~~|<pre[\s>]|<code[\s>]/.test(markdown);
}

function handleUnknownLanguage() {
  return (tree: Node) => {
    visit(tree, 'element', (node: CodeNode) => {
      if (node.tagName === 'pre') {
        const codeNode = node.children.find((n) => (n as any).tagName === 'code');
        if (codeNode && codeNode.properties.className) {
          const lang = codeNode.properties.className[0]?.split('-')[1];
          if (lang === 'prompt') {
            codeNode.properties.className = ['language-text'];
          }
        }
      }
    });
  };
}


// 添加标题 ID 的插件
function rehypeAddHeadingIds() {
  return (tree: Node) => {
    let headingCounter = 0;
    visit(tree, 'element', (node: any) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        if (!node.properties) {
          node.properties = {};
        }
        if (!node.properties.id) {
          let text = '';
          visit(node, 'text', (textNode: any) => {
            text += textNode.value;
          });
          
          const id = text
            .trim()
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `heading-${++headingCounter}`;
          
          node.properties.id = id;
        }
      }
    });
  };
}

function rehypeProjectCards() {
  return (tree: Node) => {
    visit(tree, 'comment', (node: any, index, parent) => {
      if (!node.value || !parent || index === null) return;
      
      const trimmed = node.value.trim();
      if (trimmed.startsWith('ProjectCard')) {
        const cardData = parseProjectCard(trimmed);
        if (cardData) {
          const html = renderProjectCard(cardData);
          parent.children[index] = {
            type: 'raw',
            value: html,
          };
        }
      }
    });
  };
}

const base = () =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeAddHeadingIds)
    .use(rehypeProjectCards);

const processorWithPrism = base().use(rehypePrism).use(handleUnknownLanguage).use(rehypeStringify);
const processorLight = base().use(handleUnknownLanguage).use(rehypeStringify);


export interface Heading {
  id: string;
  text: string;
  level: number;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  // 以哈希作为缓存键，避免长字符串占用大量键空间
  const key = fnv1a(markdown);
  const cached = htmlCache.get(key);
  if (cached) return cached;

  const usePrism = hasCode(markdown);
  const result = await (usePrism ? processorWithPrism : processorLight).process(markdown);
  const html = result.toString();

  htmlCache.set(key, html);
  return html;
}

// 提取文章标题
export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3]
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    if (text && level <= 3) { // 只提取 h1, h2, h3
      headings.push({ id, text, level });
    }
  }
  
  return headings;
}
