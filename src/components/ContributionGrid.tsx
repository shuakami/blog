'use client';

import { useState } from 'react';

type Contribution = { date: string; count: number };

interface ContributionGridProps {
  contributions: Contribution[];
  maxContributions: number;
}

const CELL = 8;
const GAP = 2;

function shade(count: number, max: number) {
  if (count === 0) return 'rgba(var(--ink-rgb), 0.06)';
  const p = max === 0 ? 1 : count / max;
  const alpha = p > 0.75 ? 0.95 : p > 0.5 ? 0.7 : p > 0.25 ? 0.5 : 0.3;
  return `rgba(var(--ink-rgb), ${alpha})`;
}

export default function ContributionGrid({ contributions, maxContributions }: ContributionGridProps) {
  const [hover, setHover] = useState<(Contribution & { x: number; y: number }) | null>(null);

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

  return (
    <div className="overflow-x-auto">
      <div className="relative pt-5" style={{ width: weeks * (CELL + GAP) }}>
        {months.map((m) => (
          <span
            key={`${m.name}-${m.col}`}
            className="mono absolute top-0 text-[10px] text-ink-3"
            style={{ left: m.col * (CELL + GAP) }}
          >
            {m.name}
          </span>
        ))}
        <div className="grid grid-flow-col grid-rows-7" style={{ gap: GAP }}>
          {contributions.map((c) => (
            <div
              key={c.date}
              className="rounded-[2px] transition-colors duration-300 ease-quint"
              style={{ width: CELL, height: CELL, background: shade(c.count, maxContributions) }}
              onMouseEnter={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHover({ ...c, x: r.left + r.width / 2, y: r.top - 8 });
              }}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md px-2 py-1 text-[11px] transition-opacity duration-200 ease-quint"
        style={{
          left: hover?.x ?? 0,
          top: hover?.y ?? 0,
          transform: 'translate(-50%, -100%)',
          opacity: hover ? 1 : 0,
          background: 'var(--ink)',
          color: 'var(--bg)',
        }}
      >
        {hover && `${hover.count} ${hover.count === 1 ? 'contribution' : 'contributions'} on ${hover.date}`}
      </div>
    </div>
  );
}
