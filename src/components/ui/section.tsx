import Link from 'next/link';
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  href?: string;
  action?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ title, href, action = 'All of it', className = '', children }: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-6">
        <h2 className="flex items-center gap-3 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-ink">
          <span className="hedera text-ink-3" aria-hidden />
          {title}
        </h2>
        {href && (
          <Link href={href as never} className="ink-link caps pb-0.5 hover:text-ink">
            {action}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
