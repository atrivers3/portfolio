"use client"

import { CircleCheck, Clock, Trophy, Users } from "lucide-react"
import {
  awards,
  education,
  harvardAspire,
  leadershipTimeline,
} from "@/lib/portfolio-data"

// ─── Education Card ──────────────────────────────────────────────────────────

function EducationCard() {
  return (
    <article className="foundation-card">
      <div className="foundation-card-header">
        <span className="foundation-kicker font-mono">01 / EDUCATION</span>
      </div>
      <div className="foundation-card-body">
        <p className="foundation-institution">{education.institution}</p>
        <h3 className="foundation-degree">{education.degree}</h3>
        <div className="foundation-meta font-mono">
          <span>{education.duration}</span>
          <span className="foundation-dot" aria-hidden="true" />
          <span>{education.location}</span>
        </div>
      </div>
      <div className="foundation-card-tags">
        {["Systems", "Algorithms", "Databases", "Distributed Computing"].map(
          (tag) => (
            <span key={tag} className="foundation-tag font-mono">
              {tag}
            </span>
          )
        )}
      </div>
    </article>
  )
}

// ─── Harvard Aspire Card ─────────────────────────────────────────────────────

function HarvardAspireCard() {
  return (
    <article className="foundation-card foundation-card--harvard">
      {/* Gold accent bar */}
      <div className="harvard-accent-bar" aria-hidden="true" />

      <div className="foundation-card-header">
        <span className="foundation-kicker font-mono">02 / LEADERSHIP FELLOWSHIP</span>
        <span className="harvard-org-badge font-mono">
          {harvardAspire.organiser}
        </span>
      </div>

      <div className="foundation-card-body">
        <h3 className="foundation-degree">{harvardAspire.program}</h3>

        {/* Completed cohorts */}
        <ul className="harvard-cohorts" aria-label="Completed cohorts">
          {harvardAspire.completedCohorts.map((cohort) => (
            <li key={cohort} className="harvard-cohort-item font-mono">
              <CircleCheck aria-hidden="true" />
              <span>{cohort} — Completed</span>
              <span className="harvard-cert-badge">Certificate Awarded</span>
            </li>
          ))}
        </ul>

        {/* Cohort III — mature, factual framing */}
        <div className="harvard-cohort-deferred font-mono">
          <Clock aria-hidden="true" />
          <div>
            <p className="harvard-deferred-label">Cohort III</p>
            <p className="harvard-deferred-note">
              Deferred — Final Exam Prioritization
            </p>
            <p className="harvard-deferred-sub">
              University examinations took precedence during the final cohort
              window. Participation was consciously paused to protect academic
              standing.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

// ─── Leadership Timeline ──────────────────────────────────────────────────────

function LeadershipTimeline() {
  return (
    <article className="foundation-card foundation-timeline-card">
      <div className="foundation-card-header">
        <span className="foundation-kicker font-mono">
          03 / SOCIAL WORK &amp; LEADERSHIP
        </span>
        <Users size={14} aria-hidden="true" className="foundation-kicker-icon" />
      </div>

      <ol className="timeline-list" aria-label="Leadership timeline">
        {leadershipTimeline.map((entry, index) => (
          <li key={index} className="timeline-entry">
            <span className="timeline-year font-mono">{entry.year}</span>
            <div className="timeline-content">
              <p className="timeline-role">{entry.role}</p>
              <p className="timeline-society font-mono">{entry.society}</p>
            </div>
            {/* Connector line — hidden for last item */}
            {index < leadershipTimeline.length - 1 && (
              <div className="timeline-connector" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      {/* Awards badges area */}
      {awards.length > 0 ? (
        <div className="awards-area">
          <p className="awards-label font-mono">
            <Trophy size={12} aria-hidden="true" />
            RECOGNITION
          </p>
          <div className="awards-badges">
            {awards
              .filter((a) => a.confirmed)
              .map((award, i) => (
                <span key={i} className="award-badge font-mono">
                  <CircleCheck size={10} aria-hidden="true" />
                  {award.title}
                  <span className="award-issuer">— {award.issuer}</span>
                </span>
              ))}
          </div>
        </div>
      ) : (
        /* Placeholder shown when no awards are added yet — invisible in prod */
        <div className="awards-area awards-area--empty font-mono">
          {/* Add awards to lib/portfolio-data.ts → awards[] to populate this area */}
        </div>
      )}
    </article>
  )
}

// ─── FoundationSection ───────────────────────────────────────────────────────

export function FoundationSection() {
  return (
    <section className="section foundation-section" id="foundation">
      <div className="section-heading">
        <div>
          <span className="section-index font-mono">03 / ENGINEERING FOUNDATION</span>
          <h2>
            Built in code,
            <br />
            shaped beyond it.
          </h2>
        </div>
        <p>
          Technical depth is useful only when it produces clear decisions,
          resilient teams, and infrastructure people can trust.
        </p>
      </div>

      {/* Two-column grid: left = education cards, right = timeline */}
      <div className="foundation-new-grid">
        {/* Left column */}
        <div className="foundation-left-col">
          <EducationCard />
          <HarvardAspireCard />
        </div>

        {/* Right column */}
        <div className="foundation-right-col">
          <LeadershipTimeline />
        </div>
      </div>
    </section>
  )
}
