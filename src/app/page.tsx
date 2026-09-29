import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { getBlogPosts } from '@/utils/posts';
import { Section } from '@/components/ui/section';
import { InlineLink } from '@/components/ui/inline-link';
import { formatShortDate } from '@/lib/format';

export const revalidate = 30;

const SELECTED_WORK = [
  { year: '2025', title: 'Ciallo Agent', note: 'Answereth issues with pull requests', href: 'https://agent.sdjz.wiki' },
  { year: '', title: 'QQ Chat Exporter', note: 'Old chatter, saved from oblivion', href: 'https://qce.sdjz.wiki' },
  { year: '', title: 'MCP Mail and SSH', note: 'Two servants for tired hands', href: '/works' },
  { year: '2024', title: 'Uapi', note: 'Seven and seventy doors, all open', href: 'https://uapis.cn' },
  { year: '', title: 'THE FINALS Bot', note: 'A bot that serveth four masters', href: 'https://github.com/xiaoyueyoqwq/thefinals_qqbot' },
  { year: '', title: 'Clipzy', note: 'Paste it, share it, forget it', href: 'https://paste.sdjz.wiki/' },
];

export default async function Page() {
  const { posts } = await getBlogPosts(1);
  const writing = posts.slice(0, 8);

  return (
    <div className="site-column mx-auto px-6 pb-8 pt-14 md:px-0 md:pt-28">
      <header className="flex items-center gap-4">
        <Image
          src="/shuakami.jpg"
          alt=""
          width={56}
          height={56}
          priority
          className="h-14 w-14 flex-none rounded-[12px] object-cover"
        />
        <h1 className="text-[2rem] font-bold leading-none tracking-[-0.045em] text-ink">Shuakami</h1>
      </header>

      <div className="mt-12 text-[1.3125rem] leading-[1.6] tracking-[-0.015em] text-ink-body">
        <p className="font-[450]">
          My name is Shuakami, pronounced <span className="mono whitespace-nowrap text-[0.85em] text-ink">/ʃwɑːkɑːmiː/</span>
        </p>
        <ul className="mt-8 flex flex-col gap-4 font-[450]">
          {[
            <>I love creating beautiful, simple, and delightful UI/UX with a passion for animations</>,
            <>My favorite design style is the Geist Design System by Vercel</>,
            <>I enjoy playing games like Cyberpunk 2077, The Last of Us, THE FINALS, Honor of Kings, and PUBG Mobile</>,
            <>
              I&rsquo;m usually quite busy, so my maintenance of open-source projects might be a bit slow. But rest assured, I
              will still read and address the issues
            </>,
            <>
              I finally did what I&rsquo;ve always dreamed of, I created a design system! Feel free to check it out{' '}
              <InlineLink href="https://design.sdjz.wiki/">
                design.sdjz.wiki
              </InlineLink>
            </>,
            <>
              I&rsquo;m working on a new project,{' '}
              <InlineLink href="https://github.com/shuakami/timetable" icon="github">
                嘎嘎课程表
              </InlineLink>
              !
            </>,
          ].map((line, i) => (
            <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
              <span className="lozenge mt-[0.62em] text-ink-3" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <Section title="Writings" href="/archive" className="mt-28">
        {writing.length === 0 ? (
          <p className="py-2 text-[1.0625rem] italic text-ink-3">Nothing yet is writ. The ink is dry, the page is patient.</p>
        ) : (
          <ul className="flex flex-col">
            {writing.map((post, i) => (
              <li key={post.slug}>
                <Link href={`/post/${post.slug}`} className="post-row">
                  <span className="post-title">{post.title}</span>
                  <time className="post-date" dateTime={post.date}>
                    {formatShortDate(post.date)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Works" href="/works" className="mt-24">
        <ul className="flex flex-col">
          {SELECTED_WORK.map((item, i) => {
            const external = item.href.startsWith('http');
            return (
              <li key={item.title}>
                <Link
                  href={item.href as never}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
                >
                  <span className="text-[0.9375rem] italic text-ink-3">{item.year}</span>
                  <span className="flex items-center gap-1.5 text-[1.1875rem] font-semibold tracking-[-0.015em] text-ink">
                    {item.title}
                    {external && (
                      <ArrowUpRight
                        className="h-4 w-4 text-ink-3 opacity-0 group-hover:opacity-100"
                        strokeWidth={2}
                      />
                    )}
                  </span>
                  <span className="col-start-2 text-[1rem] text-ink-3 sm:col-start-3 sm:text-right">{item.note}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
