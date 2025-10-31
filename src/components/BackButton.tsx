'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
      aria-label="返回上一页"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>返回</span>
    </button>
  );
} 