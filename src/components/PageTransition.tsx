"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.645, 0.045, 0.355, 1.000], // easeInOutCubic
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.645, 0.045, 0.355, 1.000],
    }
  }
};

const loadingVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [content, setContent] = useState(children);
  const [isPageTransition, setIsPageTransition] = useState(false);

  useEffect(() => {
    // 只在路径变化时触发过渡
    setIsPageTransition(true);
    
    const timer = setTimeout(() => {
      setContent(children);
      setIsPageTransition(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="min-h-screen"
        >
          {content}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isPageTransition && (
          <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* 外圈动画 */}
                <div className="absolute w-12 h-12 rounded-full border-2 border-black/20 dark:border-white/20 animate-[spin_1.5s_linear_infinite]" />
                
                {/* 内圈动画 */}
                <div className="absolute w-8 h-8 rounded-full border-2 border-t-transparent border-black/40 dark:border-white/40 animate-[spin_1s_linear_infinite_reverse]" />
                
                {/* 中心点 */}
                <div className="w-2 h-2 rounded-full bg-black/60 dark:bg-white/60 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 