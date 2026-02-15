'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { transform } from 'sucrase';
import * as FramerMotion from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveCodeRendererProps {
  code: string;
  className?: string;
}

function extractImportedIdentifiers(source: string): string[] {
  const names = new Set<string>();
  const importRegex = /^import\s+(.+?)\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm;
  const addName = (value: string) => {
    const name = value.replace(/^type\s+/, '').trim();
    if (name) names.add(name);
  };
  const parseNamed = (value: string) => {
    const inner = value.replace(/^\{/, '').replace(/\}$/, '').trim();
    if (!inner) return;
    inner.split(',').forEach((part) => {
      const spec = part.trim();
      if (!spec) return;
      const asMatch = spec.match(/\s+as\s+(.+)$/);
      if (asMatch?.[1]) {
        addName(asMatch[1]);
      } else {
        addName(spec);
      }
    });
  };

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(source)) !== null) {
    const clause = match[1].trim();
    if (!clause) continue;

    if (clause.startsWith('{')) {
      parseNamed(clause);
      continue;
    }

    if (clause.startsWith('* as ')) {
      addName(clause.replace(/^\* as /, ''));
      continue;
    }

    if (clause.includes('{')) {
      const [defaultPart, namedPart] = clause.split(',', 2);
      addName(defaultPart || '');
      parseNamed(namedPart || '');
      continue;
    }

    addName(clause);
  }

  return Array.from(names);
}

// Portal 组件，用于渲染到 body
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export function LiveCodeRenderer({ code, className = '' }: LiveCodeRendererProps) {
  const rendered = useMemo(() => {
    try {
      const importedIdentifiers = extractImportedIdentifiers(code);

      // 提取组件名（优先找 export 的，或最后一个大写开头的函数）
      const exportFuncMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)/);
      const exportConstMatch = code.match(/export\s+(?:default\s+)?(?:const|let)\s+(\w+)/);
      
      // 找所有函数声明，取最后一个大写开头的（通常是主组件）
      let lastFunc: string | null = null;
      const funcRegex = /function\s+([A-Z]\w*)\s*\(/g;
      let match: RegExpExecArray | null;
      while ((match = funcRegex.exec(code)) !== null) {
        lastFunc = match[1];
      }
      
      const componentName = exportFuncMatch?.[1] || exportConstMatch?.[1] || lastFunc || 'Component';

      // 清理代码：移除 'use client'、import、export 关键字
      let cleanCode = code
        .replace(/['"]use client['"];?\n?/g, '')
        .replace(/^import\s+.*?['"]\s*;?\s*$/gm, '')
        .replace(/^import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"]\s*;?\s*$/gm, '')
        .replace(/^import\s+\*\s+as\s+\w+\s+from\s*['"][^'"]*['"]\s*;?\s*$/gm, '')
        .replace(/export\s+default\s+\w+;?\s*$/gm, '')
        .replace(/export\s+\{[^}]*\};?\s*$/gm, '')
        .replace(/export\s+(?=function|const|let|class)/g, '');

      // 编译 TSX → JS
      const compiled = transform(cleanCode, {
        transforms: ['typescript', 'jsx'],
        jsxRuntime: 'classic',
        jsxPragma: 'React.createElement',
        jsxFragmentPragma: 'React.Fragment',
      }).code;

      // 沙箱执行，注入常用运行时依赖
      const fallbackImport = ({ children }: { children?: React.ReactNode }) => <>{children ?? null}</>;
      const runtimeScope: Record<string, unknown> = {
        React,
        Portal,
        ...React,
        ...FramerMotion,
        ...LucideIcons,
        cn,
      };
      importedIdentifiers.forEach((name) => {
        if (!(name in runtimeScope)) {
          runtimeScope[name] = fallbackImport;
        }
      });

      const fn = new Function(
        'React',
        'Portal',
        'scope',
        `with (scope) { ${compiled}; return typeof ${componentName} !== 'undefined' ? ${componentName} : null; }`
      );
      
      const Component = fn(React, Portal, runtimeScope);
      
      if (!Component) {
        return <div className="text-red-500 text-sm">组件未找到</div>;
      }

      return <Component />;
    } catch (err) {
      console.error('LiveCodeRenderer error:', err);
      return (
        <div className="text-red-500 text-xs p-2">
          渲染失败: {err instanceof Error ? err.message : '未知错误'}
        </div>
      );
    }
  }, [code]);

  return <div className={`w-full flex items-center justify-center ${className}`} onClick={(e) => e.stopPropagation()}>{rendered}</div>;
}
