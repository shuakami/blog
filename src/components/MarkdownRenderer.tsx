// src/components/MarkdownRenderer.tsx
'use client'

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = React.memo(({ content }: MarkdownRendererProps) => {
  return (
    <div 
      className="prose dark:prose-invert max-w-none markdown-body"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;