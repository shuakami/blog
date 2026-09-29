const LINKS = [
  { label: 'GitHub', href: 'https://github.com/shuakami' },
  { label: 'RSS', href: '/rss' },
  { label: 'Mail', href: 'mailto:shuakami@sdjz.wiki' },
];

export default function Footer({ wide = false }: { wide?: boolean }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`site-column mx-auto px-6 pb-14 pt-32 md:px-0 ${wide ? 'site-column-wide md:px-12' : ''}`}>
      <div className="flex flex-col gap-4 text-[0.875rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 whitespace-nowrap">
          <span>{year} Shuakami</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="ink-link text-ink-3">
            桂ICP备2023016069号-2
          </a>
        </div>
      </div>
    </footer>
  );
}
