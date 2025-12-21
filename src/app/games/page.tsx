'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Lenis from 'lenis';
import { motion } from 'framer-motion';

interface Game {
  title: string;
  quote: string;
  description: string;
  video: string;
  startTime?: number;
  accentColor?: string;
  steam?: string;
  link?: { url: string; label: string };
  videoHeight?: string;
}

const games: Game[] = [
  {
    title: '赛博朋克 2077',
    quote: '这是我最喜欢的游戏。没有之一。',
    description: '这座城市里面发生的事情，V，强尼银手，再到后来的百灵鸟，李德...每个人，每段故事都让我欲罢不能。说实话刚发售的时候非常的差，但直到往日之影DLC，它已经是传奇了。我非常推荐你玩玩它（包括DLC）',
    video: 'http://1500015089.vod2.myqcloud.com/439635e7vodtranscq1500015089/7a6d228a1397757899027001433/v.f100800.mp4',
    startTime: 6,
    accentColor: '#F4E600',
    steam: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
  },
  {
    title: '最后生还者',
    quote: '对我来说绝对是神作之一。',
    description: '一作和二作我都玩了。对于我来说，哪个都缺一不可。它足够身临其境，画面优美，足够扣人心弦。一开始或许会有些无聊。到后面你就离不开它了。',
    video: 'https://video.akamai.steamstatic.com/store_trailers/256936971/movie_max_vp9.webm?t=1680015399',
    startTime: 10,
    accentColor: '#4A7C59',
    steam: 'https://store.steampowered.com/app/1888930/The_Last_of_Us_Part_I/',
  },
  {
    title: '最后生还者 Part II',
    quote: '虽然有争议，但不妨碍它还是神作。',
    description: '二代算是比较有争议的。我一开始玩的很伤心很痛苦，但不妨碍它还是神作。',
    video: 'https://cdn.akamai.steamstatic.com/steam/apps/257121063/movie_max_vp9.webm?t=1746152569',
    startTime: 8,
    accentColor: '#8B4513',
    steam: 'https://store.steampowered.com/app/2531310/The_Last_of_Us_Part_II_Remastered/',
    videoHeight: '65vh',
  },
  {
    title: 'THE FINALS',
    quote: '画面很好看，玩法新颖，但可能不太适合新手。',
    description: '长TTK的FPS游戏，国内叫终极角逐。Steam现在已经锁国区了（不过可以用xbox）。画面很好看，但可能不太适合新手，尤其是匹配机制，容易被大佬往死里干。不过如果你有足够的时间和耐心，而且很喜欢这种画风或者玩法，那我推荐你来试试。',
    video: 'https://cdn.fastly.steamstatic.com/steam/apps/257102318/movie_max_vp9.webm?t=1742475028',
    startTime: 0,
    accentColor: '#FF4655',
    link: { url: 'https://www.xbox.com/zh-CN/games/store/the-finals/9PGD71CMDS0Z', label: 'Xbox' },
  },
  {
    title: '幻兽帕鲁',
    quote: '和朋友玩再好不过了。',
    description: '相信你知道"兄弟兄弟"这个梗，原型就是这里面一个帕鲁。这个游戏我买了很久了，居然还在更新。虽然到处都有点简陋的感觉，但不妨碍它对得起这个价格，而且足够好玩。主要是捉帕鲁，建房子，打boss。Xbox可以咸鱼特价区几十块钱一份。',
    video: 'https://cdn.akamai.steamstatic.com/steam/apps/257063169/movie_max_vp9.webm?t=1728458616',
    startTime: 0,
    accentColor: '#5DADE2',
    steam: 'https://store.steampowered.com/app/1623730/Palworld/',
  },
  {
    title: '底特律：变人',
    quote: '每一个选择都会改变结局。',
    description: '一款互动电影式的剧情游戏，讲述仿生人觉醒的故事。三条主线交织，你的每个决定都会影响剧情走向和角色命运。画面精美，剧情扣人心弦，多周目体验完全不同的结局。Steam特价才13.60，绝对值得一玩。',
    video: 'https://cdn.akamai.steamstatic.com/steam/apps/256784014/movie_max_vp9.webm?t=1590429401',
    startTime: 7,
    accentColor: '#00BFFF',
    steam: 'https://store.steampowered.com/app/1222140/Detroit_Become_Human/',
  },
];

function GameSection({ game, index }: { game: Game; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isInView, setIsInView] = useState(index === 0); // 第一个默认可见

  const startTime = game.startTime || 0;

  // 监听视频是否进入视口
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50%可见时触发
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // 根据是否在视口控制播放
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    if (isInView) {
      video.currentTime = startTime;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isInView, isReady, startTime]);

  // 初始化视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = true;

    const initVideo = () => {
      // 先 seek 到目标时间
      video.currentTime = startTime;
    };

    // 监听 seeked 事件，确保 seek 完成后才显示视频
    const handleSeeked = () => {
      // 只有当 currentTime 接近 startTime 时才设置 ready
      if (Math.abs(video.currentTime - startTime) < 1) {
        setIsReady(true);
      }
    };

    const handleTimeUpdate = () => {
      if (startTime > 0 && video.currentTime < startTime - 0.5) {
        video.currentTime = startTime;
      }
    };

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('timeupdate', handleTimeUpdate);

    if (video.readyState >= 3) {
      initVideo();
    } else {
      video.addEventListener('canplay', initVideo, { once: true });
    }
    
    return () => {
      video.removeEventListener('canplay', initVideo);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [startTime]);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section ref={sectionRef}>
      {/* 视频区域 - 移动端更小的高度 */}
      <div 
        className="relative w-full h-[50vh] md:h-[75vh]" 
        style={game.videoHeight ? { height: undefined } : undefined}
      >
        {game.videoHeight && (
          <style jsx>{`
            @media (min-width: 768px) {
              .video-container { height: ${game.videoHeight}; }
            }
          `}</style>
        )}
        <div className={`relative w-full h-full ${game.videoHeight ? 'video-container' : ''}`}>
          <video
            ref={videoRef}
            src={game.video}
            className={`w-full h-full object-cover cursor-pointer transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onClick={handlePlay}
          />
          
          {/* 渐变遮罩 - 移动端更强的遮罩 */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #0B0B0B 0%, rgba(11,11,11,0.7) 25%, rgba(11,11,11,0.3) 50%, transparent 70%)',
            }}
          />
          
          {/* 播放控制 - 移动端适配安全区域 */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2 md:gap-3 z-10 pb-safe">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all active:scale-95 hover:bg-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {isMuted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all active:scale-95 hover:bg-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>
          </div>

          {/* 标题 - 移动端更小字体 */}
          <div className="absolute bottom-4 left-4 md:bottom-12 md:left-12 pr-24 md:pr-0">
            <h2 className="text-2xl md:text-5xl font-medium text-white">
              {game.title}
            </h2>
          </div>
        </div>
      </div>

      {/* 内容区域 - 移动端更紧凑 */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-24">
        <p 
          className="text-xl md:text-3xl font-medium leading-relaxed mb-6 md:mb-8"
          style={{ color: game.accentColor || '#fff' }}
        >
          {game.quote}
        </p>
        
        <p className="text-sm md:text-lg leading-relaxed mb-8 md:mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {game.description}
        </p>
        
        {game.steam && (
          <a
            href={game.steam}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <span>Steam</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </a>
        )}
        {game.link && (
          <a
            href={game.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <span>{game.link.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </a>
        )}
      </div>
    </section>
  );
}

export default function GamesPage() {
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  // 设置深色滚动条
  useEffect(() => {
    document.documentElement.classList.add('dark-scrollbar');
    return () => {
      document.documentElement.classList.remove('dark-scrollbar');
    };
  }, []);

  // Lenis 平滑滚动
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    
    // 在跳转前先关闭侧边栏，避免布局抖动
    localStorage.setItem('sidebar-open', 'false');
    
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <motion.div 
      className="fullscreen-page min-h-screen" 
      style={{ backgroundColor: '#0B0B0B' }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 返回主页按钮 */}
      <motion.a
        href="/"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? -20 : 0 }}
        transition={{ 
          duration: 0.6, 
          delay: isExiting ? 0 : 0.8, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
        onClick={handleExit}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span className="text-sm">返回</span>
      </motion.a>

      {games.map((game, index) => (
        <motion.div
          key={game.title}
          initial={{ opacity: 0, y: index === 0 ? 0 : 80 }}
          animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? 40 : 0 }}
          transition={{ 
            duration: isExiting ? 0.4 : (index === 0 ? 0.8 : 1.2), 
            delay: isExiting ? index * 0.05 : (index === 0 ? 0.1 : 0.3 + index * 0.15),
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <GameSection game={game} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
