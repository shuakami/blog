import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '作品 - Luoxiaohei',
  description: '我的项目作品展示'
};

interface Work {
  title: string;
  description: string;
  link: string;
  repo: string;
  tags: string[];
  year: string;
}

const works: Work[] = [
  {
    title: 'ZZZ UID Auto-Reservation Script',
    description: '绝区零(ZZZ) UID自动预约脚本，支持自动化流程和定时执行。使用Python开发，集成了图像识别、自动化控制等多种技术，提供了完整的错误处理和日志记录功能。',
    link: 'https://github.com/shuakami/zzz-uid-script',
    repo: 'shuakami/zzz-uid-script',
    tags: ['Python', 'OpenCV', 'PyAutoGUI', 'Automation', 'Gaming'],
    year: '2024'
  },
  {
    title: 'QQ Chat Exporter',
    description: 'QQ聊天记录导出工具，支持将聊天记录导出为多种格式，包括文本、JSON等。提供了简洁的界面和灵活的配置选项，方便用户备份和分析聊天记录。',
    link: 'https://github.com/shuakami/qq-chat-exporter',
    repo: 'shuakami/qq-chat-exporter',
    tags: ['Python', 'Qt', 'Data Export', 'Chat Analysis'],
    year: '2024'
  },
  {
    title: 'AmyAlmond Bot',
    description: '一个功能丰富的机器人项目，集成了多种实用功能和智能交互特性。基于现代化的架构设计，支持插件扩展，提供了稳定可靠的服务。',
    link: 'https://github.com/shuakami/amyalmond_bot',
    repo: 'shuakami/amyalmond_bot',
    tags: ['TypeScript', 'Bot', 'Discord.js', 'Automation'],
    year: '2023'
  },
  {
    title: 'Next Locale',
    description: '为Next.js项目提供的国际化解决方案，支持动态语言切换、自动路由生成等功能。简化了国际化开发流程，提高了开发效率。',
    link: 'https://github.com/shuakami/next-locale',
    repo: 'shuakami/next-locale',
    tags: ['TypeScript', 'Next.js', 'i18n', 'React'],
    year: '2023'
  },
  {
    title: 'FuckRun',
    description: '运动打卡自动化工具，帮助用户轻松完成运动打卡任务。采用智能算法模拟真实运动数据，提供便捷的配置界面。',
    link: 'https://github.com/shuakami/FuckRun',
    repo: 'shuakami/FuckRun',
    tags: ['Python', 'Automation', 'Data Simulation'],
    year: '2023'
  },
  {
    title: 'Lauth',
    description: '现代化的认证授权系统，提供安全可靠的身份验证和访问控制功能。支持多种认证方式，易于集成到现有项目中。',
    link: 'https://github.com/shuakami/Lauth',
    repo: 'shuakami/Lauth',
    tags: ['TypeScript', 'Authentication', 'Security', 'API'],
    year: '2023'
  }
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
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl p-8
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <h1 className="text-4xl font-medium mb-4 bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          作品
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
          这里展示了我的一些个人项目和开源作品。
        </p>
      </div>

      {/* 作品列表 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl overflow-hidden
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <div className="p-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-medium text-black/80 dark:text-white/80">项目列表</h2>
        </div>
        <div className="p-8">
          <div className="space-y-16">
            {works.map((work, index) => (
              <article 
                key={index} 
                className="group relative"
              >
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative aspect-[2/1] mb-8 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                    <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={getSocialifyUrl(work.repo)}
                        alt={work.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 2}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors duration-500" />
                  </div>

                  <div className="relative">
                    <div className="flex items-baseline justify-between mb-4">
                      <h2 className="text-2xl font-medium text-black dark:text-white group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">
                        {work.title}
                      </h2>
                      <span className="text-sm text-black/50 dark:text-white/50">
                        {work.year}
                      </span>
                    </div>
                    
                    <p className="text-black/70 dark:text-white/70 mb-6 leading-relaxed">
                      {work.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm rounded-full 
                            bg-black/[0.03] dark:bg-white/[0.03]
                            text-black/60 dark:text-white/60
                            group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.05]
                            transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 