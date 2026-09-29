'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TAGS = { div: motion.div, li: motion.li, header: motion.header } as const;

interface RevealProps {
  as?: keyof typeof TAGS;
  delay?: number;
  blur?: boolean;
  className?: string;
  children: ReactNode;
}

export function Reveal({ as = 'div', delay = 0, blur = false, className, children }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{
        opacity: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        y: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9, delay },
      }}
    >
      {children}
    </Tag>
  );
}
