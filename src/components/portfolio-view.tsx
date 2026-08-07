"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowRight, Check, CirclePause, CirclePlay, Mail, Network, Terminal, Radio, X } from "lucide-react"
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { projects, type Project } from "../lib/portfolio-data"
import { HeroBackground } from "./portfolio/hero-background"
import { ProfileCard } from "./portfolio/profile-card"
import { ProjectCard } from "./portfolio/project-card"
import { ProjectDialog } from "./portfolio/project-dialog"
import { HyperspaceRouter } from "./portfolio/hyperspace-router"
import { FoundationSection } from "./portfolio/foundation-section"
import { DeploymentsSection } from "./portfolio/deployments-section"

const tourSteps = [
  { label: "Systems", target: "systems", duration: 8000 },
  { label: "Architecture", target: "systems", duration: 11000 },
  { label: "Foundation", target: "foundation", duration: 9000 },
  { label: "Connection", target: "contact", duration: 9000 },
]

export function PortfolioView() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [routeActive, setRouteActive] = useState(false)
  const [hasWarped, setHasWarped] = useState(false)
  const [systemsVisible, setSystemsVisible] = useState(false)
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [routeStatus, setRouteStatus] = useState("")
  const [tour, setTour] = useState({ active: false, paused: false, step: 0 })
  const heroRef = useRef<HTMLElement>(null)
  const routeActiveRef = useRef(false)
  const hasWarpedRef = useRef(false)
  const lastScrollYRef = useRef(0)
  const lastScrollTimeRef = useRef(0)

  const startRoute = useCallback(() => {
    if (routeActiveRef.current || hasWarpedRef.current) {
      setRouteStatus("Already routed")
      window.setTimeout(() => setRouteStatus(""), 1600)
      return
    }
    routeActiveRef.current = true
    hasWarpedRef.current = true
    setRouteStatus("")
    setRouteActive(true)
  }, [])

  const finishRoute = useCallback(() => {
    routeActiveRef.current = false
    setRouteActive(false)
    setHasWarped(true)
    // HyperspaceRouter already handles smooth scroll — just reveal the section
    window.requestAnimationFrame(() => {
      setSystemsVisible(true)
      history.replaceState(null, "", "#architecture_logs")
    })
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    lastScrollYRef.current = window.scrollY
    lastScrollTimeRef.current = performance.now()

    const handleScroll = () => {
      if (hasWarpedRef.current || routeActiveRef.current) return

      const now = performance.now()
      const elapsed = Math.max(now - lastScrollTimeRef.current, 16)
      const delta = window.scrollY - lastScrollYRef.current
      setScrollVelocity(Math.abs(delta / elapsed) * 100)
      lastScrollYRef.current = window.scrollY
      lastScrollTimeRef.current = now

      const triggerPoint = hero.offsetTop + hero.offsetHeight * 0.9
      if (window.scrollY >= triggerPoint) startRoute()
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [startRoute])

  useEffect(() => {
    if (!tour.active || tour.paused) return
    const step = tourSteps[tour.step]
    document.getElementById(step.target)?.scrollIntoView({ behavior: "smooth", block: "start" })
    if (tour.step === 1) setSelected(projects[0])
    else setSelected(null)
    const timer = window.setTimeout(() => {
      if (tour.step === tourSteps.length - 1) setTour({ active: false, paused: false, step: 0 })
      else setTour((current) => ({ ...current, step: current.step + 1 }))
    }, step.duration)
    return () => window.clearTimeout(timer)
  }, [tour.active, tour.paused, tour.step])

  const startTour = () => {
    setTour({ active: true, paused: false, step: 0 })
    document.getElementById("systems")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main>
      <header className="observatory-header">
        <a className="brand" href="#top" aria-label="atrivers3 home">
          <span className="brand-mark"><Terminal strokeWidth={2.5} /></span>
          <span><strong>atrivers3</strong><small>Backend &amp; Distributed Systems</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#systems">Systems</a><a href="#deployments">Experience</a><a href="#foundation">Foundation</a>
        </nav>
        <a className="contact-chip" href="#contact"><span className="status-dot" /> Open to build <ArrowRight /></a>
      </header>

      <section className="hero" id="top" ref={heroRef}>
        <HeroBackground />
        <div className="hero-grid">
          <div className="hero-content">
            <div className="eyebrow font-mono"><span className="status-dot" /> SYSTEM STATUS / AVAILABLE</div>
            <h1>I build systems that <span>don't surprise you.</span></h1>
            <p className="hero-lede">I&apos;m Ayan Aslam <span>(@atrivers3)</span>, a backend and distributed systems engineer who builds reliable infrastructure, designs for failure, and keeps systems running at scale.</p>
            <div className="hero-actions">
              <a 
                href="https://drive.google.com/drive/folders/16w0qoOGRsy1h_fjroOrxNc0cpKhcD5L-?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="primary-action"
              >
                📄 View Resume →
              </a>
              <a className="secondary-action" href="#contact">Open a connection</a>
              <span className="route-status font-mono" id="route-status" aria-live="polite">{routeStatus}</span>
            </div>
            <div className="hero-signals font-mono">
              <span><small>FOCUS</small>Distributed systems</span>
              <span><small>PRINCIPLE</small>Failure-aware design</span>
              <span><small>LOCATION</small>UTC+05 / Remote</span>
            </div>
          </div>
          <ProfileCard />
        </div>
        <a href="#systems" className="scroll-cue"><ArrowDown /><span className="font-mono">OBSERVE SYSTEMS</span></a>
      </section>

      <section className={`section systems-section ${systemsVisible || routeActive ? "systems-visible" : "systems-hidden"}`} id="systems" aria-hidden={!systemsVisible}>
        <div className="section-heading">
          <div><span className="section-index font-mono">01 / SYSTEMS BUILT</span><h2>Engineered implementations,<br />made inspectable.</h2></div>
          <p>Each system exposes the code, topology, tradeoffs, and measured operating characteristics behind the interface.</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => <ProjectCard key={project.id} project={project} onInspect={() => setSelected(project)} forced={tour.active && tour.step <= 1 && index === 0} />)}
        </div>
      </section>

      <DeploymentsSection />

      <FoundationSection />

      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div><span className="section-index font-mono">04 / OPEN CONNECTION</span><h2>Have a system<br />waiting to be built?</h2></div>
          <div className="contact-copy">
            <p>I build software and systems with a focus on clear architecture, reliable behavior, and maintainable code.</p>
            <div>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayan.aslam.cs@gmail.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <Mail /> Email Ayan
              </a>
              <a href="https://github.com/atrivers3" target="_blank" rel="noopener noreferrer">
                <FaGithub className="h-4 w-4" /> GitHub
              </a>
              <a href="https://linkedin.com/in/atrivers3" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
        <footer><span>AYAN ARAIN / BACKEND &amp; DISTRIBUTED SYSTEMS</span><span className="font-mono">atrivers3 / build 2026.08</span></footer>
      </section>

      {tour.active && <div className="tour-control" role="status" aria-live="polite">
        <div className="tour-meta"><span className="font-mono">GUIDED TRACE {tour.step + 1}/4</span><strong>{tourSteps[tour.step].label}</strong></div>
        <div className="tour-progress"><i style={{ width: `${((tour.step + 1) / 4) * 100}%` }} /></div>
        <button type="button" onClick={() => setTour((value) => ({ ...value, paused: !value.paused }))} aria-label={tour.paused ? "Resume tour" : "Pause tour"}>{tour.paused ? <CirclePlay /> : <CirclePause />}</button>
        <button type="button" onClick={() => setTour({ active: false, paused: false, step: 0 })} aria-label="Close tour"><X /></button>
      </div>}

      <ProjectDialog project={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
      <HyperspaceRouter active={routeActive} scrollVelocity={scrollVelocity} onComplete={finishRoute} nextSectionId="systems" />
    </main>
  )
}
