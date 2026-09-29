'use client';

import { useRef, useState } from 'react';
import { useInView } from 'framer-motion';

type Contribution = { date: string; count: number };

interface ContributionGridProps {
  contributions: Contribution[];
  maxContributions: number;
}

const CELL = 10;
const GAP = 2;
const DAY = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function shade(count: number, max: number) {
  if (count === 0) return 'rgba(var(--ink-rgb), 0.07)';
  const p = max === 0 ? 1 : count / max;
  const alpha = p > 0.75 ? 0.95 : p > 0.5 ? 0.7 : p > 0.25 ? 0.5 : 0.3;
  return `rgba(var(--ink-rgb), ${alpha})`;
}

interface Hover extends Contribution {
  x: number;
  y: number;
  align: 'start' | 'center' | 'end';
}

export default function ContributionGrid({ contributions, maxContributions }: ContributionGridProps) {
  const frame = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const shown = useInView(grid, { once: true, margin: '0px 0px -10% 0px' });
  const [hover, setHover] = useState<Hover | null>(null);
  const [glide, setGlide] = useState(false);

  const weeks = Math.ceil(contributions.length / 7);
  const months: { name: string; col: number }[] = [];
  let lastMonth = -1;
  contributions.forEach((c, i) => {
    const m = new Date(c.date).getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      const col = Math.floor(i / 7);
      if (months.length === 0 || col - months[months.length - 1].col >= 3) {
        months.push({ name: new Date(c.date).toLocaleString('en-US', { month: 'short' }), col });
      }
    }
  });

  const show = (c: Contribution, cell: HTMLElement) => {
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    const r = cell.getBoundingClientRect();
    const x = r.left - box.left + r.width / 2;
    const align = x < 90 ? 'start' : x > box.width - 90 ? 'end' : 'center';
    setGlide(hover !== null);
    setHover({ ...c, x, y: r.top - box.top, align });
  };

  const shift = hover?.align === 'start' ? '-12px' : hover?.align === 'end' ? 'calc(-100% + 12px)' : '-50%';

  return (
    <div ref={frame} className="relative" onMouseLeave={() => setHover(null)}>
      <div className="overflow-x-auto pb-1">
        <div ref={grid} className="contrib relative pt-6" data-shown={shown} style={{ width: weeks * (CELL + GAP) }}>
          {months.map((m) => (
            <span
              key={`${m.name}-${m.col}`}
              className="contrib-month absolute top-0 text-[0.75rem] italic text-ink-3"
              style={{ left: m.col * (CELL + GAP), ['--w' as string]: m.col }}
            >
              {m.name}
            </span>
          ))}
          <div className="contrib-grid grid grid-flow-col grid-rows-7" style={{ gap: GAP }}>
            {contributions.map((c, i) => (
              <div
                key={c.date}
                className="contrib-cell rounded-[2.5px]"
                style={{
                  width: CELL,
                  height: CELL,
                  background: shade(c.count, maxContributions),
                  ['--w' as string]: Math.floor(i / 7),
                  ['--d' as string]: i % 7,
                }}
                onMouseEnter={(e) => show(c, e.currentTarget)}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-[0.8125rem] font-medium duration-200 ease-quint"
        style={{
          transitionProperty: glide ? 'opacity, transform' : 'opacity',
          transform: `translate(${hover ? hover.x : 0}px, ${hover ? hover.y - 8 : 0}px) translate(${shift}, -100%)`,
          opacity: hover ? 1 : 0,
          background: 'var(--ink)',
          color: 'var(--bg)',
        }}
      >
        {hover && `${hover.count} ${hover.count === 1 ? 'contribution' : 'contributions'}, ${DAY.format(new Date(hover.date))}`}
      </div>
    </div>
  );
}
