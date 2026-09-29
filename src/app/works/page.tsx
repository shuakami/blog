import type { Metadata } from 'next';
import Image from 'next/image';
import { ImageCarousel } from '@/components/ImageCarousel';
import ProjectBanner from '@/components/ProjectBanner';
import CialloParticleBanner from '@/components/CialloParticleBanner';
import WorksNavigator from '@/components/WorksNavigator';
import { GitHubStatsHeader } from '@/components/GitHubStatsDisplay';
import { RepoStatsValue } from '@/components/RepoStatsValue';
import React from 'react';
import { ArrowUpRight, Code2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Works',
  description: 'Things made by Shuakami, starred four hundred times and used by seven thousand souls.',
  openGraph: {
    title: 'Works',
    description: 'Things made by Shuakami, starred four hundred times and used by seven thousand souls.',
  },
};

interface Work {
  title: string;
  description: string; // 项目详细描述
  repo?: string; // GitHub 仓库（开源项目）
  tags: string[];
  year: string;
  // 最重要的链接
  demo?: string; // Demo 链接
  website?: string; // 官网
  article?: string; // 技术文章/博客
  video?: string; // 演示视频
  ranking?: string; // SEO 排名验证链接
  preview?: string; // 单张预览图
  previews?: (string | React.ReactNode)[]; // 多张预览图（轮播），支持自定义组件
  customBanner?: React.ReactNode; // 自定义Banner（用于渐变背景+icon+文字）
  // 项目数据/亮点
  stats?: {
    label: string;
    value: string | React.ReactNode;
  }[];
  highlights?: string[]; // 核心亮点，例如：["自研限流器", "10个商业接口"]
  opensource?: boolean; // 是否开源
}

const works: Work[] = [
  {
    title: 'Uapi',
    description: 'A free API with seven and seventy endpoints, ten of them fit for commerce. Built end to end in Go and Next.js, guarded by a rate limiter of mine own making, and home to some endpoints for QQ avatars, names and groups found nowhere else.',
    tags: ['Go', 'Next.js', 'API', 'Full Stack'],
    year: '2024 onward',
    previews: [
      <ProjectBanner
        key="uapipro"
        title="UapiPro"
        icon={
          <Image
            src="https://uapis.cn/favicon.svg"
            alt="UapiPro"
            width={80}
            height={80}
            className="w-full h-full brightness-0 invert"
          />
        }
        linearFrom="#0099FF"
        linearTo="#B8F2FF"
        radialColor="#BCF0D3"
      />,
      'https://cdn.sdjz.wiki/background/uapi_project_home.png',
      'https://cdn.sdjz.wiki/background/uapi_project_test_api.png'
    ],
    website: 'https://uapis.cn',
    ranking: 'https://cn.bing.com/search?q=%E5%85%8D%E8%B4%B9api',
    opensource: false,
    stats: [
      { label: 'Calls answered', value: '18.5M+' },
      { label: 'Users served', value: '7,400+' },
      { label: 'Endpoints', value: '77' }
    ],
    highlights: ['Fifth on Bing for "免费API"', 'Exclusive QQ avatar and name API', 'Home-made rate limiter', 'Commercial grade endpoints']
  },
  {
    title: 'QQ Chat Exporter',
    description: 'Rescueth QQ chat history, stickers and all, from the newest NTQQ. Messages, images and words go out as TXT, JSON or HTML, through an interface fair enough that a novice need fear nothing.',
    repo: 'shuakami/qq-chat-exporter',
    tags: ['TypeScript', 'Agent', 'React', 'Node.js'],
    year: '2025 onward',
    preview: 'https://uapis.cn/static/uploads/9b40136f08_slabUbc1YxgT.webp',
    website: 'https://qce.sdjz.wiki',
    stats: [
      { label: 'GitHub Stars', value: <RepoStatsValue repoName="qq-chat-exporter" type="stars" fallback={338} /> },
      { label: 'GitHub Forks', value: <RepoStatsValue repoName="qq-chat-exporter" type="forks" fallback={20} /> },
      { label: 'Formats', value: '3' }
    ],
    highlights: ['Speaks NTQQ', 'A handsome interface', 'Kind to beginners']
  },
  {
    title: 'Ciallo Agent',
    description: 'An autonomous agent sworn to GitHub issues. It readeth the complaint, findeth the guilty code, proposeth a remedy and openeth the pull request itself. No mere chatterbox: pose the question, and Ciallo will reason, test, amend and act until the matter is mended.',
    tags: ['AI Agent', 'GitHub', 'Automation', 'Next.js'],
    year: '2025 onward',
    website: 'https://agent.sdjz.wiki',
    opensource: false,
    customBanner: <CialloParticleBanner />,
    stats: [
      { label: 'Judgement', value: 'Its own' },
      { label: 'Domain', value: 'Issues' },
      { label: 'Autonomy', value: 'Whole' }
    ],
    highlights: ['Analyseth and solveth issues', 'Openeth pull requests', 'Configurable knowledge', 'Waketh at every hour']
  },
  {
    title: 'THE FINALS Bot',
    description: 'A bot for THE FINALS that serveth four masters: QQ, QQ Channels, HeyBox and Kook. Beneath it lieth PluginCore, a loosely joined plugin system of mine own, a full wrapper over Tencent qqbotpy, and a pooled browser that paints its images in a hundred milliseconds. It telleth of players, leaderboards and weapons.',
    repo: 'xiaoyueyoqwq/thefinals_qqbot',
    tags: ['Python', 'FastAPI', 'Redis', 'Docker', 'Plugin System'],
    year: '2024 onward',
    previews: [
      <ProjectBanner
        key="thefinals"
        title="THE FINALS Bot"
        linearFrom="#0c4a6e"
        linearTo="#0e7490"
        radialColor="#06b6d4"
      />,
      'https://uapis.cn/static/uploads/9b40156814_qHUBoLcHkD83.webp',
      'https://uapis.cn/static/uploads/9b401604de_pyzc3urW3gpg.webp'
    ],
    stats: [
      { label: 'To paint an image', value: '100ms' },
      { label: 'Platforms', value: '4' },
      { label: 'Architecture', value: 'Plugins' },
      { label: 'Messages a month', value: '4,400+' }
    ],
    highlights: ['Plugin architecture', 'messageAPI wrapper', 'Many providers', 'Pooled browsers', 'Swift images']
  },
  {
    title: 'AmyAlmond Bot',
    description: 'A ChatGPT companion for QQ groups, that speaketh many tongues, remembereth what was said long ago, and runneth errands unbidden, so that the chatter groweth wiser and merrier.',
    repo: 'shuakami/amyalmond_bot',
    tags: ['Python', 'ChatGPT', 'NLP', 'AI'],
    year: '2024',
    previews: [
      'https://uapis.cn/static/uploads/9b40177c4f_RQt4VGle16ZU.webp',
      'https://uapis.cn/static/uploads/9b40179249_50rY9g3itwpy.webp'
    ],
    stats: [
      { label: 'GitHub Stars', value: <RepoStatsValue repoName="amyalmond_bot" type="stars" fallback={33} /> },
      { label: 'GitHub Forks', value: <RepoStatsValue repoName="amyalmond_bot" type="forks" fallback={4} /> },
      { label: 'Models', value: 'Any' }
    ],
    highlights: ['Uncommonly clever', 'Long memory', 'Many tongues']
  },
  {
    title: 'Vaiiya',
    description: 'The house of a fictional company from THE FINALS, which I helped to build. Framer Motion driveth its frame by frame scrolling, and Three.js raiseth a storm of particles behind, that the eye be struck at every turn.',
    tags: ['Next.js', 'Framer Motion', 'Three.js', 'Animation'],
    year: '2024 onward',
    preview: 'https://uapis.cn/static/uploads/9b40181453_U9KJYRA5abMn.webp',
    website: 'https://vaiiya.org/',
    opensource: false,
    stats: [
      { label: 'Frame animation', value: 'Fine' },
      { label: 'Damping', value: 'True' },
      { label: 'Stutter', value: 'None' }
    ],
    highlights: ['Framer Motion frames', 'Three.js particles', 'THE FINALS livery']
  },
  {
    title: 'Clipzy',
    description: 'A clipboard upon the web, spare and exquisite, that serveth also as image host and link shortener. Swift beyond reason, light of motion, and every detail set where it belongeth.',
    tags: ['Next.js', 'React', 'UI/UX', 'Web App'],
    year: '2024 onward',
    preview: 'https://uapis.cn/static/uploads/9b401844e1_ODeri7SLeH4p.webp',
    website: 'https://paste.sdjz.wiki/',
    ranking: 'https://cn.bing.com/search?q=%E5%9C%A8%E7%BA%BF%E5%89%AA%E5%88%87%E6%9D%BF',
    opensource: false,
    stats: [
      { label: 'Uses', value: 'Three in one' },
      { label: 'Speed', value: 'Fierce' },
      { label: 'Finish', value: 'Fine' }
    ],
    highlights: ['Sixth on Bing for "在线剪切板"', 'Fierce performance', 'Delicate motion', 'Many uses']
  },
  {
    title: 'MCP Mail Tool',
    description: 'An MCP server that lendeth AI the power of the post. It sorteth, answereth and searcheth thy mail, that the machine may bear the burden of the inbox in thy stead.',
    repo: 'shuakami/mcp-mail',
    tags: ['TypeScript', 'Email', 'AI', 'Productivity'],
    year: '2025 onward',
    customBanner: (
      <ProjectBanner
        title="MCP Mail Tool"
        description="Mail, managed by the machine"
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        }
        linearFrom="#6366f1"
        linearTo="#a5b4fc"
        radialColor="#c7d2fe"
      />
    ),
    stats: [
      { label: 'GitHub Stars', value: <RepoStatsValue repoName="mcp-mail" type="stars" fallback={40} /> },
      { label: 'GitHub Forks', value: <RepoStatsValue repoName="mcp-mail" type="forks" fallback={6} /> },
      { label: 'Protocol', value: 'MCP' }
    ],
    highlights: ['AI at the post', 'Clever sorting', 'Replies unbidden']
  },
  {
    title: 'SSH MCP Tool',
    description: 'An MCP server that giveth AI the keys to SSH. It keepeth many servers, runneth commands and carrieth files between them, a faithful steward for those who toil at operations.',
    repo: 'shuakami/mcp-ssh',
    tags: ['TypeScript', 'SSH', 'DevOps', 'Automation'],
    year: '2025 onward',
    customBanner: (
      <ProjectBanner
        title="SSH MCP Tool"
        description="Servers, kept by the machine"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
        }
        linearFrom="#1e293b"
        linearTo="#334155"
        radialColor="#64748b"
      />
    ),
    stats: [
      { label: 'GitHub Stars', value: <RepoStatsValue repoName="mcp-ssh" type="stars" fallback={30} /> },
      { label: 'GitHub Forks', value: <RepoStatsValue repoName="mcp-ssh" type="forks" fallback={5} /> },
      { label: 'Protocol', value: 'MCP' }
    ],
    highlights: ['AI at the terminal', 'Tmux within', 'Operations, automated']
  },
  {
    title: 'kkp',
    description: 'A small assassin for occupied ports. When a port is held against thee, one command from kkp shall free it, on Windows, macOS or Linux alike, with nothing to configure.',
    repo: 'shuakami/kkp',
    tags: ['TypeScript', 'CLI', 'Cross-platform', 'DevTools'],
    year: '2025',
    preview: 'https://uapis.cn/static/uploads/9b40b69a53_gzizOvk5gt2P.webp',
    website: 'https://www.npmjs.com/package/@sdjz/kkp',
    stats: [
      { label: 'GitHub Stars', value: <RepoStatsValue repoName="kkp" type="stars" fallback={5} /> },
      { label: 'GitHub Forks', value: <RepoStatsValue repoName="kkp" type="forks" fallback={0} /> },
      { label: 'Platforms', value: '3' }
    ],
    highlights: ['Slayeth ports in one blow', 'Every platform', 'Nothing to configure']
  },
];

function getSocialifyUrl(repo: string) {
  const params = new URLSearchParams({
    description: '1',
    font: 'Source Code Pro',
    forks: '1',
    issues: '1',
    language: '1',
    owner: '1',
    pattern: 'Circuit Board',
    pulls: '1',
    stargazers: '1',
    theme: 'Light'
  });
  
  return `https://socialify.git.ci/${repo}/image?${params.toString()}`;
}

function workHref(work: Work) {
  return work.website || (work.repo ? `https://github.com/${work.repo}` : undefined);
}

export default function WorksPage() {
  return (
    <div className="mx-auto w-full max-w-[64rem] px-6 pb-8 pt-14 md:px-12 md:pt-28">
      <header className="max-w-[46rem]">
        <h1 className="display text-[clamp(3rem,5vw,5rem)]">Works</h1>
        <GitHubStatsHeader />
      </header>

      <div className="mt-24 flex flex-col">
        {works.map((work, index) => {
          const workId = work.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          const href = workHref(work);
          return (
            <React.Fragment key={work.title}>
              {index > 0 && <span className="hedera mx-auto my-24 text-[1.5rem] text-ink-3" aria-hidden />}
              <article id={workId} data-work-index={index} className="scroll-mt-24">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                  <h2 className="display text-[clamp(2.25rem,3.4vw,3.5rem)]">{work.title}</h2>
                  <span className="shrink-0 text-[1.0625rem] italic text-ink-3">{work.year}</span>
                </div>

                <div className="mt-8 overflow-hidden rounded-[12px] bg-[rgba(var(--ink-rgb),0.04)]">
                  {work.customBanner ? (
                    <div className="relative aspect-video sm:aspect-2/1">{work.customBanner}</div>
                  ) : (
                    <a href={href ?? '#'} target="_blank" rel="noopener noreferrer" className="relative block aspect-video sm:aspect-2/1">
                      {work.previews && work.previews.length > 0 ? (
                        <ImageCarousel images={work.previews} alt={work.title} priority={index < 2} />
                      ) : (
                        <Image
                          src={work.preview || (work.repo ? getSocialifyUrl(work.repo) : '/placeholder.png')}
                          alt={work.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 64rem"
                          className="object-cover"
                          quality={95}
                          priority={index < 2}
                          unoptimized={!!work.preview}
                        />
                      )}
                    </a>
                  )}
                </div>

                <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
                  <div className="flex flex-col gap-8">
                    <p className="dropcap text-[1.25rem] leading-[1.65] tracking-[-0.012em] text-ink-body">{work.description}</p>

                    {work.highlights && work.highlights.length > 0 && (
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[1.0625rem] font-medium italic text-ink">
                        {work.highlights.map((h, i) => (
                          <span key={h} className="inline-flex items-center gap-3">
                            {i === 0 && work.ranking ? (
                              <a href={work.ranking} target="_blank" rel="noopener noreferrer" className="ink-link">
                                {h}
                              </a>
                            ) : (
                              h
                            )}
                            {i < work.highlights!.length - 1 && <span className="lozenge text-ink-3" aria-hidden />}
                          </span>
                        ))}
                      </p>
                    )}

                    <p className="caps flex flex-wrap gap-x-4 gap-y-1">
                      {work.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </p>
                  </div>

                  <aside className="flex flex-col gap-8">
                    {work.stats && work.stats.length > 0 && (
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-1">
                        {work.stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col gap-1.5">
                            <dd className="text-[2rem] font-bold leading-none tracking-[-0.04em] text-ink">{stat.value}</dd>
                            <dt className="text-[0.9375rem] italic text-ink-3">{stat.label}</dt>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {work.website && (
                        <a href={work.website} target="_blank" rel="noopener noreferrer" className="pill">
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                          <span>Visit</span>
                        </a>
                      )}
                      {work.repo && (
                        <a href={`https://github.com/${work.repo}`} target="_blank" rel="noopener noreferrer" className="pill">
                          <Code2 className="h-4 w-4" strokeWidth={1.75} />
                          <span>Source</span>
                        </a>
                      )}
                    </div>
                  </aside>
                </div>
              </article>
            </React.Fragment>
          );
        })}
      </div>

      <WorksNavigator workCount={works.length} workTitles={works.map((work) => work.title)} />
    </div>
  );
}
