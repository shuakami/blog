'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 py-1.5 text-sm text-black/60 dark:text-white/60 hover:text-black/80 dark:hover:text-white/80 rounded-lg transition-colors"
      aria-label="返回上一页"
    >
      <ArrowLeft className="w-4 h-4" />
      返回
    </button>
  );
} 