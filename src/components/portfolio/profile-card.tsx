"use client"

import { useState, useRef, useEffect } from "react"

export function ProfileCard() {
  const [flipped, setFlipped] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pre-load video on mount for zero-lag instant playback on hover
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  const handleMouseEnter = () => {
    setFlipped(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay handled gracefully if blocked
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setFlipped(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <button
      type="button"
      className="profile-card group text-left"
      aria-pressed={flipped}
      aria-label="Toggle portrait and ASCII identity views"
      onClick={() => {
        setFlipped((prev) => {
          const next = !prev
          if (next && videoRef.current) {
            videoRef.current.play().catch(() => {})
          } else if (!next && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
          return next
        })
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <span className="profile-card-inner" data-flipped={flipped}>
        {/* Front Face: Professional Portrait Photo */}
        <span className="profile-face profile-front">
          <span className="portrait-frame">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MyProfessionalPicture-oYg3ZaXXhARavFLOPqnqarkvMWPTi7.png"
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
              preload="auto"
              aria-hidden="true"
            >
              {/* VP9 first for GPU hardware-accelerated 60FPS playback */}
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
