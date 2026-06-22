"use client";

import { useEffect, useRef } from "react";

/* ─── Character set ──────────────────────────────────────────── */
// Mix of katakana (matrix aesthetic) and ASCII digits/symbols.
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "01234567890!@#$%^&*()_+-=[]{}|;:,.<>?/";

/* ─── Types ──────────────────────────────────────────────────── */
interface Column {
  y:     number;   // current head position in rows
  speed: number;   // rows per frame multiplier
  len:   number;   // trail length in rows
}

/* ─── Component ──────────────────────────────────────────────── */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FONT_SIZE   = 14;          // px — cell height
    const OPACITY_MIN = 0.04;        // strictly in [0.04, 0.06]
    const OPACITY_MAX = 0.06;

    let raf: number;
    let cols: Column[] = [];
    let charW = FONT_SIZE * 0.7;     // monospace character width estimate
    let numCols = 0;

    /* ── Resize handler ── */
    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;

      charW   = FONT_SIZE * 0.65;
      numCols = Math.ceil(canvas!.width / charW);

      // Re-initialise columns, preserving existing progress where possible
      cols = Array.from({ length: numCols }, (_, i) => ({
        y:     cols[i]?.y ?? Math.random() * -80,
        speed: 0.2 + Math.random() * 0.35,   // rows/frame — slow & subtle
        len:   Math.floor(8 + Math.random() * 20),
      }));
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── Draw loop ── */
    function draw() {
      if (!canvas || !ctx) return;

      // Fade existing pixels slightly each frame (creates trailing effect)
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;

      for (let c = 0; c < cols.length; c++) {
        const col  = cols[c];
        const x    = c * charW;

        // Draw a trail of characters from (y - len) to y
        for (let row = 0; row < col.len; row++) {
          const rowY      = (col.y - row) * FONT_SIZE;
          if (rowY < -FONT_SIZE || rowY > canvas.height + FONT_SIZE) continue;

          // Opacity falls off toward the tail
          const trailRatio  = 1 - row / col.len;
          const alpha       = OPACITY_MIN + (OPACITY_MAX - OPACITY_MIN) * trailRatio;

          // Head character is slightly brighter
          const isHead = row === 0;
          const r = isHead ? 160 : 0;
          const g = isHead ? 255 : 200;
          const b = isHead ? 160 : 0;

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;

          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(char, x, rowY);
        }

        // Advance column
        col.y += col.speed;

        // Reset when trail has fully scrolled past bottom
        if ((col.y - col.len) * FONT_SIZE > canvas.height) {
          col.y     = Math.random() * -30;
          col.speed = 0.2 + Math.random() * 0.35;
          col.len   = Math.floor(8 + Math.random() * 20);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:  "absolute",
        inset:     0,
        width:     "100%",
        height:    "100%",
        display:   "block",
        zIndex:    0,
        // Pointer events off — never intercepts clicks
        pointerEvents: "none",
      }}
    />
  );
}
