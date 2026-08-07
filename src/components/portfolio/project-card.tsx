"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Braces, Boxes, CircuitBoard, ScanLine } from "lucide-react"
import type { Project } from "@/lib/portfolio-data"

const phases = ["code", "scramble", "pixels", "architecture", "preview"] as const
type Phase = (typeof phases)[number]

export function ProjectCard({ project, onInspect, forced = false }: { project: Project; onInspect: () => void; forced?: boolean }) {
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<Phase>("code")
  const timers = useRef<number[]>([])
  const isActive = active || forced

  useEffect(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
    if (!isActive) {
      setPhase("code")
      return
    }
    phases.slice(1).forEach((next, index) => {
      timers.current.push(window.setTimeout(() => setPhase(next), 260 * (index + 1)))
    })
    return () => timers.current.forEach(window.clearTimeout)
  }, [isActive])

  return (
    <article
      className="project-card"
      data-project-id={project.id}
      data-trigger-hover="project-reveal"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(false)
      }}
    >
      <div className="project-topline font-mono">
        <span>{project.category}</span>
        <span className="phase-readout"><span className="status-dot" /> {phase.toUpperCase()}</span>
      </div>
      <div className="reveal-surface" data-phase={phase}>
        <div className="stage-code font-mono">
          {project.code.map((line, index) => <code key={`${project.id}-${index}`}>{line}</code>)}
        </div>
        <div className="stage-scramble font-mono" aria-hidden="true">
          {project.code.join(" ").split("").slice(0, 142).map((char, index) => <span key={index}>{index % 5 === 0 ? "#" : index % 7 === 0 ? "0" : char}</span>)}
        </div>
        <div className="stage-pixels" aria-hidden="true">
          {Array.from({ length: 96 }).map((_, index) => <i key={index} style={{ opacity: ((index * 17) % 10) / 10 }} />)}
        </div>
        <div className="stage-architecture" aria-hidden="true">
          {project.nodes.map((node, index) => (
            <div className="arch-node" key={node} style={{ left: `${9 + index * 25}%`, top: `${index % 2 ? 58 : 27}%` }}>
              <CircuitBoard /> <span>{node}</span>
            </div>
          ))}
          <svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M15 14 C27 14 25 27 39 27 S53 14 65 14 S78 27 90 27" /></svg>
        </div>
        <div className="stage-preview">
          <div className="preview-header"><ScanLine /><span>Production snapshot</span></div>
          <div className="preview-chart">{Array.from({ length: 18 }).map((_, index) => <i key={index} style={{ height: `${24 + ((index * 29) % 62)}%` }} />)}</div>
          <div className="preview-status"><span><span className="status-dot" /> Operational</span><span>Last deploy 14m</span></div>
        </div>
      </div>
      <div className="project-copy">
        <div>
          <span className="project-icon">{phase === "code" ? <Braces /> : <Boxes />}</span>
          <h3>{project.name}</h3>
        </div>
        <p>{project.summary}</p>
      </div>
      <div className="metric-grid">
        {project.metrics.map((metric) => <div key={metric.label}><span className="font-mono">{metric.value}</span><small>{metric.label}</small></div>)}
      </div>
      <button type="button" className="inspect-button" onClick={onInspect}>
        View Implementation <ArrowUpRight />
      </button>
    </article>
  )
}
