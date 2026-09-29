'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatShortDate } from '@/lib/format';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

interface ArchivePostLite {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  wordCount?: number;
  category?: string;
  tags?: string[];
}

interface ArchiveClientPageProps {
  posts: ArchivePostLite[];
}

const categoryOf = (post: ArchivePostLite) => post.category || post.tags?.[0] || null;

export default function ArchiveClientPage({ posts }: ArchiveClientPageProps) {
  const params = useSearchParams();
  const [selected, setSelected] = useState<string | null>(params?.get('category') ?? null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      const c = categoryOf(post);
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filtered = useMemo(
    () => (selected ? posts.filter((p) => categoryOf(p) === selected) : posts),
    [posts, selected]
  );

  const byYear = useMemo(() => {
    const groups = new Map<string, ArchivePostLite[]>();
    for (const post of filtered) {
      const y = String(new Date(post.date).getFullYear());
      groups.set(y, [...(groups.get(y) ?? []), post]);
    }
    return [...groups.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  const words = useMemo(() => posts.reduce((n, p) => n + (p.wordCount ?? 0), 0), [posts]);

  const pick = (c: string | null) => {
    triggerHaptic(HapticFeedback.Light);
    setSelected(c);
  };

  return (
    <div className="site-column mx-auto px-6 pb-8 pt-12 md:px-0 md:pt-24">
      <header className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[14px] font-medium text-ink">Archive</h1>
          <p className="mono text-[12px] text-ink-3">
            {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
            {words > 0 && `, ${words.toLocaleString('en-US')} words`}
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="pill pill-text-only" aria-pressed={selected === null} onClick={() => pick(null)}>
              All
            </button>
            {categories.map(([c, n]) => (
              <button
                key={c}
                type="button"
                className="pill pill-text-only"
                aria-pressed={selected === c}
                onClick={() => pick(selected === c ? null : c)}
              >
                {c}
                <span className="mono ml-1 text-[11px] text-ink-3">{n}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {byYear.length === 0 ? (
        <p className="mt-16 text-[14px] text-ink-3">Nothing filed under this name.</p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {byYear.map(([year, list], gi) => (
            <section key={year} className="grid grid-cols-[44px_1fr] gap-4">
              <h2 className="mono sticky top-14 h-fit pt-3 text-[12px] text-ink-3 md:top-6">{year}</h2>
              <ul className="flex flex-col">
                {list.map((post, i) => (
                  <li key={post.slug} className="rise" style={{ ['--i' as string]: gi * 3 + i }}>
                    <Link href={`/post/${post.slug}`} className="post-row">
                      <span className="post-title text-[14px]">{post.title}</span>
                      <time className="post-date" dateTime={post.date}>
                        {formatShortDate(post.date)}
                      </time>
                      {post.excerpt && <span className="post-excerpt line-clamp-1 text-[13px]">{post.excerpt}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
