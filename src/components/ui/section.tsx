import Link from 'next/link';
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  href?: string;
  action?: string;
  className?: string;
  children: ReactNode;
}

/* Section heading: label, then a hairline that runs to the right edge. */
export function Section({ title, href, action = 'All', className = '', children }: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center gap-4">
        <h2 className="text-[14px] font-medium text-ink">{title}</h2>
        <div className="hairline flex-1" />
        {href && (
          <Link href={href as never} className="ink-link text-[13px] text-ink-3 hover:text-ink">
            {action}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
