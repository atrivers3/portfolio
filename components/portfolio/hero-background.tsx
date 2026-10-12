"use client"

import { useEffect, useRef } from "react"

export function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isMobile = window.innerWidth < 768
    // Watch reduced-motion live (user can toggle it at any time)
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    let frame    = 0
    let raf      = 0
    let visible  = true
    let pointerX = 0.5
    let pointerY = 0.5

    // ── Resize via ResizeObserver — doesn't fire on iOS URL-bar changes ──────
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // Skip re-allocation if size didn't actually change (avoids URL-bar noise)
      if (canvas.clientWidth === rect.width && canvas.clientHeight === rect.height) return
      const ratio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
      canvas.width  = rect.width  * ratio
      canvas.height = rect.height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const move = (event: PointerEvent) => {
      // Only update on real mouse pointers — not touch (pointermove fires on touch too)
      if (event.pointerType !== "mouse") return
      const rect = canvas.getBoundingClientRect()
      pointerX = (event.clientX - rect.left) / rect.width
      pointerY = (event.clientY - rect.top) / rect.height
    }

    const draw = () => {
      const width  = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1
      const phase    = frame * 0.012
      // Fewer rows and wider step on mobile (5 rows, step=12 vs 8 rows, step=8)
      const rowCount = isMobile ? 5 : 8
      const xStep    = isMobile ? 12 : 8
      for (let row = 0; row < rowCount; row++) {
        const baseY = height * (0.18 + row * 0.095)
        ctx.beginPath()
        for (let x = -20; x <= width + 20; x += xStep) {
          const y = baseY + Math.sin(x * 0.012 + phase + row * 0.7) * (7 + row * 0.8) + (pointerY - 0.5) * 5
          if (x === -20) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = row % 3 === 0 ? "rgba(59,130,246,.24)" : "rgba(148,163,184,.105)"
        ctx.stroke()
      }
      ctx.strokeStyle = "rgba(59,130,246,.21)"
      for (let col = 0; col < 7; col++) {
        const x = width * (0.1 + col * 0.14) + (pointerX - 0.5) * 7
        const y = height * (0.25 + (col % 3) * 0.17)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 50)
        ctx.lineTo(x + 34, y + 84)
        ctx.lineTo(x + 34, height)
        ctx.stroke()
        ctx.fillStyle = col % 2 ? "rgba(148,163,184,.35)" : "rgba(59,130,246,.6)"
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // ── Animation loop — draw() no longer schedules itself ───────────────────
    const loop = () => {
      draw()
      if (visible && !motionQuery.matches) {
        // Advance 2 frames per tick on mobile for the same visual speed
        // but half the rAF callbacks → lower battery drain
        frame += isMobile ? 2 : 1
        raf = requestAnimationFrame(loop)
      }
    }

    const restart = () => {
      cancelAnimationFrame(raf)
      if (visible && !motionQuery.matches) {
        raf = requestAnimationFrame(loop)
      } else {
        // Draw one static frame so canvas doesn't go blank
        draw()
      }
    }

    // ── IntersectionObserver — pause when hero is off-screen ─────────────────
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        restart()
      },
      { rootMargin: "100px" }
    )
    io.observe(canvas)

    // ── ResizeObserver instead of window "resize" ─────────────────────────────
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Watch reduced-motion preference live
    motionQuery.addEventListener("change", restart)

    // Pointermove for parallax (mouse-only)
    canvas.addEventListener("pointermove", move)

    // Initial setup
    resize()
    restart()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      motionQuery.removeEventListener("change", restart)
      canvas.removeEventListener("pointermove", move)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden="true" />
}
