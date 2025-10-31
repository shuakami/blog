"use client"

import { useMusicPlayer } from "@/hooks/use-music-player"

export function GlobalMusicPlayer() {
  const { audioRef, handleNextSong } = useMusicPlayer()

  return (
    <audio
      ref={audioRef}
      onEnded={() => {
        console.log("[Player LOG] Song ended, calling handleNextSong.")
        handleNextSong()
      }}
      style={{ display: "none" }}
    />
  )
}