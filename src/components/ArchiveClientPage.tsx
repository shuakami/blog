'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatShortDate, toOldWords, toRoman } from '@/lib/format';
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
    <div className="site-column mx-auto px-6 pb-8 pt-14 md:px-0 md:pt-28">
      <header className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="display text-[clamp(3rem,5vw,5rem)]">Archive</h1>
          <p className="text-[1.125rem] italic text-ink-2">
            {toOldWords(posts.length).replace(/^./, (c) => c.toUpperCase())} {posts.length === 1 ? 'entry' : 'entries'}
            {words > 0 && `, some ${words.toLocaleString('en-US')} words in all`}.
          </p>
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
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
                <span className="ml-1.5 text-[0.8125rem] italic text-ink-3">{n}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {byYear.length === 0 ? (
        <p className="mt-20 text-[1.125rem] italic text-ink-3">Nothing is filed under that name.</p>
      ) : (
        <div className="mt-20 flex flex-col gap-20">
          {byYear.map(([year, list], gi) => (
            <section key={year}>
              <h2 className="mb-4 flex items-baseline gap-4">
                <span className="text-[2.5rem] font-bold leading-none tracking-[-0.04em] text-ink">{toRoman(Number(year))}</span>
                <span className="text-[1rem] italic text-ink-3">{year}</span>
              </h2>
              <ul className="flex flex-col">
                {list.map((post, i) => (
                  <li key={post.slug} className="rise" style={{ ['--i' as string]: gi * 3 + i }}>
                    <Link href={`/post/${post.slug}`} className="post-row">
                      <span className="post-title">{post.title}</span>
                      <time className="post-date" dateTime={post.date}>
                        {formatShortDate(post.date)}
                      </time>
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
