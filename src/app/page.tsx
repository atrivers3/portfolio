"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MatrixRain from "./components/MatrixRain";
import ArchitectureLab from "./components/ArchitectureLab";
import Autopilot from "./components/Autopilot";

/* ─── Type Definitions ───────────────────────────────────────── */
interface NavLink {
  label: string;
  href:  string;
}

interface ProjectLink {
  label: string;
  href:  string;
}

interface ProjectCard {
  id:        string;
  codename:  string;
  tagline:   string;
  stack:     string[];
  status:    "operational" | "in-progress" | "production" | "active" | "research";
  challenge: string;
  decision:  string;
  tradeoff:  string;
  result:    string;
  links:     ProjectLink[];
}

interface ArchLayer {
  id:    string;
  title: string;
  items: string[];
}

interface Experience {
  id:          string;
  role:        string;
  org:         string;
  period:      string;
  location:    string;
  points:      string[];
  type:        "education" | "internship" | "contract" | "full-time";
}

/* ─── Static Data ────────────────────────────────────────────── */
const NAV_LINKS: NavLink[] = [
  { label: "Home",         href: "#home"         },
  { label: "Projects",     href: "#projects"     },
  { label: "Architecture", href: "#architecture" },
  { label: "Experience",   href: "#experience"   },
  { label: "Contact",      href: "#contact"      },
];

const PROJECTS: ProjectCard[] = [
  {
    id:        "mini-ai-agent",
    codename:  "MINI AI AGENT",
    tagline:   "Autonomous Reasoning & Workflow Engine",
    stack:     ["Python", "FastAPI", "Supabase", "Tavily"],
    status:    "operational",
    challenge: "Preventing state token collapses and structural looping failures during recursive, multi-step tool execution.",
    decision:  "Developed an autonomous execution engine running an iterative Thought → Action → Observation (ReAct) loop, backed by secure asynchronous session state tracking.",
    tradeoff:  "Increased relational database write frequencies to guarantee completely isolated session state snapshots.",
    result:    "Built a highly dependable multi-step reasoning architecture exposed via secure, high-throughput asynchronous endpoints.",
    links:     [{ label: "GitHub", href: "#" }, { label: "Live Demo", href: "#" }],
  },
  {
    id:        "raabta",
    codename:  "RAABTA",
    tagline:   "AI-Driven Sign Language Accessibility System",
    stack:     ["Python", "JavaScript", "Supabase", "Blender"],
    status:    "operational",
    challenge: "Translating natural language and voice structures into seamless, continuous 3D sign language coordinate streams without frame stuttering.",
    decision:  "Architected a full-stack programmatic translation pipeline driven by low-latency REST APIs and a unified database synchronization layer.",
    tradeoff:  "Shifted geometry coordinate processing loads to client-side caching to reduce raw server-side compute overhead.",
    result:    "Delivered a reliable real-time translation backend utilizing Supabase for low-latency data synchronization.",
    links:     [{ label: "GitHub", href: "#" }, { label: "Live Demo", href: "#" }],
  },
  {
    id:        "parhofast",
    codename:  "PARHOFAST",
    tagline:   "Enterprise-Style Educational Portal",
    stack:     ["Node.js", "HTML/CSS", "JavaScript", "MS SQL Server"],
    status:    "operational",
    challenge: "Architecting secure data access isolation across highly multi-tenant educational permission structures.",
    decision:  "Built a robust full-stack application running on a normalized relational MS SQL Server backend with custom Role-Based Access Control (RBAC) middleware.",
    tradeoff:  "Accept higher schema structural rigidity to ensure absolute relational data security constraints.",
    result:    "Shipped a highly secure database system with granular, deterministic data access layers.",
    links:     [{ label: "GitHub", href: "#" }, { label: "Live Demo", href: "#" }],
  },
  {
    id:        "nine-mens-morris",
    codename:  "NINE MEN'S MORRIS",
    tagline:   "Algorithmic AI Opponent Engine",
    stack:     ["Python", "Tkinter"],
    status:    "operational",
    challenge: "Computing perfect game-state evaluations instantly without introducing frame-rate drops to the graphical user interface.",
    decision:  "Programmed an advanced state game backed by a modular architecture running evaluations optimized via an Alpha-Beta Minimax search tree.",
    tradeoff:  "Pruned lookahead tree depths at aggressive thresholds to guarantee immediate rendering times in Tkinter.",
    result:    "Achieved fluid, zero-latency human-vs-AI state tracking and evaluation loops.",
    links:     [{ label: "GitHub", href: "#" }],
  },
  {
    id:        "cv-workspace",
    codename:  "CV WORKSPACE",
    tagline:   "Real-Time Human Pose Estimation Pipeline",
    stack:     ["Python", "OpenCV", "MediaPipe", "OpenAI"],
    status:    "operational",
    challenge: "Extracting precise hand-tracking and body coordinates smoothly from unstable video capture streams.",
    decision:  "Engineered high-frequency real-time computer vision pipelines optimizing frame tracking structures for upstream accessibility architectures.",
    tradeoff:  "Sacrificed high-density depth verification matrices to optimize for immediate 2D frame execution speed.",
    result:    "Stabilized video input streams into reliable coordinate maps to support architectural decisions in accessibility-focused AI tools.",
    links:     [{ label: "GitHub", href: "#" }],
  },
  {
    id:        "move-fast",
    codename:  "MOVE FAST",
    tagline:   "Multi-Tenant Mobile Carpooling Architecture",
    stack:     ["React Native", "Node.js", "Express", "PostgreSQL"],
    status:    "in-progress",
    challenge: "Matching dynamic, concurrent route synchronization streams across dual user roles (Drivers and Riders) simultaneously.",
    decision:  "Building a cross-platform mobile engine running on a RESTful Node.js backend backed by structured PostgreSQL relational matching.",
    tradeoff:  "Using optimized database polling routes initially to minimize persistent socket overhead during early-stage deployment.",
    result:    "Structured a scalable mobile-to-backend pipeline supporting profile tracking, role management, and stable route generation.",
    links:     [{ label: "GitHub", href: "#" }],
  },
];

const ARCH_LAYERS: ArchLayer[] = [
  {
    id:    "ingress",
    title: "Ingress & API Gateway",
    items: [
      "Edge termination with mTLS and rate-limiting (token bucket)",
      "Schema-first contract enforcement via OpenAPI 3.1",
      "Graceful degradation with circuit-breaker patterns",
    ],
  },
  {
    id:    "processing",
    title: "Processing & Compute",
    items: [
      "Async task orchestration with Celery + Redis broker",
      "Stateless service containers with horizontal pod autoscaling",
      "ML inference serving via ONNX Runtime with batching queues",
    ],
  },
  {
    id:    "persistence",
    title: "Persistence & Consistency",
    items: [
      "CQRS write/read separation across OLTP and OLAP stores",
      "Event sourcing with idempotency guarantees",
      "Automated schema migrations with zero-downtime rollout",
    ],
  },
  {
    id:    "observability",
    title: "Observability & Reliability",
    items: [
      "Distributed tracing with OpenTelemetry propagation",
      "Structured JSON logging with correlation IDs",
      "SLI / SLO dashboards and automated PagerDuty routing",
    ],
  },
];

const EXPERIENCES: Experience[] = [
  {
    id:       "fast-nuces",
    role:     "B.S. Computer Science",
    org:      "FAST-NUCES, Karachi Campus",
    period:   "Graduation: June 2026",
    location: "Karachi, Pakistan",
    type:     "education",
    points: [
      "Studied Operating Systems, Distributed Computing, Database Systems, and Machine Learning.",
      "Led backend sub-team in final-year capstone delivering a production-grade SaaS platform.",
      "Consistently ranked in top-tier cohort for Systems Programming and Algorithms coursework.",
    ],
  },
  {
    id:       "orbhex",
    role:     "Python Developer",
    org:      "Orbhex",
    period:   "Tenure concluded late 2025",
    location: "Remote",
    type:     "full-time",
    points: [
      "Designed and shipped Python automation systems that replaced manual data-processing workflows, reducing operational overhead by over 60%.",
      "Built a modular ETL pipeline (Python, PostgreSQL, Celery) for ingesting and normalising high-volume third-party API feeds with full retry and dead-letter semantics.",
      "Developed backend REST APIs using FastAPI, enforcing schema validation with Pydantic and writing integration test suites with pytest to maintain >90% code coverage.",
      "Containerised services with Docker and wrote deployment manifests; collaborated on CI/CD pipeline configuration to enable zero-downtime releases.",
    ],
  },
];

/* ─── Status Badge ───────────────────────────────────────────── */
const STATUS_MAP: Record<ProjectCard["status"], { label: string; color: string }> = {
  operational:  { label: "OPERATIONAL",  color: "#22c55e" },
  "in-progress":{ label: "IN PROGRESS",  color: "#f59e0b" },
  production:   { label: "Production",   color: "#22c55e" },
  active:       { label: "Active Dev",   color: "#00c8ff" },
  research:     { label: "Research",     color: "#a78bfa" },
};

/* ─── Component: Sticky Nav ──────────────────────────────────── */
function Nav({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="nav-bar"
      role="navigation"
      aria-label="Primary navigation"
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        zIndex:          50,
        height:          "var(--nav-height)",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 48px",
        borderBottom:    scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        backgroundColor: scrolled ? "rgba(0,0,0,0.88)" : "transparent",
        backdropFilter:  scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        transition:      "background-color 220ms ease, border-color 220ms ease",
      }}
    >
      {/* Wordmark */}
      <a
        href="#home"
        aria-label="Return to top"
        style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.875rem",
          color:         "var(--color-accent)",
          letterSpacing: "0.08em",
          fontWeight:    500,
        }}
      >
        atrivers3
      </a>

      {/* Links */}
      <ul
        role="list"
        style={{
          display:    "flex",
          gap:        "32px",
          listStyle:  "none",
        }}
      >
        {NAV_LINKS.map((link) => {
          const sectionId    = link.href.replace("#", "");
          const isActive     = activeSection === sectionId;
          return (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                style={{
                  fontSize:      "0.8125rem",
                  fontWeight:    isActive ? 500 : 400,
                  color:         isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  letterSpacing: "0.01em",
                  transition:    "color 150ms ease",
                  paddingBottom: "2px",
                  borderBottom:  isActive ? "1px solid var(--color-accent)" : "1px solid transparent",
                }}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─── Component: Section Label ───────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "0.7rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color:         "var(--color-accent)",
        marginBottom:  "16px",
      }}
    >
      {children}
    </p>
  );
}

/* ─── Component: Section Heading ─────────────────────────────── */
function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontSize:     "clamp(1.75rem, 3vw, 2.5rem)",
        fontWeight:   600,
        color:        "var(--color-text-primary)",
        marginBottom: "12px",
      }}
    >
      {children}
    </h2>
  );
}

/* ─── Component: ASCII HUD ───────────────────────────────────── */
const HUD_LINES = [
  "AYAN.OS",
  "STATUS: AVAILABLE",
  "LOCATION: KARACHI, PK",
  "TARGET: REMOTE / ONSITE",
  "CURRENT FOCUS: BACKEND ENGINEERING,",
  "               AI SYSTEMS, .NET",
];

function HudDisplay() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.pause();
      // Lock on last frame
      video.currentTime = Math.max(0, video.duration - 0.03);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <>
      <div className="w-full max-w-[280px] h-[380px] mx-auto overflow-hidden relative flex items-center justify-center bg-black/60 rounded border border-neutral-900 mb-4">
        <video
          ref={videoRef}
          autoPlay={true}
          muted={true}
          playsInline={true}
          preload="metadata"
          controls={false}
          loop={false}
          className="w-full h-full object-contain"
        >
          <source src="/assets/ayan-ascii-av1.webm" type='video/webm; codecs="av01.0.05M.08"' />
          <source src="/assets/ayan-ascii-vp9.webm" type='video/webm; codecs="vp9"' />
        </video>
      </div>
      {HUD_LINES.map((line, i) => (
        <span key={i} style={{ display: "block", fontSize: "0.75rem", lineHeight: "1.4" }}>
          {line}
        </span>
      ))}
    </>
  );
}

/* ─── Component: Case Study Field ───────────────────────────── */
interface CaseStudyFieldProps {
  label:    string;
  children: React.ReactNode;
}
function CaseStudyField({ label, children }: CaseStudyFieldProps) {
  return (
    <div>
      <p
        style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.65rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         "var(--color-text-muted)",
          marginBottom:  "6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize:   "0.875rem",
          color:      "var(--color-text-secondary)",
          lineHeight: 1.7,
        }}
      >
        {children}
      </p>
    </div>
  );
}

/* ─── Component: Demo Offline Toast ─────────────────────────── */
const OFFLINE_MSG =
  "Deployment temporarily offline to optimize cloud compute overhead. " +
  "Complete system architecture and engine source code available via GitHub.";

interface DemoToastProps {
  onClose: () => void;
}
function DemoToast({ onClose }: DemoToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="demo-toast"
        role="alertdialog"
        aria-modal="true"
        aria-label="Deployment status notice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          200,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          padding:         "24px",
          backgroundColor: "rgba(0,0,0,0.72)",
          backdropFilter:  "blur(4px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, y: 16, opacity: 0 }}
          animate={{ scale: 1,    y: 0,  opacity: 1 }}
          exit={{ scale: 0.95, y: 8, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth:        "480px",
            width:           "100%",
            backgroundColor: "#0a0a0a",
            border:          "1px solid var(--color-border)",
            borderRadius:    "6px",
            overflow:        "hidden",
          }}
        >
          {/* Toast header */}
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "14px 20px",
              borderBottom:   "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>◉</span>
              <p
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "0.68rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "#f59e0b",
                }}
              >
                Deployment Status
              </p>
            </div>
            <button
              aria-label="Dismiss"
              onClick={onClose}
              style={{
                background:  "none",
                border:      "none",
                color:       "var(--color-text-muted)",
                cursor:      "pointer",
                fontFamily:  "var(--font-mono)",
                fontSize:    "0.875rem",
                lineHeight:  1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Toast body */}
          <div style={{ padding: "20px" }}>
            <p
              style={{
                fontSize:   "0.875rem",
                color:      "var(--color-text-secondary)",
                lineHeight: 1.72,
              }}
            >
              {OFFLINE_MSG}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Component: ProjectList ─────────────────────────────────── */
function ProjectList() {
  const [openId,    setOpenId]    = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleSetProject = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string | null }>;
      if (customEvent.detail !== undefined) {
        setOpenId(customEvent.detail.id);
      }
    };
    window.addEventListener("autopilot:set-project", handleSetProject);
    return () => window.removeEventListener("autopilot:set-project", handleSetProject);
  }, []);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  const handleDemoClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Only intercept placeholder "#" demo links
    if (href === "#") {
      e.preventDefault();
      setShowToast(true);
    }
  };

  return (
    <>
      {showToast && <DemoToast onClose={() => setShowToast(false)} />}

      <div
        style={{
          display:         "flex",
          flexDirection:   "column",
          gap:             "1px",
          backgroundColor: "var(--color-border)",
          border:          "1px solid var(--color-border)",
        }}
      >
        {PROJECTS.map((project, idx) => {
          const { label, color } = STATUS_MAP[project.status];
          const isOpen           = openId === project.id;

          return (
            <article
              key={project.id}
              id={`project-${project.id}`}
              aria-labelledby={`project-title-${project.id}`}
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              {/* ── Clickable header row ── */}
              <button
                id={`project-btn-${project.id}`}
                aria-expanded={isOpen}
                aria-controls={`project-body-${project.id}`}
                onClick={() => toggle(project.id)}
                style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems:          "center",
                  gap:                 "24px",
                  width:               "100%",
                  padding:             "28px 32px",
                  textAlign:           "left",
                  background:          "none",
                  border:              "none",
                  cursor:              "pointer",
                  color:               "inherit",
                  transition:          "background-color 150ms ease",
                }}
              >
                <div>
                  {/* Status row */}
                  <div
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      flexWrap:     "wrap",
                      gap:          "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {/* Index */}
                    <span
                      style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      "0.65rem",
                        color:         "var(--color-text-muted)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Status dot */}
                    <span
                      aria-label={`Status: ${label}`}
                      style={{
                        width:           "6px",
                        height:          "6px",
                        borderRadius:    "50%",
                        backgroundColor: color,
                        display:         "inline-block",
                        flexShrink:      0,
                      }}
                    />

                    {/* Codename */}
                    <h3
                      id={`project-title-${project.id}`}
                      style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      "0.78rem",
                        letterSpacing: "0.1em",
                        color:         "var(--color-accent)",
                        fontWeight:    500,
                      }}
                    >
                      {project.codename}
                    </h3>

                    {/* Status badge */}
                    <span
                      className="chip"
                      style={{
                        color:           color,
                        borderColor:     color + "44",
                        backgroundColor: color + "14",
                      }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p
                    style={{
                      fontSize:     "1.0625rem",
                      fontWeight:   600,
                      color:        "var(--color-text-primary)",
                      lineHeight:   1.3,
                      marginBottom: "10px",
                    }}
                  >
                    {project.tagline}
                  </p>

                  {/* Stack chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {project.stack.map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expand chevron */}
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize:   "1rem",
                    color:      isOpen ? "var(--color-accent)" : "var(--color-text-muted)",
                    display:    "inline-block",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ↓
                </motion.span>
              </button>

              {/* ── Expanding case-study pane ── */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`project-body-${project.id}`}
                    role="region"
                    aria-labelledby={`project-title-${project.id}`}
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        padding:    "0 32px 36px",
                        borderTop:  "1px solid var(--color-border)",
                        paddingTop: "28px",
                        marginTop:  "0",
                      }}
                    >
                      {/* 2-col grid on wide, 1-col on narrow */}
                      <div
                        style={{
                          display:             "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                          gap:                 "24px 48px",
                          marginBottom:        "28px",
                        }}
                      >
                        <CaseStudyField label="Challenge">
                          {project.challenge}
                        </CaseStudyField>
                        <CaseStudyField label="Decision">
                          {project.decision}
                        </CaseStudyField>
                        <CaseStudyField label="Tradeoff">
                          {project.tradeoff}
                        </CaseStudyField>
                        <CaseStudyField label="Result">
                          <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>
                            {project.result}
                          </span>
                        </CaseStudyField>
                      </div>

                      {/* Action links */}
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {project.links.map((link) => {
                          const isOfflineDemo =
                            link.label === "Live Demo" && link.href === "#";

                          return (
                            <a
                              key={link.label}
                              id={`link-${project.id}-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                              href={isOfflineDemo ? undefined : link.href}
                              target={link.href !== "#" && !isOfflineDemo ? "_blank" : undefined}
                              rel={link.href !== "#" && !isOfflineDemo ? "noopener noreferrer" : undefined}
                              onClick={
                                isOfflineDemo
                                  ? (e) => handleDemoClick(e, link.href)
                                  : undefined
                              }
                              style={{
                                display:       "inline-flex",
                                alignItems:    "center",
                                gap:           "6px",
                                padding:       "7px 18px",
                                borderRadius:  "4px",
                                border:        isOfflineDemo
                                  ? "1px solid rgba(245,158,11,0.35)"
                                  : "1px solid var(--color-border)",
                                fontFamily:    "var(--font-mono)",
                                fontSize:      "0.75rem",
                                letterSpacing: "0.06em",
                                color:         isOfflineDemo
                                  ? "#f59e0b"
                                  : "var(--color-text-secondary)",
                                cursor:        "pointer",
                                transition:    "border-color 150ms ease, color 150ms ease",
                              }}
                            >
                              {isOfflineDemo ? "[ Live Demo ↗ ]" : `[ ${link.label} ]`}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </>
  );
}


/* ─── Page Component ─────────────────────────────────────────── */
export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home");

  /* Intersection Observer for active nav tracking */
  useEffect(() => {
    const sectionIds = ["home", "snapshot", "projects", "architecture", "experience", "contact"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <Nav activeSection={activeSection} />

      <main id="main-content" aria-label="Portfolio content">

        {/* ══════════════════════════════════════════════════════
            §1  HERO — #home
        ══════════════════════════════════════════════════════ */}
        <section
          id="home"
          aria-labelledby="hero-heading"
          className="section"
          style={{
            minHeight:  "100dvh",
            display:    "flex",
            alignItems: "center",
            paddingTop: "var(--nav-height)",
            position:   "relative",    /* needed for canvas + HUD positioning */
            overflow:   "hidden",
          }}
        >
          {/* ── Matrix Rain canvas — sits at z-index 0 ── */}
          <MatrixRain />

          {/* ── ASCII Corner HUD — top-right, visible ≥768 px ── */}
          <style>{`
            @media (min-width: 768px) { #hero-hud { display: block !important; } }
          `}</style>

          {/* ── ASCII Corner HUD — top-right ── */}
          <aside
            id="hero-hud"
            aria-label="Developer status readout"
            style={{
              position:      "absolute",
              top:           "calc(var(--nav-height) + 24px)",
              right:         "48px",
              zIndex:        2,
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.7rem",
              lineHeight:    1.8,
              letterSpacing: "0.06em",
              color:         "#22c55e",
              border:        "1px solid rgba(34,197,94,0.25)",
              backgroundColor: "rgba(0,0,0,0.55)",
              backdropFilter:  "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              padding:       "14px 20px",
              whiteSpace:    "pre",
              userSelect:    "none",
              display:       "none",  /* hidden on mobile; shown md+ via inline media below */
            }}
          >
            {/* Rendered as a single <pre>-like block for ASCII terminal look */}
            <HudDisplay />
          </aside>

          {/* ── Hero content sits above canvas at z-index 1 ── */}
          <div className="section-inner" style={{ width: "100%", position: "relative", zIndex: 1 }}>
            {/* Eyebrow */}
            <p
              className="chip chip-accent"
              style={{ marginBottom: "28px" }}
            >
              Available for opportunities
            </p>

            {/* Headline */}
            <h1
              id="hero-heading"
              style={{
                fontSize:      "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight:    700,
                lineHeight:    1.05,
                letterSpacing: "-0.03em",
                color:         "var(--color-text-primary)",
                maxWidth:      "820px",
                marginBottom:  "24px",
              }}
            >
              Backend engineer.
              <br />
              <span style={{ color: "var(--color-accent)" }}>AI systems</span> builder.
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                fontSize:     "clamp(1rem, 2vw, 1.2rem)",
                color:        "var(--color-text-secondary)",
                maxWidth:     "600px",
                lineHeight:   1.75,
                marginBottom: "44px",
              }}
            >
              I design and ship production-grade distributed systems and intelligent
              data pipelines. FAST-NUCES Karachi CS graduate with a bias for
              reliability, clean APIs, and observable architectures.
            </p>

            {/* CTA row */}
            <div
              style={{
                display:    "flex",
                gap:        "16px",
                flexWrap:   "wrap",
                alignItems: "center",
              }}
            >
              <a
                id="cta-projects"
                href="#projects"
                style={{
                  display:         "inline-flex",
                  alignItems:      "center",
                  padding:         "11px 28px",
                  borderRadius:    "4px",
                  backgroundColor: "var(--color-accent)",
                  color:           "#000",
                  fontWeight:      600,
                  fontSize:        "0.875rem",
                  letterSpacing:   "0.01em",
                  transition:      "background-color 150ms ease",
                }}
              >
                View Projects
              </a>
              <a
                id="cta-contact"
                href="#contact"
                style={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  padding:      "10px 28px",
                  borderRadius: "4px",
                  border:       "1px solid var(--color-border)",
                  color:        "var(--color-text-secondary)",
                  fontWeight:   400,
                  fontSize:     "0.875rem",
                  transition:   "border-color 150ms ease, color 150ms ease",
                }}
              >
                Get in touch
              </a>
              <Autopilot />
            </div>

            {/* Stack chips */}
            <div
              style={{
                display:   "flex",
                flexWrap:  "wrap",
                gap:       "8px",
                marginTop: "56px",
              }}
            >
              {["Python", "TypeScript", ".NET", "FastAPI", "PostgreSQL", "Redis", "Docker", "PyTorch"].map(
                (tech) => (
                  <span key={tech} className="chip">
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ══════════════════════════════════════════════════════
            §2  SNAPSHOT — #snapshot
        ══════════════════════════════════════════════════════ */}
        <section
          id="snapshot"
          aria-labelledby="snapshot-heading"
          className="section"
        >
          <div className="section-inner">
            <SectionLabel>§ 02 — Snapshot</SectionLabel>
            <SectionHeading id="snapshot-heading">
              At a glance
            </SectionHeading>
            <p
              style={{
                maxWidth:     "640px",
                marginBottom: "56px",
                color:        "var(--color-text-secondary)",
              }}
            >
              Everything a recruiter needs to know in three seconds — education,
              core stack, and execution scope.
            </p>

            {/* ── Recruiter Metric Scorecard — 3 columns ── */}
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap:                 "1px",
                backgroundColor:     "var(--color-border)",
                border:              "1px solid var(--color-border)",
              }}
            >
              {/* ── Col 1: Education ── */}
              <div
                id="snapshot-education"
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding:         "40px 32px",
                  display:         "flex",
                  flexDirection:   "column",
                  gap:             "12px",
                }}
              >
                <p
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:         "var(--color-text-muted)",
                  }}
                >
                  Education
                </p>
                <p
                  style={{
                    fontSize:   "clamp(1.4rem, 2.5vw, 2rem)",
                    fontWeight: 700,
                    color:      "var(--color-text-primary)",
                    lineHeight: 1.1,
                  }}
                >
                  CS Graduate
                </p>
                <p
                  style={{
                    fontSize:  "0.875rem",
                    color:     "var(--color-accent)",
                    fontWeight: 500,
                  }}
                >
                  FAST-NUCES<br />(Karachi Campus)
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  B.S. Computer Science · June 2026
                </p>
              </div>

              {/* ── Col 2: Core Stack ── */}
              <div
                id="snapshot-stack"
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding:         "40px 32px",
                  display:         "flex",
                  flexDirection:   "column",
                  gap:             "12px",
                }}
              >
                <p
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:         "var(--color-text-muted)",
                  }}
                >
                  Production Stack
                </p>
                <p
                  style={{
                    fontSize:   "clamp(1.4rem, 2.5vw, 2rem)",
                    fontWeight: 700,
                    color:      "var(--color-text-primary)",
                    lineHeight: 1.1,
                  }}
                >
                  Core Stack
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                  {["Python", "FastAPI", "Node.js", "AI Systems"].map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      "0.8125rem",
                        color:         "var(--color-accent)",
                        display:       "flex",
                        alignItems:    "center",
                        gap:           "8px",
                      }}
                    >
                      <span aria-hidden="true" style={{ color: "var(--color-accent-dim)" }}>›</span>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Col 3: Scale / Scope ── */}
              <div
                id="snapshot-scope"
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding:         "40px 32px",
                  display:         "flex",
                  flexDirection:   "column",
                  gap:             "12px",
                }}
              >
                <p
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:         "var(--color-text-muted)",
                  }}
                >
                  Execution Scope
                </p>
                <p
                  style={{
                    fontSize:   "clamp(2rem, 4vw, 3rem)",
                    fontWeight: 700,
                    color:      "var(--color-accent)",
                    lineHeight: 1,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  15+
                </p>
                <p
                  style={{
                    fontSize:   "clamp(1rem, 1.5vw, 1.2rem)",
                    fontWeight: 600,
                    color:      "var(--color-text-primary)",
                  }}
                >
                  Systems Built
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  From proof-of-concept to production-grade deployment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ══════════════════════════════════════════════════════
            §3  PROJECTS — #projects
        ══════════════════════════════════════════════════════ */}
        <section
          id="projects"
          aria-labelledby="projects-heading"
          className="section"
        >
          <div className="section-inner">
            <SectionLabel>§ 03 — Projects</SectionLabel>
            <SectionHeading id="projects-heading">
              Systems I have shipped
            </SectionHeading>
            <p style={{ maxWidth: "600px", marginBottom: "56px" }}>
              Click any card to read the full engineering case study — the
              challenge, the decision, the tradeoff, and the result.
            </p>

            <ProjectList />
          </div>
        </section>

        <div className="divider" />

        {/* ══════════════════════════════════════════════════════
            §4  ARCHITECTURE — #architecture
        ══════════════════════════════════════════════════════ */}
        <section
          id="architecture"
          aria-labelledby="arch-heading"
          className="section"
        >
          <div className="section-inner">
            <SectionLabel>§ 04 — Architecture Lab</SectionLabel>
            <SectionHeading id="arch-heading">
              Interactive system design
            </SectionHeading>
            <p style={{ maxWidth: "640px", marginBottom: "8px" }}>
              Toggle between a technical node-graph walkthrough and a plain-language
              business impact summary. Click any node to inspect backend implementation details.
            </p>

            <ArchitectureLab />
          </div>
        </section>

        <div className="divider" />

        {/* ══════════════════════════════════════════════════════
            §5  EXPERIENCE — #experience
        ══════════════════════════════════════════════════════ */}
        <section
          id="experience"
          aria-labelledby="experience-heading"
          className="section"
        >
          <div className="section-inner">
            <SectionLabel>§ 05 — Experience</SectionLabel>
            <SectionHeading id="experience-heading">
              Where I have worked &amp; studied
            </SectionHeading>
            <p style={{ maxWidth: "600px", marginBottom: "56px" }}>
              A record of the environments that shaped my engineering discipline
              and systems intuition.
            </p>

            {/* Timeline */}
            <ol
              role="list"
              aria-label="Career and education timeline"
              style={{ display: "flex", flexDirection: "column", gap: "0" }}
            >
              {EXPERIENCES.map((exp, idx) => (
                <li
                  key={exp.id}
                  id={`exp-${exp.id}`}
                  style={{
                    display:   "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap:       "0 28px",
                    position:  "relative",
                  }}
                >
                  {/* Left rail */}
                  <div
                    style={{
                      display:        "flex",
                      flexDirection:  "column",
                      alignItems:     "center",
                      paddingTop:     "4px",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width:           "10px",
                        height:          "10px",
                        borderRadius:    "50%",
                        backgroundColor: exp.type === "education" ? "var(--color-accent)" : "var(--color-border)",
                        border:          "2px solid var(--color-accent)",
                        flexShrink:      0,
                      }}
                    />
                    {idx < EXPERIENCES.length - 1 && (
                      <div
                        aria-hidden="true"
                        style={{
                          width:           "1px",
                          flex:            1,
                          minHeight:       "32px",
                          backgroundColor: "var(--color-border)",
                          margin:          "6px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingBottom: idx < EXPERIENCES.length - 1 ? "40px" : "0" }}>
                    <div
                      style={{
                        display:        "flex",
                        flexWrap:       "wrap",
                        alignItems:     "baseline",
                        gap:            "8px 16px",
                        marginBottom:   "6px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize:   "1rem",
                          fontWeight: 600,
                          color:      "var(--color-text-primary)",
                        }}
                      >
                        {exp.role}
                      </h3>
                      <span style={{ color: "var(--color-accent)", fontSize: "0.875rem" }}>
                        @ {exp.org}
                      </span>
                    </div>

                    <div
                      style={{
                        display:       "flex",
                        gap:           "16px",
                        marginBottom:  "16px",
                        flexWrap:      "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize:   "0.75rem",
                          color:      "var(--color-text-muted)",
                        }}
                      >
                        {exp.period}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize:   "0.75rem",
                          color:      "var(--color-text-muted)",
                        }}
                      >
                        {exp.location}
                      </span>
                    </div>

                    <ul
                      role="list"
                      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                    >
                      {exp.points.map((point) => (
                        <li
                          key={point}
                          style={{
                            fontSize:   "0.875rem",
                            color:      "var(--color-text-secondary)",
                            lineHeight: 1.65,
                            display:    "flex",
                            gap:        "10px",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              color:      "var(--color-accent-dim)",
                              fontFamily: "var(--font-mono)",
                              flexShrink: 0,
                            }}
                          >
                            —
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="divider" />

        {/* ══════════════════════════════════════════════════════
            §6  CONTACT — #contact
        ══════════════════════════════════════════════════════ */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="section"
          style={{ minHeight: "50dvh" }}
        >
          <div className="section-inner">
            <SectionLabel>§ 06 — Contact</SectionLabel>
            <SectionHeading id="contact-heading">
              Let&#39;s build something together
            </SectionHeading>
            <p style={{ maxWidth: "520px", marginBottom: "48px" }}>
              I am open to full-time backend / AI engineering roles, technical
              contracts, and interesting collaboration. Reach out — I respond
              promptly.
            </p>

            {/* Contact methods grid */}
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap:                 "1px",
                backgroundColor:     "var(--color-border)",
                border:              "1px solid var(--color-border)",
                maxWidth:            "720px",
                marginBottom:        "48px",
              }}
            >
              {[
                { id: "contact-email",    label: "Email",    value: "ayan.aslam.cs@gmail.com",          href: "mailto:ayan.aslam.cs@gmail.com" },
                { id: "contact-github",   label: "GitHub",   value: "github.com/atrivers3",             href: "https://github.com/atrivers3" },
                { id: "contact-linkedin", label: "LinkedIn", value: "linkedin.com/in/atrivers3",         href: "https://www.linkedin.com/in/atrivers3/" },
              ].map((item) => (
                <a
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  target={item.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={item.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  style={{
                    display:         "flex",
                    flexDirection:   "column",
                    gap:             "6px",
                    padding:         "28px 28px 24px",
                    backgroundColor: "var(--color-surface)",
                    transition:      "background-color 150ms ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily:    "var(--font-mono)",
                      fontSize:      "0.65rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color:         "var(--color-text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize:  "0.875rem",
                      color:     "var(--color-accent)",
                      fontWeight: 500,
                    }}
                  >
                    {item.value}
                  </span>
                </a>
              ))}
            </div>

            {/* Availability status */}
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width:           "8px",
                  height:          "8px",
                  borderRadius:    "50%",
                  backgroundColor: "#22c55e",
                  display:         "inline-block",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize:   "0.75rem",
                  color:      "var(--color-text-muted)",
                  letterSpacing: "0.04em",
                }}
              >
                Currently available — actively looking for the right team.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          role="contentinfo"
          className="border-t-subtle"
          style={{
            padding:        "28px 48px",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            flexWrap:       "wrap",
            gap:            "12px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize:   "0.72rem",
              color:      "var(--color-text-muted)",
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} Ayan Aslam — built with Next.js
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize:   "0.72rem",
              color:      "var(--color-text-muted)",
            }}
          >
            FAST-NUCES · Karachi
          </p>
        </footer>

      </main>
    </>
  );
}
