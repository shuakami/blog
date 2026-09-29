'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={`pill pill-icon ${className}`}
      aria-label={isDark ? 'Switch to light' : 'Switch to dark'}
      onClick={() => {
        triggerHaptic(HapticFeedback.Light);
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      <span className="relative block h-3.5 w-3.5">
        <Sun
          className="absolute inset-0 h-3.5 w-3.5 transition-all duration-300 ease-quint"
          style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(-90deg) scale(0.6)' : 'none' }}
          strokeWidth={1.75}
        />
        <Moon
          className="absolute inset-0 h-3.5 w-3.5 transition-all duration-300 ease-quint"
          style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'none' : 'rotate(90deg) scale(0.6)' }}
          strokeWidth={1.75}
        />
      </span>
    </button>
  );
}
