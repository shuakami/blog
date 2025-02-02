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

interface CodeNode extends Node {
  tagName: string;
  properties: {
    className?: string[];
  };
  children: CodeNode[];
}

// 添加HTML缓存
const htmlCache = new LRUCache<string, string>({
  max: 500, // 最多缓存500篇文章
  ttl: 1000 * 60 * 60 // 1小时过期
});

// 处理未知语言，将其转换为text
function handleUnknownLanguage() {
  return (tree: Node) => {
    visit(tree, 'element', (node: CodeNode) => {
      if (node.tagName === 'pre') {
        const codeNode = node.children.find(n => n.tagName === 'code');
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

// 预编译处理器
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypePrism)
  .use(handleUnknownLanguage)
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string) {
  const cacheKey = markdown;
  const cached = htmlCache.get(cacheKey);
  if (cached) return cached;

  const result = await processor.process(markdown);
  const html = result.toString();
  
  htmlCache.set(cacheKey, html);
  return html;
}