import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

// 数据
const developers = {
  'shuakami': {
    name: 'Shuakami',
    role: '全栈开发者',
    avatar: '/friends/assets/avatars/shuakami.jpg',
    bio: '热爱技术，热爱生活。专注于Web开发和用户体验设计。',
    tags: ['TypeScript', 'React', 'Node.js', 'UI/UX'],
    location: '中国，上海',
    company: 'Freelancer',
    website: 'https://luoxiaohei.cn',
    github: 'https://github.com/shuakami',
    twitter: 'https://twitter.com/shuakami',
    projects: [
      {
        name: 'Luoxiaohei Blog',
        description: '一个使用Next.js构建的个人博客',
        link: 'https://github.com/shuakami/blog'
      },
      {
        name: 'AI Toolkit',
        description: '开发者AI工具集',
        link: 'https://github.com/shuakami/ai-toolkit'
      }
    ],
    skills: [
      { name: 'TypeScript', level: 90 },
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'UI/UX', level: 75 }
    ],
    experience: [
      {
        title: '高级前端开发工程师',
        company: 'TechCorp',
        period: '2020 - 至今',
        description: '负责公司核心产品的前端架构设计和开发'
      },
      {
        title: '全栈开发工程师',
        company: 'StartupX',
        period: '2018 - 2020',
        description: '参与多个创新项目的开发，涵盖前端和后端'
      }
    ]
  },
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const developer = developers[params.id];
  return {
    title: `${developer?.name || '好兄弟'} - Shuakami`,
    description: developer?.bio || '认识一下这位好兄弟',
    openGraph: {
      title: `${developer?.name || '好兄弟'} - Shuakami`,
      description: developer?.bio || '认识一下这位好兄弟',
    },
  };
}

export default function DeveloperPage({ params }) {
  const developer = developers[params.id];

  if (!developer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
          <h1 className="text-3xl font-medium text-black dark:text-white">
            好兄弟不存在
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* 基本信息区域 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* 头像 */}
          <div className="w-40 h-40 relative rounded-2xl overflow-hidden 
            border border-black/5 dark:border-white/10
            shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
            <Image
              src={developer.avatar}
              alt={developer.name}
              fill
              className="object-cover"
            />
          </div>

          {/* 个人信息 */}
          <div className="flex-grow">
            <h1 className="text-3xl font-medium text-black dark:text-white mb-3">
              {developer.name}
            </h1>
            <p className="text-lg text-black/60 dark:text-white/60 mb-4">
              {developer.role}
            </p>
            <p className="text-black/80 dark:text-white/80 mb-6 leading-relaxed">
              {developer.bio}
            </p>
            
            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {developer.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full 
                    bg-black/[0.03] dark:bg-white/[0.03]
                    text-black/60 dark:text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 详细信息网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* 技能 */}
          <section>
            <h2 className="text-xl font-medium text-black dark:text-white mb-6">
              技能
            </h2>
            <div className="space-y-4">
              {developer.skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-black/80 dark:text-white/80">
                      {skill.name}
                    </span>
                    <span className="text-black/60 dark:text-white/60">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/[0.03] dark:bg-white/[0.03] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600/80 dark:bg-blue-400/80 rounded-full transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 项目 */}
          <section>
            <h2 className="text-xl font-medium text-black dark:text-white mb-6">
              项目
            </h2>
            <div className="space-y-4">
              {developer.projects.map((project) => (
                <Link 
                  key={project.name}
                  href={project.link}
                  target="_blank"
                  className="block p-4 rounded-xl
                    bg-white/40 dark:bg-black/40
                    hover:bg-white/60 dark:hover:bg-black/60
                    border border-black/5 dark:border-white/10
                    transition-all duration-300"
                >
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    {project.name}
                  </h3>
                  <p className="text-black/60 dark:text-white/60">
                    {project.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 工作经历 */}
        <section>
          <h2 className="text-xl font-medium text-black dark:text-white mb-6">
            工作经历
          </h2>
          <div className="space-y-8">
            {developer.experience.map((exp) => (
              <div 
                key={exp.title}
                className="relative pl-6 border-l-2 border-black/10 dark:border-white/10"
              >
                <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <h3 className="text-lg font-medium text-black dark:text-white mb-1">
                  {exp.title}
                </h3>
                <p className="text-black/60 dark:text-white/60 mb-2">
                  {exp.company} · {exp.period}
                </p>
                <p className="text-black/80 dark:text-white/80">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 