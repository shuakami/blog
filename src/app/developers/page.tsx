import type { Metadata } from 'next';
import DeveloperCard from '@/components/DeveloperCard';

// 样式常量
const CARD_STYLES = {
  base: "bg-white/40 dark:bg-black/40 rounded-xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
  ring: "ring-1 ring-black/[0.03] dark:ring-white/[0.03]"
};

// 简单的className合并函数
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export const metadata: Metadata = {
  title: '开发者 - Luoxiaohei',
  description: '认识这些优秀的开发者和朋友们'
};

// 开发者数据
const developers = [
  {
    name: 'Shuakami',
    role: '全栈开发者',
    avatar: '/developers/assets/avatars/shuakami.jpg',
    bio: '我爱你的残缺，胜过爱你的完美',
    tags: ['TypeScript', 'React', 'Node.js', 'UI/UX'],
    link: 'https://github.com/shuakami'
  },
  {
    name: 'xiaoyueyoqwq',
    role: '全栈开发者',
    avatar: '/developers/assets/avatars/xiaoyueyoqwq.jpg',
    bio: '是shuakami最好的朋友！应该吧？',
    tags: ['TypeScript', 'Python', 'Next.js', 'UI/UX'],
    link: 'https://xiaoyue.moliatopia.icu'
  },
];

export default function DevelopersPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "p-8")}>
        <h1 className="text-4xl font-medium mb-4 bg-gradient-to-r from-black to-black/60 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          开发者
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">
          认识这些优秀的开发者和朋友们
        </p>
      </div>

      {/* 开发者卡片列表 */}
      <div className={cn(CARD_STYLES.base, CARD_STYLES.ring, "overflow-hidden")}>
        <div className="p-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-medium text-black/80 dark:text-white/80">团队成员</h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {developers.map((developer, index) => (
              <DeveloperCard key={index} developer={developer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 