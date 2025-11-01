import type { Metadata } from 'next';
import Image from 'next/image';
import { ImageCarousel } from '@/components/ImageCarousel';
import ProjectBanner from '@/components/ProjectBanner';
import CialloParticleBanner from '@/components/CialloParticleBanner';
import WorksNavigator from '@/components/WorksNavigator';
import React from 'react';

export const metadata: Metadata = {
  title: '作品 - Shuakami',
  description: '我做的一些有趣的东西，获得了 476 颗星标，7000+ 人在用',
  openGraph: {
    title: '作品 - Shuakami',
    description: '我做的一些有趣的东西，获得了 476 颗星标，7000+ 人在用',
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
    label: string; // 例如："调用次数"、"用户数"、"接口数量"
    value: string; // 例如："548万"、"7455"、"77个"
  }[];
  highlights?: string[]; // 核心亮点，例如：["自研限流器", "10个商业接口"]
  opensource?: boolean; // 是否开源
}

const works: Work[] = [
  {
    title: 'Uapi',
    description: '这是一个免费API项目，目前已经有77个接口。其中包含10个商业接口。项目使用了Go/Next.js进行全栈构建，使用了自研的限流器。包含一些QQ头像、名称，QQ群信息的独家api接口。',
    tags: ['Go', 'Next.js', 'API', 'Full Stack'],
    year: '2024 - 至今',
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
      { label: 'API 调用量', value: '548万+' },
      { label: '服务用户', value: '7,400+' },
      { label: '接口数量', value: '77个' }
    ],
    highlights: ['必应搜索"免费API"排名第5', '独家QQ头像名称API', '自研限流器', '商业级接口']
  },
  {
    title: 'QQ Chat Exporter',
    description: 'QQ聊天记录导出工具，支持聊天记录和表情包导出。可以导出消息图片、文字，支持导出为TXT/JSON/HTML等多种格式。支持最新版的NTQQ，而且有很美观的UI界面，对新手很友好。',
    repo: 'shuakami/qq-chat-exporter',
    tags: ['TypeScript', 'Agent', 'React', 'Node.js'],
    year: '2025 - 至今',
    preview: 'https://uapis.cn/static/uploads/b0e8cb70e59ee007f68ced7bbd8974e8.png',
    website: 'https://qce.sdjz.wiki',
    stats: [
      { label: 'GitHub Stars', value: '338' },
      { label: 'GitHub Forks', value: '20' },
      { label: '支持格式', value: '3种' }
    ],
    highlights: ['支持NTQQ', '美观UI界面', '新手友好']
  },
  {
    title: 'Ciallo Agent',
    description: '自主 AI 代理框架，专门用于处理 GitHub Issue。它能够自动分析问题、定位代码、提供解决方案、甚至直接提交 PR。不是简单的聊天机器人，而是真正能独立思考和行动的智能系统。你只需要提出问题，Ciallo 会自主分析、验证、调整和执行，直到问题解决。',
    tags: ['AI Agent', 'GitHub', 'Automation', 'Next.js'],
    year: '2025 - 至今',
    website: 'https://agent.sdjz.wiki',
    opensource: false,
    customBanner: <CialloParticleBanner />,
    stats: [
      { label: '核心能力', value: '自主决策' },
      { label: '应用场景', value: 'GitHub Issue' },
      { label: '智能程度', value: '完全自主' }
    ],
    highlights: ['自动分析并解决 Issue', '直接提交 PR', '支持配置知识库', '7x24 小时在线']
  },
  {
    title: 'THE FINALS Bot',
    description: '《THE FINALS》游戏的全功能多平台机器人，采用高度解耦的插件化架构。自研 PluginCore 插件系统，针对腾讯的 qqbotpy 做了完整的 messageAPI 封装，实现了独特的多提供商抽象层。浏览器池化和截图系统让图片生成速度达到 100ms。支持 QQ、QQ频道、HeyBox、Kook 四个平台，提供玩家数据、排行榜、武器统计等功能。',
    repo: 'xiaoyueyoqwq/thefinals_qqbot',
    tags: ['Python', 'FastAPI', 'Redis', 'Docker', 'Plugin System'],
    year: '2024 - 至今',
    previews: [
      <ProjectBanner
        key="thefinals"
        title="THE FINALS Bot"
        linearFrom="#0c4a6e"
        linearTo="#0e7490"
        radialColor="#06b6d4"
      />,
      'https://uapis.cn/static/uploads/cbec854d4bef2918bc3173121adfc110.jpg',
      'https://uapis.cn/static/uploads/b8a75abe18d46e3e38a11947e6646b66.jpg',
      'https://uapis.cn/static/uploads/3083f80cb86e1e6700cf71972a5078cf.jpg'
    ],
    stats: [
      { label: '图片生成', value: '100ms' },
      { label: '支持平台', value: '4个' },
      { label: '架构模式', value: '插件化' },
      { label: '月消息量', value: '4400+' }
    ],
    highlights: ['插件化架构', 'messageAPI 封装', '多提供商支持', '浏览器池化', '极速图片生成']
  },
  {
    title: 'AmyAlmond Bot',
    description: '基于 ChatGPT 的智能QQ聊天机器人，专为 QQ 群聊设计。支持多语言对话、上下文感知、长期记忆管理和高级自动化任务，让群聊变得更智能有趣。',
    repo: 'shuakami/amyalmond_bot',
    tags: ['Python', 'ChatGPT', 'NLP', 'AI'],
    year: '2024',
    previews: [
      'https://uapis.cn/static/uploads/60b7c761b90221bb68f72a20f0852e2e.png',
      'https://uapis.cn/static/uploads/8a1bc513b065b8bfa8761cc6c33f2d22.png'
    ],
    stats: [
      { label: 'GitHub Stars', value: '33' },
      { label: 'GitHub Forks', value: '4' },
      { label: '支持', value: '任意大模型' }
    ],
    highlights: ['极其智能', '长期记忆管理', '多语言支持']
  },
  {
    title: 'Vaiiya',
    description: '一家基于《THE FINALS》游戏的虚拟公司网站，我参与了网站的制作。使用Framer Motion实现了流畅的帧动画滚动效果，配合Three.js打造沉浸式粒子背景，为用户带来极具视觉冲击力的交互体验。',
    tags: ['Next.js', 'Framer Motion', 'Three.js', 'Animation'],
    year: '2024 - 至今',
    preview: 'https://uapis.cn/static/uploads/c88e2500d41a862f38937fb9ce830b67.png',
    website: 'https://vaiiya.org/',
    opensource: false,
    stats: [
      { label: '帧动画技术', value: 'Apple级' },
      { label: '物理效果', value: '完美阻尼' },
      { label: '性能', value: '0卡顿' }
    ],
    highlights: ['Framer Motion 帧动画', 'Three.js 粒子效果', 'THE FINALS 主题设计']
  },
  {
    title: 'Clipzy',
    description: '极其极简、精致的在线剪切板。它还可以当图床、短链接。速度极致，动画轻巧，每个细节都做的恰到好处。',
    tags: ['Next.js', 'React', 'UI/UX', 'Web App'],
    year: '2024 - 至今',
    preview: 'https://uapis.cn/static/uploads/8f6bc70d021d1597971a8df2feadc090.png',
    website: 'https://paste.sdjz.wiki/',
    ranking: 'https://cn.bing.com/search?q=%E5%9C%A8%E7%BA%BF%E5%89%AA%E5%88%87%E6%9D%BF',
    opensource: false,
    stats: [
      { label: '功能', value: '3合1' },
      { label: '性能', value: '极致' },
      { label: '设计', value: '精致' }
    ],
    highlights: ['必应搜索"在线剪切板"排名第6', '极致性能', '精致动画', '多功能']
  },
  {
    title: 'MCP Mail Tool',
    description: '基于MCP协议的智能邮件管理工具，为AI提供邮件操作能力。支持自动分类、智能回复、邮件搜索，让AI帮你处理邮件，大幅提升工作效率。',
    repo: 'shuakami/mcp-mail',
    tags: ['TypeScript', 'Email', 'AI', 'Productivity'],
    year: '2025 - 至今',
    customBanner: (
      <ProjectBanner
        title="MCP Mail Tool"
        description="基于MCP协议的智能邮件管理工具"
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
      { label: 'GitHub Stars', value: '40' },
      { label: 'GitHub Forks', value: '6' },
      { label: 'MCP协议', value: '支持' }
    ],
    highlights: ['AI驱动邮件', '智能分类', '自动回复']
  },
  {
    title: 'SSH MCP Tool',
    description: '基于MCP协议的SSH管理工具，为AI提供SSH远程操作能力。支持多服务器管理、命令执行、文件传输，让AI也能管理服务器，对DevOps很有帮助。',
    repo: 'shuakami/mcp-ssh',
    tags: ['TypeScript', 'SSH', 'DevOps', 'Automation'],
    year: '2025 - 至今',
    customBanner: (
      <ProjectBanner
        title="SSH MCP Tool"
        description="基于MCP协议的SSH管理工具"
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
      { label: 'GitHub Stars', value: '30' },
      { label: 'GitHub Forks', value: '5' },
      { label: 'MCP协议', value: '支持' }
    ],
    highlights: ['AI驱动SSH', 'Tmux集成', 'DevOps自动化']
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

export default function WorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
      {/* 页面标题 */}
      <header className="mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-3 sm:mb-4">
          作品
        </h1>
        <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 sm:mb-8 leading-relaxed">
          我一共获得了 476 颗星标，做的项目已经有 7,000+ 位用户在使用，过去一年贡献了 2,132 次代码
        </p>
        <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 作品列表 */}
      <div className="space-y-0">
            {works.map((work, index) => (
              <article 
                key={index} 
                data-work-index={index}
                className="group py-8 sm:py-12 md:py-16 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0"
              >
            {/* 项目预览图 */}
            {work.customBanner ? (
              // 使用自定义渐变背景Banner（不包裹链接）
              <div className="relative aspect-[16/9] sm:aspect-[2/1] mb-6 sm:mb-8 md:-mx-8">
                {work.customBanner}
              </div>
            ) : (
                <a
                href={work.website || (work.repo ? `https://github.com/${work.repo}` : '#')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-6 sm:mb-8 md:-mx-8"
                >
                {/* 使用传统图片/轮播 */}
                <div className="relative aspect-[16/9] sm:aspect-[2/1] rounded-lg overflow-hidden bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                  {work.previews && work.previews.length > 0 ? (
                    <ImageCarousel
                      images={work.previews}
                      alt={work.title}
                      priority={index < 2}
                    />
                  ) : (
                      <Image
                      src={work.preview || (work.repo ? getSocialifyUrl(work.repo) : '/placeholder.png')}
                        alt={work.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        className="object-cover"
                      quality={95}
                        priority={index < 2}
                      unoptimized={!!work.preview}
                      />
                  )}
                    </div>
              </a>
            )}

            {/* 项目信息 */}
            <div className="space-y-4 sm:space-y-5">
              {/* 标题和年份 */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black dark:text-white mb-2 sm:mb-2">
                        {work.title}
                      </h2>
                  <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
                    {work.description}
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-black/40 dark:text-white/40 flex-shrink-0 sm:mt-1">
                        {work.year}
                      </span>
                    </div>
                    
              {/* 项目数据统计 + 按钮 */}
              {work.stats && work.stats.length > 0 && (
                <div className="rounded-lg sm:rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">
                  <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                    {/* 数据统计 */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-4 md:gap-x-8 lg:gap-x-12">
                      {work.stats.map((stat, i) => (
                        <div key={i} className="space-y-0.5 sm:space-y-1 min-w-0">
                          <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                            {stat.value}
                          </h4>
                          <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* 主要按钮 */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:self-start md:self-auto">
                      {work.website && (
                        <a
                          href={work.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>
                          访问官网
                        </a>
                      )}
                      {work.repo && !work.website && (
                        <a
                          href={`https://github.com/${work.repo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                          </svg>
                          查看源码
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 核心亮点 */}
              {work.highlights && work.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {work.highlights.map((highlight, i) => {
                    // 如果是第一个亮点且有排名链接，做成可点击的
                    if (i === 0 && work.ranking && highlight.includes('排名')) {
                      return (
                        <a
                          key={i}
                          href={work.ranking}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white font-medium hover:bg-black/[0.10] dark:hover:bg-white/[0.12] active:bg-black/[0.14] dark:active:bg-white/[0.16] transition-colors cursor-pointer"
                        >
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="#EAB308" className="sm:w-3 sm:h-3 flex-shrink-0">
                            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                          </svg>
                          <span className="break-all">{highlight}</span>
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-50 sm:w-3 sm:h-3 flex-shrink-0">
                            <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/>
                          </svg>
                        </a>
                      )
                    }
                    // 其他亮点 - 只有第一个显示黄色星星
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white font-medium"
                      >
                        {i === 0 && !work.ranking && (
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="#EAB308" className="sm:w-3 sm:h-3 flex-shrink-0">
                            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                          </svg>
                        )}
                        <span className="break-all">{highlight}</span>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* 技术标签 */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-2.5 py-1 text-xs rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
              </article>
            ))}
          </div>

      {/* 右侧导航光刻标 */}
      <WorksNavigator 
        workCount={works.length}
        workTitles={works.map(work => work.title)}
      />
    </div>
  );
} 