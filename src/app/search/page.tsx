'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { formatShortDate } from '@/lib/format';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  coverImage: string | null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded-[3px] bg-[rgba(var(--ink-rgb),0.12)] px-[0.1em] text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function cleanExcerpt(text: string) {
  return text.replace(/^[\s>#*-]+/, '').replace(/\s+/g, ' ').trim();
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('search failed', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => run(query.trim()), 150);
    return () => clearTimeout(id);
  }, [query, run]);

  const clear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="site-column mx-auto min-h-[80dvh] px-6 pb-24 pt-14 md:px-0 md:pt-28">
      <h1 className="sr-only">Search</h1>

      <label className="flex items-center gap-[0.4em] text-[clamp(1.75rem,4vw,3rem)]">
        <Search className="h-[0.62em] w-[0.62em] flex-none text-ink-3" strokeWidth={2.4} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') clear();
          }}
          placeholder="Seek, and ye shall find"
          aria-label="Search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          style={{ outline: 'none' }}
          className="display min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 shadow-none caret-(--accent-red) outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden placeholder:font-medium placeholder:italic placeholder:tracking-[-0.03em] placeholder:text-ink-3"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="grid h-[0.9em] w-[0.9em] flex-none place-items-center rounded-full bg-[rgba(var(--ink-rgb),0.06)] text-ink-3 hover:text-ink"
            aria-label="Clear"
          >
            <X className="h-[0.45em] w-[0.45em]" strokeWidth={2.4} />
          </button>
        )}
      </label>

      {searched && (
        <p className="mt-6 text-[0.9375rem] italic text-ink-3" aria-live="polite">
          {loading ? 'Searching' : results.length === 0 ? 'Nothing answereth to that name.' : `${results.length} ${results.length === 1 ? 'entry' : 'entries'}`}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-8 flex flex-col gap-1">
          <AnimatePresence mode="popLayout">
          {results.map((r, index) => {
            const excerpt = cleanExcerpt(r.excerpt || '');
            return (
              <motion.li
                key={r.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
              >
                <Link href={`/post/${r.slug}` as never} className="-mx-4 flex flex-col gap-1.5 rounded-[12px] px-4 py-3.5 hover:bg-[rgba(var(--ink-rgb),0.04)]">
                  <span className="flex items-baseline justify-between gap-6">
                    <span className="text-[1.0625rem] md:text-[1.125rem] font-semibold leading-[1.4] tracking-[-0.015em] text-ink">{highlight(r.title, query.trim())}</span>
                    <time className="flex-none text-[0.875rem] italic text-ink-3" dateTime={r.date}>
                      {formatShortDate(r.date)}
                    </time>
                  </span>
                  {excerpt && (
                    <span className="line-clamp-2 text-[0.9375rem] leading-[1.6] text-ink-2">{highlight(excerpt, query.trim())}</span>
                  )}
                </Link>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
