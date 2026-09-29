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
    <div className="site-column mx-auto px-6 pb-8 pt-14 md:px-0 md:pt-28">
      <h1 className="display text-[clamp(2.125rem,5vw,5rem)]">Search</h1>

      <label className="mt-14 flex items-center gap-4 rounded-[14px] bg-[rgba(var(--ink-rgb),0.05)] px-5 py-4 focus-within:bg-[rgba(var(--ink-rgb),0.075)]">
        <Search className="h-5 w-5 flex-none text-ink-3" strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Seek, and ye shall find"
          aria-label="Search"
          style={{ outline: 'none' }}
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent shadow-none focus-visible:outline-none text-[1.125rem] md:text-[1.375rem] font-medium tracking-[-0.02em] text-ink outline-none placeholder:font-normal placeholder:italic placeholder:text-ink-3"
        />
        {query && (
          <button type="button" onClick={clear} className="flex-none text-ink-3 hover:text-ink" aria-label="Clear">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </label>

      {searched && (
        <p className="mt-8 text-[1rem] italic text-ink-3">
          {loading ? 'Searching' : results.length === 0 ? 'Nothing answereth to that name.' : `${results.length} ${results.length === 1 ? 'entry' : 'entries'}`}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
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
                <Link href={`/post/${r.slug}` as never} className="-mx-4 flex flex-col gap-2 rounded-[12px] px-4 py-4 hover:bg-[rgba(var(--ink-rgb),0.04)]">
                  <span className="flex items-baseline justify-between gap-6">
                    <span className="text-[1.0625rem] md:text-[1.25rem] font-semibold leading-[1.35] tracking-[-0.02em] text-ink">{highlight(r.title, query.trim())}</span>
                    <time className="flex-none text-[0.9375rem] italic text-ink-3" dateTime={r.date}>
                      {formatShortDate(r.date)}
                    </time>
                  </span>
                  {excerpt && (
                    <span className="line-clamp-2 text-[1rem] leading-[1.6] text-ink-2">{highlight(excerpt, query.trim())}</span>
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
