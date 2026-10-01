'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cameFrom } from '@/lib/nav-trail';

const LABELS: [string, string][] = [
  ['/archive', 'Archive'],
  ['/search', 'Search'],
  ['/resources', 'Resources'],
  ['/works', 'Works'],
  ['/about', 'About'],
  ['/post/', 'Back'],
];

function labelFor(url: string) {
  const path = url.split(/[?#]/)[0];
  if (path === '/') return 'Index';
  return LABELS.find(([prefix]) => path === prefix || path.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`))?.[1] ?? 'Back';
}

export function PostBackLink() {
  const router = useRouter();
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => {
    setFrom(cameFrom(window.location.pathname + window.location.search));
  }, []);

  const href = from ?? '/';
  const label = from ? labelFor(from) : 'Index';

  return (
    <Link
      href={href as never}
      className="pill"
      aria-label={`Back to ${label === 'Back' ? 'previous page' : label}`}
      onClick={(e) => {
        if (!from || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        router.back();
      }}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
      <span>{label}</span>
    </Link>
  );
}
