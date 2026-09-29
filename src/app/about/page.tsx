import type { Metadata } from 'next';
import Image from 'next/image';
import ContributionGrid from '@/components/ContributionGrid';
import { Section } from '@/components/ui/section';
import { InlineLink } from '@/components/ui/inline-link';
import { getGitHubStats } from '@/lib/github';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who is writing this, and what they are doing with their hands.',
};

export const revalidate = 3600;

type Contribution = { date: string; count: number };

const STACK: { name: string; items: string[] }[] = [
  { name: 'Front', items: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Framer Motion'] },
  { name: 'Back', items: ['Node', 'Go', 'Python', 'Redis', 'PostgreSQL'] },
  { name: 'Agents', items: ['LLM tooling', 'MCP servers', 'Bots on four platforms'] },
  { name: 'Ground', items: ['Vercel', 'Docker', 'Linux', 'GitHub Actions'] },
];

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/shuakami', note: 'Where the code lives' },
  { label: 'Twitter', href: 'https://twitter.com/luoxiaohei_2333', note: 'Short thoughts, unedited' },
  { label: 'Mail', href: 'mailto:shuakami@sdjz.wiki', note: 'shuakami@sdjz.wiki' },
  { label: 'QQ group', href: 'https://qm.qq.com/q/S3ZfnvvL2K', note: 'The noisy room' },
];

export default async function AboutPage() {
  const stats = await getGitHubStats();
  const totalStars = stats?.totalStars ?? 476;
  const yearContributions = stats?.contributions ?? 2132;

  let contributions: Contribution[] = [];
  try {
    const res = await fetch('https://github-contributions-api.jogruber.de/v4/shuakami?y=last', {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    contributions = data.contributions || [];
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error);
  }
  const maxContributions = Math.max(...contributions.map((c) => c.count), 0);

  const numbers = [
    { k: 'Stars', v: `${totalStars.toLocaleString('en-US')}+` },
    { k: 'People using the tools', v: '7,000+' },
    { k: 'Commits, past year', v: yearContributions.toLocaleString('en-US') },
    { k: 'API calls served', v: '18.5M+' },
  ];

  return (
    <div className="site-column mx-auto px-6 pb-8 pt-12 md:px-0 md:pt-24">
      <header className="rise flex items-start gap-4" style={{ ['--i' as string]: 0 }}>
        <Image src="/shuakami.jpg" alt="Shuakami" width={44} height={44} className="h-11 w-11 rounded-full object-cover" priority />
        <div className="flex flex-col gap-1 pt-0.5">
          <h1 className="text-[14px] font-medium text-ink">Shuakami</h1>
          <p className="text-[13px] text-ink-3">Student, developer, occasional villain in his own commit history</p>
        </div>
      </header>

      <div className="rise mt-10 flex flex-col gap-4 text-[15px] leading-[1.65] text-ink-2" style={{ ['--i' as string]: 1 }}>
        <p>
          I build small things that many people end up using: an{' '}
          <InlineLink href="https://agent.sdjz.wiki">agent</InlineLink> that answers GitHub issues with pull
          requests, a <InlineLink href="https://uapis.cn">public API</InlineLink> that has now been asked
          eighteen million questions, a handful of bots that live in chat rooms and answer to no one.
        </p>
        <p>
          I like the parts of software most people skip: the empty state, the loading screen, the
          error nobody expects to read. If a thing must exist, it should at least be well made.
        </p>
        <p>
          When not writing code I am usually listening to music, drawing, or arguing with myself
          about typography. This site is where the arguments get written down.
        </p>
      </div>

      <Section title="Numbers" className="rise mt-16" >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 pt-2 sm:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.k} className="flex flex-col gap-1">
              <dd className="mono text-[18px] text-ink">{n.v}</dd>
              <dt className="text-[12px] text-ink-3">{n.k}</dt>
            </div>
          ))}
        </dl>
      </Section>

      {contributions.length > 0 && (
        <Section title="Past year" className="rise mt-16" href="https://github.com/shuakami" action="GitHub">
          <div className="pt-2">
            <ContributionGrid contributions={contributions} maxContributions={maxContributions} />
          </div>
        </Section>
      )}

      <Section title="Stack" className="rise mt-16">
        <ul className="flex flex-col pt-1">
          {STACK.map((row) => (
            <li key={row.name} className="grid grid-cols-[72px_1fr] gap-4 border-b border-line-soft py-2.5 last:border-0">
              <span className="text-[13px] text-ink-3">{row.name}</span>
              <span className="flex flex-wrap gap-1.5">
                {row.items.map((it) => (
                  <span key={it} className="chip">
                    {it}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Elsewhere" className="rise mt-16">
        <ul className="flex flex-col pt-1">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="post-row"
              >
                <span className="post-title text-[14px]">{l.label}</span>
                <span className="post-date">{l.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
