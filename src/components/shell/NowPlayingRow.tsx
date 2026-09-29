'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

/* Compact transport for the rail. Cover, title, artist, one control. */
export function NowPlayingRow() {
  const { currentSong, isPlaying, handleTogglePlay, parsedLyrics, currentLyricIndex } = useMusicPlayer();

  if (!currentSong) return null;

  const lyric = parsedLyrics[currentLyricIndex]?.text;

  return (
    <div className="group flex items-center gap-2.5">
      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={() => {
          triggerHaptic(HapticFeedback.Light);
          handleTogglePlay();
        }}
        className="relative h-8 w-8 flex-none overflow-hidden rounded-full shadow-card transition-shadow duration-300 ease-quint hover:shadow-card-hover"
      >
        {currentSong.coverUrl ? (
          <Image
            src={currentSong.coverUrl}
            alt=""
            fill
            sizes="32px"
            className={`object-cover transition-transform duration-500 ease-quint ${isPlaying ? '' : 'scale-105 grayscale'}`}
          />
        ) : (
          <span className="absolute inset-0 bg-line" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition-opacity duration-300 ease-quint group-hover:opacity-100">
          {isPlaying ? <Pause className="h-3 w-3" fill="currentColor" /> : <Play className="h-3 w-3" fill="currentColor" />}
        </span>
      </button>
      <Link href="/music" className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[13px] text-ink">{currentSong.title}</span>
        <span className="block truncate text-[12px] text-ink-3">
          {isPlaying && lyric ? lyric : currentSong.artist}
        </span>
      </Link>
    </div>
  );
}
