import Link from 'next/link';
import type { ReactNode, SVGProps } from 'react';

const Github = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const Mail = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
    <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v.41l8 4.8 8-4.8v-.41A1.75 1.75 0 0 0 14.25 2H1.75ZM16 5.9l-7.61 4.57a.75.75 0 0 1-.78 0L0 5.9v6.35C0 13.22.78 14 1.75 14h12.5c.97 0 1.75-.78 1.75-1.75V5.9Z" />
  </svg>
);

const ICONS = { github: Github, mail: Mail } as const;

interface InlineLinkProps {
  href: string;
  icon?: keyof typeof ICONS;
  children: ReactNode;
}

/* Prose link. Every glyph is a filled 16px-grid mark drawn at cap height and sat on the baseline, so all icons share one size. */
export function InlineLink({ href, icon, children }: InlineLinkProps) {
  const Icon = icon ? ICONS[icon] : null;
  const external = /^(https?:|mailto:)/.test(href);
  const className = 'group font-medium text-ink whitespace-nowrap';
  const body = (
    <>
      {Icon && <Icon className="mr-[0.3em] inline-block h-[0.78em] w-[0.78em] align-[-0.06em]" />}
      <span className="ink-link whitespace-normal">{children}</span>
    </>
  );

  if (external) {
    return (
      <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href as never} className={className}>
      {body}
    </Link>
  );
}
