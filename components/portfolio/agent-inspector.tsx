"use client"

import { useState, useEffect, useRef } from "react"

// ── Types ────────────────────────────────────────────────────────────────────

type Preset = {
  id: string
  label: string
  prompt: string
  toolName: string
  finalAnswer: string
  finalDetail: string
  iterationsUsed: number
  latencyMs: number
  steps: Step[]
}

type Step = {
  iterationGroup?: string
  kind: "thought" | "action" | "ast" | "security" | "observation" | "memory" | "answer"
  label: string
  detail: string
  status?: "pass" | "info"
}

// ── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    id: "calculator",
    label: "Calculator task",
    prompt: "(450 × 12) + (1800 / 4) with 15% tax",
    toolName: "AST Safe Calculator",
    finalAnswer: "$5,917.50",
    finalDetail: "Calculated: (450 × 12) + (1800 / 4) with 15% tax applied.",
    iterationsUsed: 2,
    latencyMs: 312,
    steps: [
      {
        iterationGroup: "ITERATION 1 / 2 · REASON & INVOKE TOOL",
        kind: "thought",
        label: "THOUGHT",
        detail: "User requested math calculation. Calling calculator tool with arithmetic expression.",
      },
      {
        kind: "action",
        label: "ACTION",
        detail: 'calculator("(450 * 12) + (1800 / 4) * 1.15")',
      },
      {
        kind: "ast",
        label: "AST PARSER",
        detail: "ast.parse(mode='eval') — syntax tree walked. Only mathematical nodes detected.",
        status: "pass",
      },
      {
        kind: "security",
        label: "SECURITY GATE",
        detail: "No imports, no syscalls, no eval(). Safe arithmetic whitelisted.",
        status: "pass",
      },
      {
        kind: "observation",
        label: "OBSERVATION",
        detail: "5917.5",
      },
      {
        iterationGroup: "ITERATION 2 / 2 · SYNTHESIZE & CONCLUDE",
        kind: "thought",
        label: "THOUGHT",
        detail: "Calculation returned 5917.5. Formulating formatted response. is_final_answer: true",
      },
      {
        kind: "memory",
        label: "MEMORY WRITE",
        detail: "Supabase atomic batch write — exchange saved to conversation history.",
      },
      {
        kind: "answer",
        label: "FINAL ANSWER",
        detail: "$5,917.50 (with 15% tax applied)",
      },
    ],
  },
  {
    id: "search",
    label: "Web search task",
    prompt: "What is the current Python version?",
    toolName: "Tavily Search API",
    finalAnswer: "Python 3.13",
    finalDetail: "Confirmed current stable release via live Tavily web grounding.",
    iterationsUsed: 2,
    latencyMs: 891,
    steps: [
      {
        iterationGroup: "ITERATION 1 / 2 · REASON & QUERY WEB",
        kind: "thought",
        label: "THOUGHT",
        detail: "Query asks for current Python version beyond training cutoff. Calling Tavily Search.",
      },
      {
        kind: "action",
        label: "ACTION",
        detail: 'search("latest stable Python version 2025")',
      },
      {
        kind: "security",
        label: "TOKEN GUARD",
        detail: "Live web snippet trimmed to 300 chars to protect LLM context window.",
        status: "info",
      },
      {
        kind: "observation",
        label: "OBSERVATION",
        detail: '"Python 3.13 was released in October 2024 as current stable release." [trimmed]',
      },
      {
        iterationGroup: "ITERATION 2 / 2 · SYNTHESIZE & CONCLUDE",
        kind: "thought",
        label: "THOUGHT",
        detail: "Search grounded the facts accurately. is_final_answer: true",
      },
      {
        kind: "memory",
        label: "MEMORY WRITE",
        detail: "Supabase atomic batch write — conversation exchange persisted.",
      },
      {
        kind: "answer",
        label: "FINAL ANSWER",
        detail: "Python 3.13 is the latest stable release (Oct 2024).",
      },
    ],
  },
]

// ── Icons & Colors ───────────────────────────────────────────────────────────

function stepIcon(kind: Step["kind"]) {
  switch (kind) {
    case "thought":
      return "💭"
    case "action":
      return "⚡"
    case "ast":
      return "🌳"
    case "security":
      return "🛡️"
    case "observation":
      return "👁️"
    case "memory":
      return "💾"
    case "answer":
      return "✓"
  }
}

function stepColor(kind: Step["kind"]) {
  if (kind === "answer") return "agent-step--answer"
  if (kind === "security" || kind === "ast") return "agent-step--guard"
  if (kind === "thought") return "agent-step--thought"
  if (kind === "observation") return "agent-step--observe"
  if (kind === "memory") return "agent-step--memory"
  return ""
}

// ── Main Component ───────────────────────────────────────────────────────────

export function AgentInspector() {
  const [presetId, setPresetId] = useState<string>("calculator")
  const [running, setRunning] = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const preset = PRESETS.find((p) => p.id === presetId)!
  const hasStarted = visibleCount > 0 || running || done

  function startSimulation() {
    if (running) return
    setDone(false)
    setVisibleCount(0)
    setRunning(true)
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setDone(false)
    setVisibleCount(0)
  }

  // When presetId changes, reset
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId])

  // Animate steps
  useEffect(() => {
    if (!running) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    let idx = 0
    intervalRef.current = setInterval(() => {
      idx++
      setVisibleCount(idx)
      if (idx >= preset.steps.length) {
        clearInterval(intervalRef.current!)
        setRunning(false)
        setDone(true)
      }
    }, 450)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, preset.steps.length])

  return (
    <div className="agent-inspector font-mono">
      {/* ── Header ── */}
      <div className="agent-inspector-header">
        <div>
          <span className="agent-kicker">SIMULATED EXECUTION TRACE</span>
          <p className="agent-desc">
            Stepped walkthrough of the 2-turn ReAct loop — not a live API call.
          </p>
        </div>
        <span className="agent-sim-badge">Simulation</span>
      </div>

      {/* ── Panel 1: Input selector ── */}
      <section className="agent-panel">
        <span className="agent-panel-label">01 / INPUT TASK</span>
        <div className="agent-preset-row">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`agent-preset-btn${presetId === p.id ? " active" : ""}`}
              onClick={() => setPresetId(p.id)}
            >
              {p.id === "calculator" ? "⚡" : "🔍"} {p.label}
            </button>
          ))}
        </div>
        <div className="agent-prompt-box">
          <span className="agent-prompt-arrow">›</span>
          <span className="agent-prompt-text">{preset.prompt}</span>
        </div>
      </section>

      {/* ── Panel 2: Execution trace ── */}
      <section className="agent-panel">
        <div className="agent-panel-row">
          <span className="agent-panel-label">02 / EXECUTION TRACE</span>
          <div className="agent-trace-controls">
            <span className="agent-iter-badge">
              MAX ITER: 5 · GUARD: active
            </span>
            {!running && !done && (
              <button type="button" className="agent-run-btn" onClick={startSimulation}>
                ▶ Run trace
              </button>
            )}
            {(running || done) && (
              <button type="button" className="agent-reset-btn" onClick={reset}>
                ↺ Reset
              </button>
            )}
          </div>
        </div>

        <div className="agent-trace-body" aria-live="polite">
          {!hasStarted && (
            <div className="agent-idle-welcome">
              <span className="agent-idle-icon">▶</span>
              <div>
                <strong>Ready to trace: {preset.label}</strong>
                <p>Click &quot;▶ Run trace&quot; to step through the model reasoning, tool call, security verification, and memory write.</p>
              </div>
            </div>
          )}

          {preset.steps.slice(0, visibleCount).map((step, i) => (
            <div key={i} className="agent-step-wrapper">
              {step.iterationGroup && (
                <div className="agent-loop-divider">
                  <span className="agent-loop-dot" />
                  <span className="agent-loop-title">{step.iterationGroup}</span>
                </div>
              )}
              <div
                className={`agent-step ${stepColor(step.kind)}`}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <span className="agent-step-icon" aria-hidden="true">
                  {stepIcon(step.kind)}
                </span>
                <div className="agent-step-content">
                  <span className="agent-step-label">{step.label}</span>
                  <span className="agent-step-detail">{step.detail}</span>
                </div>
                {step.status === "pass" && (
                  <span className="agent-badge-pass">✓ PASS</span>
                )}
                {step.status === "info" && (
                  <span className="agent-badge-info">INFO</span>
                )}
              </div>
            </div>
          ))}

          {running && (
            <div className="agent-running-indicator">
              <span className="agent-running-dot" aria-hidden="true" />
              Agent loop executing…
            </div>
          )}
        </div>
      </section>

      {/* ── Panel 3: Architecture & Security (Visible only after running/started) ── */}
      {hasStarted && (
        <section className="agent-panel agent-security-panel">
          {preset.id === "calculator" ? (
            <>
              <span className="agent-panel-label">03 / SECURITY — AST CODE-INJECTION DEFENSE</span>
              <div className="agent-security-grid">
                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Why not eval()?</span>
                  <span className="agent-security-value">Anti-RCE Protection</span>
                  <span className="agent-security-sub">
                    Raw <code>eval()</code> allows attackers to inject shell commands like <code>os.system(&apos;rm -rf /&apos;)</code>. Python&apos;s AST compiler guarantees zero arbitrary execution.
                  </span>
                </div>

                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Allowed syntax</span>
                  <span className="agent-security-value">Arithmetic Only</span>
                  <div className="agent-node-list">
                    <span className="agent-node-badge">+ Addition</span>
                    <span className="agent-node-badge">- Subtraction</span>
                    <span className="agent-node-badge">* Multiplication</span>
                    <span className="agent-node-badge">/ Division</span>
                  </div>
                </div>

                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Loop safety cap</span>
                  <span className="agent-security-value">MAX_ITERATIONS = 5</span>
                  <span className="agent-security-sub">
                    Hard loop ceiling prevents infinite ReAct cycles and API cost blowouts.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="agent-panel-label">03 / LIVE GROUNDING &amp; TOKEN DEFENSE</span>
              <div className="agent-security-grid">
                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Search tool</span>
                  <span className="agent-security-value">Tavily Search API</span>
                  <span className="agent-security-sub">
                    Fetches real-time web data beyond the model&apos;s training cutoff date.
                  </span>
                </div>

                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Context window guard</span>
                  <span className="agent-security-value">Snippets &le; 300 Chars</span>
                  <span className="agent-security-sub">
                    Full web pages contain thousands of tokens. Trimming search snippets prevents bloating the context window and wasting API tokens.
                  </span>
                </div>

                <div className="agent-security-cell">
                  <span className="agent-security-cell-label">Resilience</span>
                  <span className="agent-security-value">try / except Fallback</span>
                  <span className="agent-security-sub">
                    If external search times out or fails, an error message is returned cleanly instead of crashing the server loop.
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Panel 4: Result (Visible only when done) ── */}
      {done && (
        <section className="agent-panel agent-result-panel">
          <span className="agent-panel-label">04 / FINAL RESULT &amp; METRICS</span>
          <div className="agent-result-grid">
            <div className="agent-result-answer">
              <span className="agent-result-answer-label">Agent Output</span>
              <span className="agent-result-answer-value">{preset.finalAnswer}</span>
              <span className="agent-result-answer-sub">{preset.finalDetail}</span>
            </div>

            <div className="agent-result-metrics">
              <div className="agent-metric">
                <span className="agent-metric-label">Tool executed</span>
                <span className="agent-metric-value agent-metric-value--ok">{preset.toolName}</span>
              </div>
              <div className="agent-metric">
                <span className="agent-metric-label">ReAct loops</span>
                <span className="agent-metric-value">{preset.iterationsUsed} of 5 used</span>
              </div>
              <div className="agent-metric">
                <span className="agent-metric-label">Memory sync</span>
                <span className="agent-metric-value">Supabase (Postgres)</span>
              </div>
              <div className="agent-metric">
                <span className="agent-metric-label">Measured latency</span>
                <span className="agent-metric-value">{preset.latencyMs} ms</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
