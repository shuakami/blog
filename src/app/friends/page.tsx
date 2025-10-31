import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: '好兄弟们 - Shuakami',
  description: '一起玩、一起写代码的好兄弟们',
  openGraph: {
    title: '好兄弟们 - Shuakami',
    description: '一起玩、一起写代码的好兄弟们',
  },
};

// 好兄弟们数据
const developers = [
  {
    name: 'Shuakami',
    role: '',
    avatar: '/friends/assets/avatars/shuakami.jpg',
    link: 'https://github.com/shuakami'
  },
  {
    name: 'xiaoyueyoqwq',
    role: '',
    avatar: '/friends/assets/avatars/xiaoyueyoqwq.jpg',
    link: 'https://xiaoyue.vaiiya.org'
  },
  {
    name: 'Darf',
    role: 'Xiaoxian',
    avatar: 'https://uapis.cn/api/v1/avatar/gravatar?email=xiaoxian@axtn.net&s=256&d=mp',
    link: 'https://xiaoxian.org'
  },
  {
    name: 'Mrsunny',
    role: '',
    avatar: 'https://proxy.sdjz.wiki/https:/avatars.githubusercontent.com/u/91064101?v=4',
    link: 'https://mrsunny.top'
  },
  {
    name: 'Shanshui',
    role: '量子猫步',
    avatar: 'http://q.qlogo.cn/g?b=qq&nk=3381734705&s=640',
    link: 'https://blog.shanshui.site'
  },
];

export default function DevelopersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
      {/* 页面标题 */}
      <header className="mb-16 md:mb-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-4">
         好兄弟们
        </h1>
        <p className="text-lg text-black/50 dark:text-white/50 mb-8">
         兄弟你们都好香啊
        </p>
        <div className="w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 好兄弟网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((developer, index) => (
          <a
            key={index}
            href={developer.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] p-5 transition-colors hover:border-black/20 dark:hover:border-white/20">
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={developer.avatar}
                    alt={developer.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black dark:text-white truncate">
                    {developer.name}
                    {developer.role && (
                      <span className="ml-2 text-sm font-normal text-black/60 dark:text-white/60">
                        ({developer.role})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-black/60 dark:text-white/60 truncate">
                    {new URL(developer.link).hostname}
                  </p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 