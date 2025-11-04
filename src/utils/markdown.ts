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
  children?: CodeNode[];
}

const htmlCache = new LRUCache<string, string>({
  max: 800,
  ttl: 1000 * 60 * 60,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

const HAS_CODE_REGEX = /```|~~~|<pre[\s>]|<code[\s>]/;
const HEADING_REGEX = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}

function hasCode(markdown: string): boolean {
  return HAS_CODE_REGEX.test(markdown);
}

function handleUnknownLanguage() {
  return (tree: Node) => {
    visit(tree, 'element', (node: CodeNode) => {
      if (node.tagName !== 'pre' || !node.children) return;
      const codeNode = node.children.find((n: any) => n?.tagName === 'code') as CodeNode | undefined;
      if (codeNode?.properties?.className && codeNode.properties.className.length > 0) {
        const lang = codeNode.properties.className[0]?.split('-')[1];
        if (lang === 'prompt') {
          codeNode.properties.className = ['language-text'];
        }
      }
    });
  };
}

function rehypeAddHeadingIds() {
  return (tree: Node) => {
    let headingCounter = 0;
    visit(tree, 'element', (node: any) => {
      if (!['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) return;
      node.properties ||= {};
      if (!node.properties.id) {
        let text = '';
        visit(node, 'text', (textNode: any) => {
          text += textNode.value;
        });
        const id =
          text
            .trim()
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `heading-${++headingCounter}`;
        node.properties.id = id;
      }
    });
  };
}

function remarkProjectCards() {
  return (tree: Node) => {
    visit(tree, 'html', (node: any, index, parent) => {
      if (!node.value || !parent || index === null) return;
      const commentMatch = node.value.match(/<!--\s*(ProjectCard[^>]+)-->/);
      if (commentMatch) {
        const cardData = parseProjectCard(commentMatch[1]);
        if (cardData) {
          const html = renderProjectCard(cardData);
          node.value = html;
          node.type = 'html';
        }
      }
    });
  };
}

function rehypeRemoveProjectCardComments() {
  return (tree: Node) => {
    visit(tree, (node: any, index, parent) => {
      if (node.type === 'comment' && node.value && node.value.includes('ProjectCard')) {
        if (parent && index !== null) {
          parent.children.splice(index, 1);
          return index;
        }
      }
      if (node.type === 'raw' && node.value && node.value.includes('<!-- ProjectCard')) {
        const commentMatch = node.value.match(/<!--\s*(ProjectCard[^>]+)-->/);
        if (commentMatch) {
          const cardData = parseProjectCard(commentMatch[1]);
          if (cardData) {
            node.value = renderProjectCard(cardData);
          }
        }
      }
    });
  };
}

const base = () =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkProjectCards)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRemoveProjectCardComments)
    .use(rehypeAddHeadingIds);

const processorWithPrism = base().use(rehypePrism).use(handleUnknownLanguage).use(rehypeStringify);
const processorLight = base().use(handleUnknownLanguage).use(rehypeStringify);

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const key = fnv1a(markdown);
  const cached = htmlCache.get(key);
  if (cached) return cached;

  const usePrism = hasCode(markdown);
  const result = await (usePrism ? processorWithPrism : processorLight).process(markdown);
  const html = result.toString();

  htmlCache.set(key, html);
  return html;
}

export function extractHeadings(html: string): Heading[] {
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;
  while ((match = HEADING_REGEX.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3]
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (text && level <= 3) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}
