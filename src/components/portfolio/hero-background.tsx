"use client"

import { useEffect, useRef } from "react"

export function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let raf = 0
    let pointerX = 0.5
    let pointerY = 0.5

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointerX = (event.clientX - rect.left) / rect.width
      pointerY = (event.clientY - rect.top) / rect.height
    }
    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = 1
      const phase = frame * 0.012
      for (let row = 0; row < 8; row++) {
        const baseY = height * (0.18 + row * 0.095)
        ctx.beginPath()
        for (let x = -20; x <= width + 20; x += 8) {
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
      if (!reduced) {
        frame += 1
        raf = requestAnimationFrame(draw)
      }
    }
    resize()
    window.addEventListener("resize", resize)
    canvas.addEventListener("pointermove", move)
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("pointermove", move)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden="true" />
}
