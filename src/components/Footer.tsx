'use client';

import { useEffect, useState } from 'react';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/shuakami' },
  { label: 'RSS', href: '/rss' },
  { label: 'Mail', href: 'mailto:shuakami@sdjz.wiki' },
];

const OFFSET_LABEL = 'UTC+8';

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

export default function Footer({ wide = false }: { wide?: boolean }) {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className={`site-column mx-auto px-6 pb-16 pt-24 md:px-0 ${wide ? 'site-column-wide md:px-10' : ''}`}>
      <div className="hairline mb-8" />
      <div className="flex flex-col gap-6 text-[13px] leading-[1.45] text-ink-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-ink-2">All the world is a stage, and this one runs on Next.</p>
          <p className="mono text-[12px]" suppressHydrationWarning>
            {clock ? `${clock} ${OFFSET_LABEL}` : `\u00A0`}
          </p>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <div className="flex items-center gap-4">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="ink-link text-ink-2"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span>{year} Shuakami</span>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="ink-link">
              桂ICP备2023016069号-2
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
