'use client';

import React, { useEffect, useRef, useState } from 'react';
import CialloIssueDemo from './CialloIssueDemo';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  shimmerSpeed: number;
  shimmerOffset: number;
}

export default function CialloParticleBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isDemoActive) {
      // 停止粒子动画
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateSize();

    // 创建随机粒子
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 8000;

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        
        particles.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          shimmerSpeed: Math.random() * 0.03 + 0.02,
          shimmerOffset: Math.random() * Math.PI * 2,
        });
      }
      
      console.log(`Created ${particles.length} particles`);
      return particles;
    };

    // 动画循环
    const animate = () => {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.016;

      const particles = particlesRef.current;
      const particleColor = isDark ? '255, 255, 255' : '0, 0, 0';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const shimmer = Math.sin(timeRef.current * p.shimmerSpeed * 60 + p.shimmerOffset) * 0.5 + 0.5;
        const finalOpacity = p.opacity * shimmer;

        ctx.fillStyle = `rgba(${particleColor}, ${finalOpacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 初始化
    particlesRef.current = createParticles();
    animate();

    // 监听窗口变化
    const handleResize = () => {
      updateSize();
      particlesRef.current = createParticles();
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isDemoActive]);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsDemoActive(true);
    }, 600);
  };

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-lg md:rounded-xl overflow-hidden bg-white dark:bg-black">
      {/* 粒子背景 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full transition-opacity duration-500"
        style={{ 
          display: 'block',
          opacity: isTransitioning ? 0 : 1
        }}
      />
      
      {/* 查看演示按钮 */}
      {!isDemoActive && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/15 text-black dark:text-white text-xs sm:text-sm font-medium transition-all hover:bg-white/20 dark:hover:bg-black/30 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            <span>查看演示</span>
          </button>
        </div>
      )}

      {/* 聊天演示 */}
      <CialloIssueDemo isActive={isDemoActive} />
    </div>
  );
}

