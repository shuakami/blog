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

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [content, setContent] = useState(children);

  useEffect(() => {
    setContent(children);
  }, [pathname, children]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
              >
        {content}
      </motion.div>
    </AnimatePresence>
  );
} 