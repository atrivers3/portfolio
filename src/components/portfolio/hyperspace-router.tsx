"use client"

import { useEffect, useRef } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type Star = {
  x: number
  y: number
  z: number
  previousZ: number
  tint: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STAR_COUNT = 800
const WARP_DURATION = 1500        // total warp ms
const FIELD_DEPTH = 1800
const FADE_OUT_START = 1300       // ms — canvas starts fading out
const FADE_OUT_DURATION = 200     // ms — fade out duration
const FLASH_START = 1380          // ms — white flash (light barrier break)
const FLASH_DURATION = 80         // ms

// ─── Utilities ───────────────────────────────────────────────────────────────

/** Cubic ease-in-out over [0, 1] */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Custom smooth scroll with rAF — replaces scrollIntoView */
function smoothScrollTo(targetY: number, duration = 420) {
  const startY = window.scrollY
  const startTime = performance.now()
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo(0, startY + (targetY - startY) * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/** Pre-render a radial gradient glow sprite once to avoid per-frame shadowBlur */
function buildGlowSprite(size: number): HTMLCanvasElement {
  const sprite = document.createElement("canvas")
  sprite.width = size
  sprite.height = size
  const ctx = sprite.getContext("2d")!
  const cx = size / 2
  const gradient = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  gradient.addColorStop(0,   "rgba(200, 225, 255, 0.90)")
  gradient.addColorStop(0.4, "rgba(170, 210, 255, 0.45)")
  gradient.addColorStop(1,   "rgba(100, 160, 255, 0.00)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return sprite
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HyperspaceRouter({
  active,
  scrollVelocity,
  onComplete,
  nextSectionId = "systems",
}: {
  active: boolean
  scrollVelocity: number
  onComplete: () => void
  nextSectionId?: string
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const flashRef   = useRef<HTMLDivElement>(null)
  // Smooth velocity lives in a ref so the rAF loop always sees the latest value
  // without requiring the effect to re-run on every velocity change.
  const smoothVelocityRef = useRef(0)
  // Keep the latest scrollVelocity prop accessible inside the effect closure
  const rawVelocityRef    = useRef(scrollVelocity)

  // Sync raw velocity ref every render without re-triggering the effect
  useEffect(() => { rawVelocityRef.current = scrollVelocity })

  useEffect(() => {
    if (!active) return

    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    const flash   = flashRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context || !wrapper || !flash) return

    // ── Lock scroll ────────────────────────────────────────────────────────
    const prevOverflow     = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    // ── Init ──────────────────────────────────────────────────────────────
    let width  = window.innerWidth
    let height = window.innerHeight
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    let animFrame = 0
    const startTime = performance.now()

    // Glow sprite: 64 × 64, rendered once, reused via drawImage (no shadowBlur)
    const GLOW_SIZE = 64
    const glowSprite = buildGlowSprite(GLOW_SIZE)
    const GLOW_HALF  = GLOW_SIZE / 2

    // ── Stars ──────────────────────────────────────────────────────────────
    const randomStar = (): Star => ({
      x: (Math.random() - 0.5) * width  * 2.4,
      y: (Math.random() - 0.5) * height * 2.4,
      z: Math.random() * FIELD_DEPTH + 1,
      previousZ: FIELD_DEPTH,
      tint: Math.random(),
    })
    const stars = Array.from({ length: STAR_COUNT }, randomStar)

    // ── Canvas resize ──────────────────────────────────────────────────────
    const resize = () => {
      width  = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width  = Math.round(width  * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width  = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // ── Render loop ────────────────────────────────────────────────────────
    const render = (now: number) => {
      const elapsed     = Math.min(now - startTime, WARP_DURATION)
      const rawProgress = elapsed / WARP_DURATION
      const eased       = easeInOut(rawProgress)

      // Low-pass filter on velocity — prevents abrupt streak jumps
      smoothVelocityRef.current +=
        (Math.abs(rawVelocityRef.current) - smoothVelocityRef.current) * 0.08
      const sv            = Math.min(smoothVelocityRef.current, 120)
      const velocityFactor = sv / 120

      // Camera Z movement follows ease curve: slow → fast → slow
      const acceleration = 4 + eased * eased * 80 + velocityFactor * 22
      const focalLength  = Math.min(width, height) * 0.72

      // ── Wrapper fade-out (after FADE_OUT_START) ────────────────────────
      if (elapsed >= FADE_OUT_START) {
        const fadeProgress = Math.max(
          0, 1 - (elapsed - FADE_OUT_START) / FADE_OUT_DURATION
        )
        wrapper.style.opacity = String(fadeProgress)
      }

      // ── White flash — light-barrier break ─────────────────────────────
      if (elapsed >= FLASH_START) {
        const flashP = Math.min((elapsed - FLASH_START) / FLASH_DURATION, 1)
        flash.style.opacity = String(Math.max(0, 1 - flashP))
      }

      // ── Background ────────────────────────────────────────────────────
      context.fillStyle = "#0A0A0A"
      context.fillRect(0, 0, width, height)

      // ── Stars ─────────────────────────────────────────────────────────
      context.save()
      context.globalCompositeOperation = "lighter"
      context.lineCap = "round"

      for (const star of stars) {
        star.previousZ = star.z
        star.z -= acceleration

        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * width * 2.4
          star.y = (Math.random() - 0.5) * height * 2.4
          star.z = FIELD_DEPTH
          star.previousZ = FIELD_DEPTH
          star.tint = Math.random()
          continue
        }

        const currentScale  = focalLength / star.z
        const previousScale = focalLength / star.previousZ
        const cx = width  / 2 + star.x * currentScale
        const cy = height / 2 + star.y * currentScale
        const px = width  / 2 + star.x * previousScale
        const py = height / 2 + star.y * previousScale

        // If star has flown off screen laterally, reset to distance with new random position
        if (cx < -200 || cx > width + 200 || cy < -200 || cy > height + 200) {
          star.x = (Math.random() - 0.5) * width * 2.4
          star.y = (Math.random() - 0.5) * height * 2.4
          star.z = FIELD_DEPTH
          star.previousZ = FIELD_DEPTH
          star.tint = Math.random()
          continue
        }

        const proximity = 1 - star.z / FIELD_DEPTH

        // Streak length proportional to smoothed velocity, max ~150 px
        const streakFactor = 1 + velocityFactor * 3.2 + eased * 5.5
        const tailX = cx - (cx - px) * streakFactor
        const tailY = cy - (cy - py) * streakFactor

        // ── Draw streak — no shadowBlur ────────────────────────────────
        const alpha     = Math.min(0.14 + proximity * 0.88, 1)
        const lineWidth = 0.5 + proximity * 2.2
        // Blue-white (#B0D4FF) or near-white tint — as requested
        const colour = star.tint > 0.72
          ? `rgba(176, 212, 255, ${alpha})`
          : `rgba(220, 236, 255, ${alpha})`

        context.beginPath()
        context.moveTo(tailX, tailY)
        context.lineTo(cx, cy)
        context.strokeStyle = colour
        context.lineWidth   = lineWidth
        context.stroke()

        // ── Glow via pre-rendered sprite (replaces shadowBlur) ─────────
        if (proximity > 0.3) {
          const glowScale = (lineWidth + proximity) * 0.85
          context.globalAlpha = proximity * 0.20
          context.drawImage(
            glowSprite,
            cx - GLOW_HALF * glowScale,
            cy - GLOW_HALF * glowScale,
            GLOW_SIZE * glowScale,
            GLOW_SIZE * glowScale
          )
          context.globalAlpha = 1
        }
      }

      context.restore()

      // ── Continue or finish ─────────────────────────────────────────────
      if (elapsed < WARP_DURATION) {
        animFrame = window.requestAnimationFrame(render)
      } else {
        // Restore scroll lock
        document.documentElement.style.overflow = prevOverflow
        document.body.style.overflow = prevBodyOverflow

        // Smooth scroll to next section instead of instant scrollIntoView
        const targetEl = document.getElementById(nextSectionId)
        if (targetEl) {
          const targetY =
            targetEl.getBoundingClientRect().top + window.scrollY - 90
          smoothScrollTo(targetY, 420)
        }

        onComplete()
      }
    }

    animFrame = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animFrame)
      window.removeEventListener("resize", resize)
      document.documentElement.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
    }
  // onComplete and nextSectionId are stable references — only re-run when active changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  if (!active) return null

  return (
    <div
      ref={wrapperRef}
      className="hyperspace"
      role="status"
      aria-live="polite"
      aria-label="Routing to architecture logs"
    >
      <canvas ref={canvasRef} aria-hidden="true" />

      {/* Route label — appears at ~60% progress via CSS keyframe in globals.css */}
      <span className="route-label font-mono">
        {"> routing to /architecture_logs"}
      </span>

      {/* White flash overlay — "light barrier break" cinematic moment */}
      <div
        ref={flashRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "#ffffff",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
