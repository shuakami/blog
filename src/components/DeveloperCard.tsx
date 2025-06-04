'use client';

import Image from 'next/image';

// 样式常量
const CARD_STYLES = {
  base: "bg-white/40 dark:bg-black/40 rounded-xl backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
  ring: "ring-1 ring-black/[0.03] dark:ring-white/[0.03]",
  hover: "hover:bg-white/60 dark:hover:bg-black/60 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_16px_45px_rgb(255,255,255,0.1)]"
};

interface DeveloperCardProps {
  developer: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    tags: string[];
    link: string;
  };
}

// 简单的className合并函数
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <a href={developer.link} target="_blank" rel="noopener noreferrer" className="block h-full">
      <div 
        className={cn(
          CARD_STYLES.base,
          CARD_STYLES.ring,
          CARD_STYLES.hover,
          "group relative p-6 h-[200px] transition-all duration-300 ease-out",
          developer.name === 'Shuakami' ? 'dark:group-hover:shadow-[0_0_30px_rgba(120,119,198,0.5)]' : ''
        )}
      >
        {developer.name === 'Shuakami' && (
          <>
            {/* RGB光效 */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#a8edea]/0 via-[#a8edea]/20 to-[#fed6e3]/20 
              opacity-0 group-hover:opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500
              animate-gradient-x pointer-events-none" />

            {/* hover边框效果 */}
            <div className="absolute -inset-[1px] rounded-xl border border-black/[0.08] dark:border-white/[0.15] opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}

        <div className="relative flex flex-col h-full">
          {/* 头部：头像和基本信息 */}
          <div className="flex items-start gap-5">
            {/* 头像 */}
            <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5
              shadow-[0_4px_12px_rgb(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgb(255,255,255,0.08)]">
              {developer.avatar ? (
                <Image
                  src={developer.avatar}
                  alt={developer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-black/20 dark:text-white/20">
                  {developer.name[0]}
                </div>
              )}
            </div>

            {/* 名字和角色 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium text-black dark:text-white group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors truncate">
                  {developer.name}
                </h2>
                <span className="text-base text-black/40 dark:text-white/40 shrink-0">
                  {developer.role}
                </span>
              </div>

              <p className="text-base text-black/60 dark:text-white/60 mt-2 leading-relaxed line-clamp-2">
                {developer.bio}
              </p>
            </div>

            {/* 箭头 */}
            <div className="shrink-0 text-black/20 dark:text-white/20 group-hover:text-black/40 dark:group-hover:text-white/40 transition-colors">
              <svg 
                className="w-6 h-6 transform transition-transform group-hover:translate-x-1" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M13.75 6.75L19.25 12L13.75 17.25" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M19 12H4.75" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {developer.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-base rounded-full 
                  bg-black/[0.03] dark:bg-white/[0.03]
                  text-black/60 dark:text-white/60
                  group-hover:bg-black/[0.05] dark:group-hover:bg-white/[0.05]
                  transition-colors
                  truncate max-w-[120px]"
              >
                {tag}
              </span>
            ))}
            {developer.tags.length > 3 && (
              <span className="text-base text-black/40 dark:text-white/40">
                +{developer.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
} 