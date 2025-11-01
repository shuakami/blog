import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContributionGrid from '@/components/ContributionGrid';
import { BadgeCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: '关于 - Shuakami',
  description: '一个热爱编程和创作的开发者，喜欢做有趣的东西',
  openGraph: {
    title: '关于 - Shuakami',
    description: '一个热爱编程和创作的开发者，喜欢做有趣的东西',
  },
};

// GitHub Contributions types
type Contribution = {
  date: string;
  count: number;
};

// Helper to get month names
const getMonthName = (monthIndex: number) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthIndex];
};

// Get color class based on contribution count
const getColorClassByCount = (count: number, maxContributions: number) => {
  if (count === 0) return "bg-black/[0.04] dark:bg-white/[0.04]";
  if (maxContributions === 0) return "bg-black/40 dark:bg-white/40";
  
  const percentage = count / maxContributions;
  if (percentage > 0.75) return "bg-black dark:bg-white";
  if (percentage > 0.5) return "bg-black/70 dark:bg-white/70";
  if (percentage > 0.25) return "bg-black/50 dark:bg-white/50";
  return "bg-black/30 dark:bg-white/30";
};

export default async function AboutPage() {
  // Fetch GitHub contributions
  let contributions: Contribution[] = [];
  let totalContributions = 0;
  
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/shuakami?y=last",
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    contributions = data.contributions || [];
    totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error);
  }

  const maxContributions = Math.max(...contributions.map((c) => c.count), 0);

  // Calculate month labels
  const monthLabels = contributions.reduce(
    (acc: { key: string; name: string; firstDay: string }[], c: Contribution) => {
      const month = new Date(c.date).getMonth();
      const year = new Date(c.date).getFullYear();
      const key = `${year}-${month}`;
      if (!acc.find((item) => item.key === key)) {
        acc.push({ key, name: getMonthName(month), firstDay: c.date });
      }
      return acc;
    },
    []
  );

  const positionedMonthLabels = monthLabels
    .map((month) => {
      const dayIndex = contributions.findIndex((c) => c.date === month.firstDay);
      if (dayIndex === -1) return null;
      const weekIndex = Math.floor(dayIndex / 7);
      const position = weekIndex * 16;
      return { ...month, position };
    })
    .filter(Boolean) as { key: string; name: string; firstDay: string; position: number }[];

  const visibleMonthLabels = positionedMonthLabels.reduce(
    (acc: typeof positionedMonthLabels, current) => {
      if (!acc.length) return [current];
      const last = acc[acc.length - 1];
      if (current.position - last.position > 35) {
        acc.push(current);
      }
      return acc;
    },
    []
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 个人简介头部 */}
      <header className="mb-16 md:mb-20">
        <div className="flex flex-col items-center gap-6 md:gap-8 md:flex-row md:items-start">
          {/* 头像 */}
          <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-full border-2 border-black/10 dark:border-white/10">
            <Image
              src="https://uapis.cn/api/v1/avatar/gravatar?email=shuakami@sdjz.wiki&s=512&d=mp"
              alt="Shuakami"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 128px"
              priority
            />
          </div>

          {/* 个人信息 */}
          <div className="flex flex-col gap-6 md:flex-1 text-center md:text-left">
            <div className="space-y-2 md:space-y-3">
              <h1 className="flex items-center gap-2 md:gap-3 text-3xl md:text-5xl font-medium tracking-tight text-black dark:text-white justify-center md:justify-start">
                Shuakami
                {/* 认证标志 */}
                <BadgeCheck className="h-7 w-7 text-blue-500" />
              </h1>
              <p className="text-base leading-relaxed text-black/60 dark:text-white/60">
                Ciallo～(∠・ω&lt; )⌒★
              </p>
            </div>

            {/* 就职信息 */}
            <div className="flex items-center gap-3 text-sm text-black/60 dark:text-white/60 justify-center md:justify-start">
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span>
                目前就职于{" "}
                <span className="font-semibold text-black dark:text-white">Axt Team</span>
              </span>
            </div>

            {/* 技能标签 - 仅桌面端显示 */}
            <div className="hidden md:flex flex-wrap gap-2 md:justify-start">
              {['TypeScript', 'React', 'Next.js', 'Go', 'Python', 'Rust', 'Tailwind CSS'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* 社交链接 */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <a
                href="https://github.com/shuakami"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
              <a
                href="https://twitter.com/luoxiaohei_2333"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a
                href="mailto:shuakami@sdjz.wiki"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Email"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="space-y-20">
        {/* 技术栈 */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-4">
              技术栈
            </h2>
            <div className="w-12 h-[1.5px] bg-black/20 dark:bg-white/20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black dark:text-white">前端开发</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  JavaScript
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  TypeScript
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  React
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Next.js
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Vue.js
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Tailwind CSS
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Framer Motion
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black dark:text-white">后端开发</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Go
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Node.js
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Python
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  PostgreSQL
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Redis
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black dark:text-white">AI & 自动化</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  OpenAI API
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  LangChain
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Agent Framework
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  MCP Protocol
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-black dark:text-white">工具 & 平台</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Git
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Docker
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  Linux
                </span>
                <span className="px-3 py-1.5 text-sm rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/70 dark:text-white/70">
                  GitHub Actions
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 项目与成就 */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-4">
              项目与成就
            </h2>
            <div className="w-12 h-[1.5px] bg-black/20 dark:bg-white/20" />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-5 py-5 md:px-8 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* 左侧数据 */}
                <div className="flex flex-wrap gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 lg:gap-x-12">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">476+</h4>
                    <p className="text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">GitHub Stars</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">7,000+</h4>
                    <p className="text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">项目用户</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">2,132</h4>
                    <p className="text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">年度贡献</p>
                </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">548万+</h4>
                    <p className="text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">API 调用量</p>
                </div>
                </div>
                
                {/* 右侧按钮 */}
                <div className="flex flex-col gap-2 md:items-end md:flex-shrink-0 w-full md:w-auto">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors whitespace-nowrap w-full md:w-auto"
                  >
                    找我做项目？
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-base text-black/60 dark:text-white/60 leading-relaxed">
              我在 GitHub 上维护了多个开源项目，涵盖 企业官网、AI Agent、自动化工具、API 服务、聊天机器人等领域。
              项目被广泛使用，获得了社区的认可和支持。同时也参与了一些商业项目的开发，
              积累了丰富的实战经验。
            </p>
          </div>
        </section>

        {/* GitHub 贡献统计 */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-4">
              GitHub 统计
            </h2>
            <div className="w-12 h-[1.5px] bg-black/20 dark:bg-white/20" />
          </div>

          {contributions.length > 0 && (
            <>
              <p className="text-base text-black/60 dark:text-white/60">
                今年提交了 <span className="font-semibold text-black dark:text-white">{totalContributions.toLocaleString()}</span> 次代码
              </p>

              <ContributionGrid
                contributions={contributions}
                maxContributions={maxContributions}
                visibleMonthLabels={visibleMonthLabels}
              />
            </>
          )}
        </section>

        {/* 联系方式 */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-4">
              联系方式
            </h2>
            <div className="w-12 h-[1.5px] bg-black/20 dark:bg-white/20" />
          </div>

          <div className="space-y-4">
            <p className="text-base text-black/60 dark:text-white/60 leading-relaxed">
              如果你对我的项目感兴趣，或者有任何问题和合作意向，欢迎通过以下方式联系我：
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://github.com/shuakami"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-medium">GitHub</span>
                <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                </svg>
              </a>

              <a
                href="mailto:shuakami@sdjz.wiki"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="font-medium">Email</span>
                <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                </svg>
              </a>

              <a
                href="https://qm.qq.com/q/S3ZfnvvL2K"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/>
                </svg>
                <span className="font-medium">QQ</span>
                <svg className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 