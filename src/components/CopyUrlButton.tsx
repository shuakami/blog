'use client';

import { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

export function CopyUrlButton({ label = 'Copy link' }: { label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      triggerHaptic(HapticFeedback.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('copy failed', err);
    }
  };

  return (
    <button type="button" onClick={copy} className="pill" aria-live="polite">
      <span className="relative block h-4 w-4">
        <LinkIcon
          className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-quint"
          style={{ opacity: copied ? 0 : 1, transform: copied ? 'scale(0.6)' : 'none' }}
          strokeWidth={1.75}
        />
        <Check
          className="absolute inset-0 h-4 w-4 transition-all duration-300 ease-quint"
          style={{ opacity: copied ? 1 : 0, transform: copied ? 'none' : 'scale(0.6)', color: 'var(--accent-green)' }}
          strokeWidth={2}
        />
      </span>
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
