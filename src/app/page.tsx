import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { getBlogPosts } from '@/utils/posts';
import { Section } from '@/components/ui/section';
import { InlineLink } from '@/components/ui/inline-link';
import { formatShortDate } from '@/lib/format';

export const revalidate = 30;

const SELECTED_WORK = [
  { year: '2025', title: 'Ciallo Agent', note: 'An agent that answers GitHub issues with pull requests', href: 'https://agent.sdjz.wiki' },
  { year: '', title: 'QQ Chat Exporter', note: 'Export NTQQ history to TXT, JSON and HTML', href: 'https://qce.sdjz.wiki' },
  { year: '', title: 'MCP Mail and SSH', note: 'Two small MCP servers for tired hands', href: '/works' },
  { year: '2024', title: 'Uapi', note: 'Seventy-seven free endpoints, one rate limiter', href: 'https://uapis.cn' },
  { year: '', title: 'THE FINALS Bot', note: 'A four-platform game bot with a plugin core', href: 'https://github.com/xiaoyueyoqwq/thefinals_qqbot' },
  { year: '', title: 'Clipzy', note: 'Paste text, get a link, forget about it', href: 'https://paste.sdjz.wiki/' },
];

export default async function Page() {
  const { posts } = await getBlogPosts(1);
  const writing = posts.slice(0, 8);

  return (
    <div className="site-column mx-auto px-6 pb-8 pt-12 md:px-0 md:pt-24">
      {/* Identity */}
      <header className="rise flex items-center gap-3" style={{ ['--i' as string]: 0 }}>
        <Image
          src="/shuakami.jpg"
          alt=""
          width={40}
          height={40}
          priority
          className="h-10 w-10 flex-none rounded-[8px] object-cover shadow-card"
        />
        <h1 className="text-[15px] font-medium leading-tight text-ink">Shuakami</h1>
      </header>

      {/* Prose */}
      <div className="mt-8 flex flex-col gap-4 text-[15px] leading-[1.6] text-ink-2 [&_p]:font-[450]">
        <p className="rise" style={{ ['--i' as string]: 1 }}>
          I write software the way one writes a soliloquy: alone, at night, and with more conviction than the
          evidence allows. Most of it ends up on{' '}
          <InlineLink href="https://github.com/shuakami" icon="github">
            GitHub
          </InlineLink>
          , some of it ends up here.
        </p>
        <p className="rise" style={{ ['--i' as string]: 2 }}>
          Lately I build agents that read issues and answer with pull requests, keep a{' '}
          <InlineLink href="https://uapis.cn">free API</InlineLink> alive for a few thousand strangers, and
          collect <InlineLink href="/designs">interface details</InlineLink> the way other people collect
          stamps.
        </p>
        <p className="rise" style={{ ['--i' as string]: 3 }}>
          Off the clock there is <InlineLink href="/music">music</InlineLink>, a handful of{' '}
          <InlineLink href="/games">games</InlineLink>, and a group of{' '}
          <InlineLink href="/friends">friends</InlineLink> who tolerate all of the above. Write to me at{' '}
          <InlineLink href="mailto:shuakami@sdjz.wiki" icon="mail">
            shuakami@sdjz.wiki
          </InlineLink>
          .
        </p>
      </div>

      {/* Writing */}
      <Section title="Writing" href="/archive" className="mt-20">
        {writing.length === 0 ? (
          <p className="py-2 text-[14px] text-ink-3">Nothing has been written yet. The stage is empty and the lights are on.</p>
        ) : (
          <ul className="flex flex-col">
            {writing.map((post, i) => (
              <li key={post.slug} className="rise" style={{ ['--i' as string]: 10 + i }}>
                <Link href={`/post/${post.slug}`} className="post-row group">
                  <span className="post-title text-[14px]">{post.title}</span>
                  <time className="post-date" dateTime={post.date}>
                    {formatShortDate(post.date)}
                  </time>
                  {post.excerpt && <span className="post-excerpt line-clamp-2 text-[13px]">{post.excerpt}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Work */}
      <Section title="Work" href="/works" className="mt-16">
        <ul className="flex flex-col">
          {SELECTED_WORK.map((item, i) => {
            const external = item.href.startsWith('http');
            return (
              <li key={item.title} className="rise" style={{ ['--i' as string]: 4 + i }}>
                <Link
                  href={item.href as never}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group grid grid-cols-[44px_1fr] items-baseline gap-4 py-2.5 sm:grid-cols-[44px_minmax(0,1fr)_auto]"
                >
                  <span className="mono text-[12px] text-ink-3">{item.year}</span>
                  <span className="flex items-center gap-1 text-[14px] font-medium text-ink">
                    {item.title}
                    {external && (
                      <ArrowUpRight
                        className="h-3 w-3 text-ink-3 opacity-0 transition-all duration-300 ease-quint group-hover:translate-x-px group-hover:opacity-100"
                        strokeWidth={2}
                      />
                    )}
                  </span>
                  <span className="col-start-2 text-[13px] text-ink-3 sm:col-start-3 sm:text-right sm:text-[14px]">
                    {item.note}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
