import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: '项目咨询 - Shuakami',
  description: '专业的 Web 开发服务，为你打造现代化的数字产品',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Header */}
      <header className="border-b border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link 
            href="/about" 
            className="flex items-center gap-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* Title */}
        <header className="mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-6">
            项目咨询
          </h1>
          <div className="w-16 h-[2px] bg-black dark:bg-white" />
        </header>

        {/* Intro */}
        <section className="mb-20">
          <p className="text-lg md:text-xl text-black/60 dark:text-white/60 leading-relaxed max-w-3xl">
            我专注喜欢创造高效、优雅的应用，从设计到开发，为你提供完整的解决方案。
            无论是个人项目还是商业应用，我都能帮你实现。
          </p>
        </section>

        {/* Services */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-8">
            服务范围
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.02] px-5 py-5">
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">网站开发</h3>
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                企业官网、个人博客、作品集网站等各类展示型网站的设计与开发
              </p>
            </div>

            <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.02] px-5 py-5">
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">Web 应用</h3>
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                管理后台、数据看板、在线工具等功能型 Web 应用的完整开发
              </p>
            </div>

            <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.02] px-5 py-5">
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">API 开发</h3>
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                RESTful API、GraphQL 接口、第三方服务集成等后端服务开发
              </p>
            </div>

            <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.02] px-5 py-5">
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">AI 集成</h3>
              <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed">
                ChatGPT、AI Agent 等人工智能技术的集成与应用开发
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-8">
            参考报价
          </h2>
          <div className="space-y-6">
            <div className="py-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    基础网站
                  </h3>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    个人博客、作品集、简单的展示型网站
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-medium text-black dark:text-white">
                    ¥200 起
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                    1-2 周
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    企业官网
                  </h3>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    公司介绍、产品展示、新闻动态等功能完善的企业网站
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-medium text-black dark:text-white">
                    ¥600 起
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                    2-3 周
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    Web 应用
                  </h3>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    管理后台、在线工具、数据看板等功能型应用
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-medium text-black dark:text-white">
                    ¥1,000 起
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                    3-4 周
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6 border-b border-black/5 dark:border-white/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    毕设论文
                  </h3>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    计算机相关专业毕业设计、课程设计及论文撰写
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-medium text-black dark:text-white">
                    ¥700 起
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                    视难度而定
                  </p>
                </div>
              </div>
            </div>

            <div className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    定制开发
                  </h3>
                  <p className="text-sm text-black/50 dark:text-white/50">
                    复杂的业务系统、AI 应用、API 服务等定制化项目
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-medium text-black dark:text-white">
                    面议
                  </p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                    视项目而定
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Included */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-8">
            交付内容
          </h2>
          <div className="space-y-6 text-base text-black/60 dark:text-white/60 leading-relaxed">
            <p>
              完成的项目代码和源文件，包含必要的部署配置。如果需要，我会帮你部署到服务器或托管平台上。
            </p>
            <p>
              项目会做到移动端和桌面端都能正常使用。不会给你一个只能在电脑上看的网站。
            </p>
            <p>
              <strong className="text-black dark:text-white"></strong>开发过程中我会给你看进度，有问题及时沟通调整。但项目完成验收后，只包含 <strong className="text-black dark:text-white">3 次免费修改</strong>的机会（修复 bug 不算）。如果需要大改功能或设计，需要另外商量。
            </p>
            <p>
              <strong className="text-black dark:text-white"></strong>开始前我们会把需求和功能列清楚，避免后期扯皮。做什么、不做什么，一开始就说明白。
            </p>
            <p>
              如果项目上线后遇到技术问题，可以随时联系我，我会帮你解决。
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl md:text-3xl font-medium text-black dark:text-white mb-6">
            开始咨询
          </h2>
          <p className="text-base text-black/60 dark:text-white/60 leading-relaxed mb-8 max-w-2xl">
            如果你有项目需求，欢迎通过邮件联系我。请简单描述项目的需求和预期，我会在 24 小时内回复。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:shuakami@sdjz.wiki"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
            >
              发送邮件
            </a>
            <a
              href="https://github.com/shuakami"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              查看 GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
