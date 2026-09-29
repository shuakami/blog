'use client';

import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

interface TallyProps {
  value: string;
  delay?: number;
}

function parse(value: string) {
  const match = value.match(/^([\d,]*\.?\d+)(.*)$/);
  if (!match) return null;
  const digits = match[1].replace(/,/g, '');
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
  return { target: Number(digits), decimals, grouped: match[1].includes(','), suffix: match[2] };
}

export function Tally({ value, delay = 0 }: TallyProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const reduce = useReducedMotion();
  const parsed = parse(value);

  useEffect(() => {
    const node = ref.current;
    if (!node || !parsed || !inView || reduce) return;
    const format = (n: number) =>
      n.toLocaleString('en-US', {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
        useGrouping: parsed.grouped,
      }) + parsed.suffix;
    node.textContent = format(0);
    const controls = animate(0, parsed.target, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        node.textContent = format(n);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, delay, parsed?.target, parsed?.decimals, parsed?.grouped, parsed?.suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
