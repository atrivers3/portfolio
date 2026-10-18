"use client"

import { useEffect, useState } from "react"

export function HeroTerminal() {
  const fullCommand = "curl atrivers3.dev/health"
  const [displayedCommand, setDisplayedCommand] = useState("")
  const [showResponse, setShowResponse] = useState(false)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setDisplayedCommand(fullCommand)
      setShowResponse(true)
      return
    }

    let currentIndex = 0
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        currentIndex++
        setDisplayedCommand(fullCommand.slice(0, currentIndex))
        if (currentIndex >= fullCommand.length) {
          clearInterval(interval)
          setTimeout(() => setShowResponse(true), 250)
        }
      }, 35)

      return () => clearInterval(interval)
    }, 350)

    return () => clearTimeout(startDelay)
  }, [])

  return (
    <div className="hero-terminal font-mono" aria-label="System healthcheck terminal">
      <div className="hero-terminal-header">
        <div className="hero-terminal-dots" aria-hidden="true">
          <span className="dot dot-close" />
          <span className="dot dot-minimize" />
          <span className="dot dot-expand" />
        </div>
        <span className="hero-terminal-title">portfolio/atrivers3</span>
        <span className="hero-terminal-badge">HTTP 200 OK</span>
      </div>
      <div className="hero-terminal-body">
        <div className="terminal-prompt-line">
          <span className="terminal-prompt-user">
            <span className="prompt-host">atrivers3</span>
            <span className="prompt-sep">:</span>
            <span className="prompt-path">~</span>
            <span className="prompt-symbol">$</span>
          </span>
          <span className="terminal-cmd-wrapper">
            <span className="terminal-cmd">{displayedCommand}</span>
            {!showResponse && <span className="terminal-cursor" aria-hidden="true">▋</span>}
          </span>
        </div>
        {showResponse && (
          <div className="terminal-output-line">
            <span className="json-brace">&#123;</span>
            <span className="json-item">
              <span className="json-key">&quot;status&quot;</span>
              <span className="json-colon">:</span>
              <span className="json-val-status">&quot;available&quot;</span>
              <span className="json-comma">, </span>
            </span>
            <span className="json-item">
              <span className="json-key">&quot;focus&quot;</span>
              <span className="json-colon">:</span>
              <span className="json-val-focus">&quot;backend systems&quot;</span>
            </span>
            <span className="json-brace">&#125;</span>
          </div>
        )}
      </div>
    </div>
  )
}
