"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Activity, Code2, Briefcase, Calendar } from "lucide-react"
import { deployments, type Deployment } from "../../lib/portfolio-data"

function DeploymentCard({ deployment }: { deployment: Deployment }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="deployment-new-card">
      {/* Top Header */}
      <div className="dnc-header">
        <div className="dnc-title-group">
          <div className="dnc-status">
            <span className="status-dot healthy" aria-hidden="true" />
            <span className="font-mono">{deployment.status.toUpperCase()}</span>
          </div>
          <h3 className="dnc-company">{deployment.company}</h3>
        </div>
        <div className="dnc-meta font-mono">
          <span className="dnc-meta-item">
            <Briefcase size={14} aria-hidden="true" /> {deployment.role}
          </span>
          <span className="dnc-meta-item">
            <Calendar size={14} aria-hidden="true" /> {deployment.duration}
          </span>
        </div>
      </div>

      {/* Middle: Tech Stack */}
      <div className="dnc-stack">
        {deployment.stack.map((tech) => (
          <span key={tech} className="dnc-chip font-mono">
            {tech}
          </span>
        ))}
      </div>

      {/* Accordion Toggle */}
      <button
        className="dnc-expand-btn font-mono"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
        {expanded ? "COLLAPSE DETAILS" : "INSPECT ARCHITECTURE & CONTRIBUTIONS"}
      </button>

      {/* Expandable Content / Summary */}
      {expanded ? (
        <div className="dnc-details">
          <div className="dnc-section">
            <h4 className="font-mono">
              <Code2 size={14} aria-hidden="true" /> KEY FEATURES BUILT
            </h4>
            <ul className="dnc-list">
              {deployment.features.map((f) => (
                <li key={f.name}>
                  <strong className="dnc-list-title">{f.name}:</strong> {f.description}
                </li>
              ))}
            </ul>
          </div>
          <div className="dnc-section">
            <h4 className="font-mono">
              <Activity size={14} aria-hidden="true" /> KEY CONTRIBUTIONS
            </h4>
            <ul className="dnc-list">
              {deployment.contributions.map((c) => (
                <li key={c.name}>
                  <strong className="dnc-list-title">{c.name}:</strong> {c.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="dnc-summary font-mono">
          <div className="dnc-summary-col">
            <span className="dnc-summary-label">FEATURES</span>
            <span className="dnc-summary-text">
              {deployment.features.map((f) => f.name).join(", ")}
            </span>
          </div>
          <div className="dnc-summary-col">
            <span className="dnc-summary-label">CONTRIBUTIONS</span>
            <span className="dnc-summary-text">
              {deployment.contributions.map((c) => c.name).join(", ")}
            </span>
          </div>
        </div>
      )}
    </article>
  )
}

export function DeploymentsSection() {
  return (
    <section className="section deployment-section" id="deployments">
      <div className="section-heading compact">
        <div>
          <span className="section-index font-mono">02 / ENGINEERING EXPERIENCE</span>
          <h2>Engineering tenure, transparently logged.</h2>
        </div>
        <p>
          Representative engineering experience and systems impact.
        </p>
      </div>

      <div className="deployments-container">
        {deployments.map((dep) => (
          <DeploymentCard key={dep.id} deployment={dep} />
        ))}

        {/* Future-proofing placeholder */}
        <div className="deployment-placeholder font-mono">
          <span aria-hidden="true">+</span> PENDING UPSTREAM INPUT
        </div>
      </div>
    </section>
  )
}
