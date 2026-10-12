"use client"

import { useState, useRef, useEffect } from "react"

export function ProfileCard() {
  const [flipped, setFlipped] = useState(false)
  // Track whether video has been loaded yet (lazy load on first flip)
  const videoLoaded = useRef(false)
  const videoRef    = useRef<HTMLVideoElement>(null)

  // ── 2b: Lazy load — do NOT preload="auto" + load() on mount.
  //    On mobile this would download 3.7 MB even if user never flips the card.
  //    We load once on the very first flip instead (see triggerLoad below).
  const triggerLoad = () => {
    if (!videoLoaded.current && videoRef.current) {
      videoLoaded.current = true
      videoRef.current.load()
    }
  }

  const startVideo = () => {
    triggerLoad()
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  // ── 2a: Mouse / touch separation.
  //    - onPointerEnter/Leave: only react when it's a real mouse pointer.
  //      This prevents the tap→mouseenter→focus→click triple-fire on phones
  //      that results in no flip or a flicker.
  //    - onClick: used for touch (and keyboard Enter) — plain toggle.
  //    - onFocus/onBlur removed; they fired on every Tab keypress and clashed
  //      with pointer events. Keyboard users still get the card via Enter/Space.
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    setFlipped(true)
    startVideo()
  }

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    setFlipped(false)
    stopVideo()
  }

  const handleClick = () => {
    setFlipped((prev) => {
      const next = !prev
      if (next) startVideo()
      else stopVideo()
      return next
    })
  }

  return (
    <button
      type="button"
      className="profile-card group text-left"
      aria-pressed={flipped}
      aria-label="Toggle portrait and ASCII identity views"
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span className="profile-card-inner" data-flipped={flipped}>
        {/* Front Face: Professional Portrait Photo */}
        <span className="profile-face profile-front">
          <span className="portrait-frame">
            <img
              src="/assets/profile.png"
              alt="Ayan Aslam"
              draggable={false}
            />
          </span>
          <span className="profile-caption font-mono">
            <span>IDENTITY / AYAN ASLAM</span>
            <span>BACKEND SYSTEMS</span>
          </span>
        </span>

        {/* Back Face: WebM ASCII Video Animation Stream */}
        <span className="profile-face profile-back" aria-hidden={!flipped}>
          <span className="video-portrait-frame">
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
            >
              {/* VP9 first — GPU hardware-accelerated on most devices */}
              <source src="/assets/ayan-ascii-vp9.webm" type="video/webm; codecs=vp9" />
              <source src="/assets/ayan-ascii-av1.webm" type="video/webm; codecs=av01.0.05M.08" />
              <source src="/assets/ayan-ascii-vp9.webm" type="video/webm" />
            </video>
          </span>
          <span className="profile-caption font-mono">
            <span>ASCII RASTER</span>
            <span>REAL-TIME STREAM</span>
          </span>
        </span>
      </span>
    </button>
  )
}
