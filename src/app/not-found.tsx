'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="site-column mx-auto flex min-h-[70vh] flex-col justify-center px-6 md:px-0">
      <p className="text-[2.5rem] font-bold leading-none tracking-[-0.04em] text-ink-3">CDIV</p>
      <h1 className="display mt-6 text-[clamp(2.75rem,5vw,4.75rem)]">What&rsquo;s gone, and what&rsquo;s past help, should be past grief.</h1>
      <p className="mt-8 max-w-[40ch] text-[1.25rem] leading-[1.6] text-ink-body">
        The page thou seekest is fled, and left no word of whither it went.
      </p>
      <div className="mt-10 flex items-center gap-2">
        <Link href="/" className="pill">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>Index</span>
        </Link>
        <button type="button" onClick={() => window.history.back()} className="pill pill-text-only">
          Go back
        </button>
      </div>
    </div>
  );
}
