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

const STAR_COUNT      = 800
const WARP_DURATION   = 1500   // total warp ms
const FIELD_DEPTH     = 1800
const FADE_OUT_START  = 1300   // ms — canvas starts fading out
const FADE_OUT_DURATION = 200  // ms
const FLASH_START     = 1380   // ms — white flash
const FLASH_DURATION  = 80     // ms
const MOBILE_BREAKPOINT = 768

// ─── Utilities ───────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function smoothScrollTo(targetY: number, duration = 420) {
  const startY = window.scrollY
  const startTime = performance.now()
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    window.scrollTo(0, startY + (targetY - startY) * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

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
  velocityRef,
  onComplete,
  nextSectionId = "systems",
}: {
  active: boolean
  /** Ref to raw scroll velocity — avoids re-rendering PortfolioView on every scroll */
  velocityRef: React.RefObject<number>
  onComplete: () => void
  nextSectionId?: string
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const flashRef   = useRef<HTMLDivElement>(null)
  const smoothVelocityRef = useRef(0)

  useEffect(() => {
    if (!active) return

    const canvas  = canvasRef.current
    const wrapper = wrapperRef.current
    const flash   = flashRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context || !wrapper || !flash) return

    // ── Reduced-motion: skip entire effect ─────────────────────────────────
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const target = document.getElementById(nextSectionId)
      if (target) {
        const targetY = target.getBoundingClientRect().top + window.scrollY - 90
        window.scrollTo({ top: targetY })
      }
      onComplete()
      return
    }

    // ── Lock scroll ─────────────────────────────────────────────────────────
    const prevOverflow     = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    // ── Device capability detection ─────────────────────────────────────────
    const isMobile  = window.innerWidth < MOBILE_BREAKPOINT
    const lowPower  = isMobile || (navigator.hardwareConcurrency ?? 8) <= 4
    const starCount = Math.round(STAR_COUNT * (lowPower ? 0.4 : 1)) // 320 on mobile
    const maxDpr    = isMobile ? 1.5 : 2
    const drawGlow  = !isMobile

    // ── Init dimensions from wrapper (not window) ───────────────────────────
    let width      = 0
    let height     = 0
    let pixelRatio = 1
    let animFrame  = 0
    const startTime = performance.now()

    const GLOW_SIZE  = 64
    const glowSprite = drawGlow ? buildGlowSprite(GLOW_SIZE) : null
    const GLOW_HALF  = GLOW_SIZE / 2

    // ── Resize via ResizeObserver — avoids window.innerHeight URL-bar noise ─
    const resize = () => {
      const rect = wrapper.getBoundingClientRect()
      if (rect.width === width && rect.height === height) return
      width      = rect.width
      height     = rect.height
      pixelRatio = Math.min(window.devicePixelRatio || 1, maxDpr)
      canvas.width  = Math.round(width  * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      // Do NOT set style.width/height in px — CSS "width:100%;height:100%" handles it
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }
    resize() // initial size from wrapper
    const ro = new ResizeObserver(resize)
    ro.observe(wrapper)

    // ── Stars ───────────────────────────────────────────────────────────────
    const randomStar = (): Star => ({
      x: (Math.random() - 0.5) * width  * 2.4,
      y: (Math.random() - 0.5) * height * 2.4,
      z: Math.random() * FIELD_DEPTH + 1,
      previousZ: FIELD_DEPTH,
      tint: Math.random(),
    })
    const stars = Array.from({ length: starCount }, randomStar)

    // ── Render loop ─────────────────────────────────────────────────────────
    const render = (now: number) => {
      const elapsed     = Math.min(now - startTime, WARP_DURATION)
      const rawProgress = elapsed / WARP_DURATION
      const eased       = easeInOut(rawProgress)

      // Low-pass filter on velocity
      const rawVel = Math.abs(velocityRef.current ?? 0)
      smoothVelocityRef.current += (rawVel - smoothVelocityRef.current) * 0.08
      const sv             = Math.min(smoothVelocityRef.current, 120)
      const velocityFactor = sv / 120

      const acceleration = 4 + eased * eased * 80 + velocityFactor * 22
      const focalLength  = Math.min(width, height) * 0.72

      // Wrapper fade-out
      if (elapsed >= FADE_OUT_START) {
        const fadeProgress = Math.max(0, 1 - (elapsed - FADE_OUT_START) / FADE_OUT_DURATION)
        wrapper.style.opacity = String(fadeProgress)
      }

      // White flash — toned down to 0.6 peak opacity for accessibility
      if (elapsed >= FLASH_START) {
        const flashP = Math.min((elapsed - FLASH_START) / FLASH_DURATION, 1)
        flash.style.opacity = String(Math.max(0, 0.6 * (1 - flashP)))
      }

      // Background
      context.fillStyle = "#0A0A0A"
      context.fillRect(0, 0, width, height)

      // Stars — batch by alpha level to cut draw calls from ~800 to ~12
      context.save()
      context.globalCompositeOperation = "lighter"
      context.lineCap = "round"

      // Pre-bucket stars into 6 alpha bands × 2 tints = 12 paths max
      type Batch = { moveTo: [number, number][]; lineTo: [number, number][] }
      const BANDS = 6
      const batches: Batch[][] = Array.from({ length: BANDS }, () => [
        { moveTo: [], lineTo: [] },
        { moveTo: [], lineTo: [] },
      ])
      const lineWidths: number[] = Array.from({ length: BANDS }, (_, i) => 0.5 + (i / (BANDS - 1)) * 2.2)

      for (const star of stars) {
        star.previousZ = star.z
        star.z -= acceleration

        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * width  * 2.4
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

        if (cx < -200 || cx > width + 200 || cy < -200 || cy > height + 200) {
          star.x = (Math.random() - 0.5) * width  * 2.4
          star.y = (Math.random() - 0.5) * height * 2.4
          star.z = FIELD_DEPTH
          star.previousZ = FIELD_DEPTH
          star.tint = Math.random()
          continue
        }

        const proximity    = 1 - star.z / FIELD_DEPTH
        const streakFactor = 1 + velocityFactor * 3.2 + eased * 5.5
        const tailX = cx - (cx - px) * streakFactor
        const tailY = cy - (cy - py) * streakFactor

        const bandIndex = Math.min(BANDS - 1, Math.floor(proximity * BANDS))
        const tintIndex = star.tint > 0.72 ? 0 : 1
        batches[bandIndex][tintIndex].moveTo.push([tailX, tailY])
        batches[bandIndex][tintIndex].lineTo.push([cx, cy])

        // Glow sprite (desktop only, proximity > 0.3)
        if (drawGlow && glowSprite && proximity > 0.3) {
          const lineWidth = lineWidths[bandIndex]
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

      // Flush batches — ~12 stroke calls per frame instead of ~800
      const tintColors = [
        (alpha: number) => `rgba(176, 212, 255, ${alpha})`, // blue-white
        (alpha: number) => `rgba(220, 236, 255, ${alpha})`, // near-white
      ]
      for (let b = 0; b < BANDS; b++) {
        const alpha     = Math.min(0.14 + (b / (BANDS - 1)) * 0.88, 1)
        const lineWidth = lineWidths[b]
        for (let t = 0; t < 2; t++) {
          const batch = batches[b][t]
          if (batch.moveTo.length === 0) continue
          context.beginPath()
          for (let i = 0; i < batch.moveTo.length; i++) {
            context.moveTo(batch.moveTo[i][0], batch.moveTo[i][1])
            context.lineTo(batch.lineTo[i][0], batch.lineTo[i][1])
          }
          context.strokeStyle = tintColors[t](alpha)
          context.lineWidth   = lineWidth
          context.stroke()
        }
      }

      context.restore()

      // Continue or finish
      if (elapsed < WARP_DURATION) {
        animFrame = window.requestAnimationFrame(render)
      } else {
        document.documentElement.style.overflow = prevOverflow
        document.body.style.overflow = prevBodyOverflow

        const targetEl = document.getElementById(nextSectionId)
        if (targetEl) {
          const targetY = targetEl.getBoundingClientRect().top + window.scrollY - 90
          smoothScrollTo(targetY, 420)
        }

        onComplete()
      }
    }

    animFrame = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animFrame)
      ro.disconnect()
      document.documentElement.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
    }
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
      style={{ touchAction: "none", overscrollBehavior: "contain" } as React.CSSProperties}
    >
      <canvas ref={canvasRef} aria-hidden="true" />

      <span className="route-label font-mono">
        {"> routing to /architecture_logs"}
      </span>

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
