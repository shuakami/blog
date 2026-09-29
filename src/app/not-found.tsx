'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="site-column mx-auto flex min-h-[70vh] flex-col justify-center px-6 md:px-0">
      <p className="mono text-[12px] text-ink-3">404</p>
      <h1 className="mt-3 text-[26px] font-medium leading-[1.2] tracking-[-0.5px] text-ink">
        Exit, pursued by a bear.
      </h1>
      <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.6] text-ink-2">
        The page you asked for left the stage some time ago and did not say where it was going.
      </p>
      <div className="mt-8 flex items-center gap-2">
        <Link href="/" className="pill">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Index</span>
        </Link>
        <button type="button" onClick={() => window.history.back()} className="pill pill-text-only">
          Go back
        </button>
      </div>
    </div>
  );
}
