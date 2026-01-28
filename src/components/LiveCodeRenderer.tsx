'use client';

import React, { useMemo } from 'react';
import { transform } from 'sucrase';

interface LiveCodeRendererProps {
  code: string;
  className?: string;
}

export function LiveCodeRenderer({ code, className = '' }: LiveCodeRendererProps) {
  const rendered = useMemo(() => {
    try {
      // 提取组件名（优先找 export 的，或最后一个大写开头的函数）
      const exportFuncMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)/);
      const exportConstMatch = code.match(/export\s+(?:default\s+)?(?:const|let)\s+(\w+)/);
      
      // 找所有函数声明，取最后一个大写开头的（通常是主组件）
      const allFuncs = [...code.matchAll(/function\s+([A-Z]\w*)\s*\(/g)];
      const lastFunc = allFuncs.length > 0 ? allFuncs[allFuncs.length - 1][1] : null;
      
      const componentName = exportFuncMatch?.[1] || exportConstMatch?.[1] || lastFunc || 'Component';

      // 清理代码：移除 'use client'、import、export 关键字
      let cleanCode = code
        .replace(/['"]use client['"];?\n?/g, '')
        .replace(/^import\s+.*?['"]\s*;?\s*$/gm, '') // 移除 import 语句
        .replace(/^import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"]\s*;?\s*$/gm, '') // 移除 named import
        .replace(/^import\s+\*\s+as\s+\w+\s+from\s*['"][^'"]*['"]\s*;?\s*$/gm, '') // 移除 * as import
        .replace(/export\s+default\s+\w+;?\s*$/gm, '')
        .replace(/export\s+\{[^}]*\};?\s*$/gm, '')
        .replace(/export\s+(?=function|const|let|class)/g, ''); // 移除 export 关键字但保留声明

      // 编译 TSX → JS
      const compiled = transform(cleanCode, {
        transforms: ['typescript', 'jsx'],
        jsxRuntime: 'classic',
        jsxPragma: 'React.createElement',
        jsxFragmentPragma: 'React.Fragment',
      }).code;

      // 沙箱执行
      const fn = new Function(
        'React',
        `${compiled}; return typeof ${componentName} !== 'undefined' ? ${componentName} : null;`
      );
      
      const Component = fn(React);
      
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

  return <div className={className}>{rendered}</div>;
}
