import type { Metadata } from 'next';
import Image from 'next/image';
import ContributionGrid from '@/components/ContributionGrid';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/about/Reveal';
import { Tally } from '@/components/about/Tally';
import { getGitHubStats } from '@/lib/github';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who writeth here, and what he doth with his hands.',
};

export const revalidate = 3600;

type Contribution = { date: string; count: number };

const STACK: { name: string; items: string[] }[] = [
  { name: 'Face', items: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'Framer Motion'] },
  { name: 'Bones', items: ['Node', 'Go', 'Python', 'Redis', 'PostgreSQL'] },
  { name: 'Agents', items: ['LLM tooling', 'MCP servers', 'Bots on four platforms'] },
  { name: 'Ground', items: ['Vercel', 'Docker', 'Linux', 'GitHub Actions'] },
];

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/shuakami', note: 'Where the code doth live' },
  { label: 'Twitter', href: 'https://twitter.com/luoxiaohei_2333', note: 'Brief thoughts, unamended' },
  { label: 'Mail', href: 'mailto:shuakami@sdjz.wiki', note: 'shuakami@sdjz.wiki' },
  { label: 'QQ group', href: 'https://qm.qq.com/q/S3ZfnvvL2K', note: 'A merry, noisy room' },
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
    { k: 'Stars bestowed', v: `${totalStars.toLocaleString('en-US')}+` },
    { k: 'Souls who use the tools', v: '7,000+' },
    { k: 'Commits this twelvemonth', v: yearContributions.toLocaleString('en-US') },
    { k: 'API calls served', v: '18.5M+' },
  ];

  return (
    <div className="site-column mx-auto px-6 pb-8 pt-14 md:px-0 md:pt-28">
      <Reveal as="header" blur className="flex items-center gap-4">
        <Image src="/friends/assets/avatars/shuakami.jpg" alt="" width={640} height={640} sizes="48px" className="h-11 w-11 flex-none rounded-full object-cover" priority />
        <h1 className="text-[1.625rem] md:text-[2rem] font-bold leading-none tracking-[-0.045em] text-ink">Shuakami</h1>
      </Reveal>

      <Reveal blur delay={0.05} className="mt-12 md:mt-20">
        <Section title="Tallies">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 pt-4 sm:grid-cols-4">
            {numbers.map((n, i) => (
              <Reveal key={n.k} delay={0.12 + i * 0.07} className="flex flex-col-reverse justify-end gap-2">
                <dt className="text-[0.9375rem] italic text-ink-3">{n.k}</dt>
                <dd className="text-[1.75rem] md:text-[2.25rem] font-bold leading-none tracking-[-0.04em] text-ink">
                  <Tally value={n.v} delay={0.15 + i * 0.07} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </Section>
      </Reveal>

      {contributions.length > 0 && (
        <Reveal blur delay={0.05} className="mt-14 md:mt-24">
          <Section title="The year gone by" href="https://github.com/shuakami" action="GitHub">
            <div className="pt-4">
              <ContributionGrid contributions={contributions} maxContributions={maxContributions} />
            </div>
          </Section>
        </Reveal>
      )}

      <Reveal blur delay={0.05} className="mt-14 md:mt-24">
        <Section title="Tools of the trade">
          <dl className="flex flex-col gap-5 pt-4">
            {STACK.map((row, i) => (
              <Reveal key={row.name} delay={0.1 + i * 0.06} className="grid grid-cols-1 gap-2 sm:grid-cols-[6rem_1fr] sm:gap-6">
                <dt className="pt-0.5 text-[1rem] italic text-ink-3">{row.name}</dt>
                <dd className="text-[1rem] md:text-[1.125rem] font-medium leading-[1.55] text-ink">
                  {row.items.map((it, i) => (
                    <span key={it} className="inline-flex items-center">
                      {it}
                      {i < row.items.length - 1 && <span className="lozenge mx-3 text-ink-3" aria-hidden />}
                    </span>
                  ))}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Section>
      </Reveal>

      <Reveal blur delay={0.05} className="mt-14 md:mt-24">
        <Section title="Elsewhere">
          <ul className="flex flex-col pt-1">
            {LINKS.map((l, i) => (
              <Reveal as="li" key={l.label} delay={0.1 + i * 0.06}>
                <a
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="post-row"
                >
                  <span className="post-title">{l.label}</span>
                  <span className="post-date">{l.note}</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </Section>
      </Reveal>
    </div>
  );
}
