import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 - Luoxiaohei',
  description: '关于我和这个网站'
};

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl p-8
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <h1 className="text-4xl font-medium mb-4 bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          关于
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
          了解更多关于我和这个网站的信息。
        </p>
      </div>

      {/* 内容区域 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl overflow-hidden
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <div className="p-8">
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-medium mb-4 text-black/80 dark:text-white/80">技术栈</h2>
              <div className="space-y-2 text-black/70 dark:text-white/70">
                <p>
                  主要使用 TypeScript 和 Python 进行开发。对自动化工具、网站开发和系统设计有浓厚兴趣。
                </p>
                <p>
                  目前专注于探索 AI 在开发流程中的应用，以及提高代码质量和开发效率的最佳实践。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4 text-black/80 dark:text-white/80">项目</h2>
              <div className="space-y-2 text-black/70 dark:text-white/70">
                <p>
                  在 GitHub 上维护了一些开源项目，涵盖自动化工具、开发框架和实用程序等领域。
                  项目代码都遵循开源协议，欢迎贡献和使用。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4 text-black/80 dark:text-white/80">关于本站</h2>
              <div className="space-y-2 text-black/70 dark:text-white/70">
                <p>
                  这个网站使用 Next.js 14 构建，采用了 App Router 和 Server Components。
                  样式基于 Tailwind CSS，支持响应式设计和暗色模式。
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-black/[0.03] dark:bg-white/[0.03] text-black/60 dark:text-white/60">
                    Next.js
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-black/[0.03] dark:bg-white/[0.03] text-black/60 dark:text-white/60">
                    TypeScript
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-black/[0.03] dark:bg-white/[0.03] text-black/60 dark:text-white/60">
                    Tailwind CSS
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-black/[0.03] dark:bg-white/[0.03] text-black/60 dark:text-white/60">
                    MDX
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4 text-black/80 dark:text-white/80">联系方式</h2>
              <div className="space-y-2 text-black/70 dark:text-white/70">
                <p>
                  如果你对我的项目感兴趣，或者有任何问题，欢迎通过以下方式联系：
                </p>
                <ul className="list-none p-0 space-y-2">
                  <li>
                    <a
                      href="https://github.com/shuakami"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:shuakami@sdjz.wiki"
                      className="inline-flex items-center text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      Email
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 