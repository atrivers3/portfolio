"use client"

import { useState, useEffect, useRef } from "react"

// ── Scenario types ────────────────────────────────────────────────────────────

type ScenarioId = "commit" | "rollback"

type TxStep = {
  label: string
  sub: string
  aliceBalance: number
  bobBalance: number
  alicePending?: boolean
  bobPending?: boolean
  state: "idle" | "active" | "success" | "error" | "rollback"
  codeSnippet: string
}

// Alice starts with $500, Bob with $100, transfer $150
const INITIAL_ALICE = 500
const INITIAL_BOB = 100
const TRANSFER = 150

const COMMIT_STEPS: TxStep[] = [
  {
    label: "BEGIN TRANSACTION",
    sub: "Database transaction opened. Isolation level: ReadCommitted.",
    aliceBalance: INITIAL_ALICE,
    bobBalance: INITIAL_BOB,
    state: "active",
    codeSnippet: "await using var tx = await _context.Database.BeginTransactionAsync();",
  },
  {
    label: "DEBIT SOURCE",
    sub: `Alice's balance decremented by $${TRANSFER}. Change is uncommitted (in-memory only).`,
    aliceBalance: INITIAL_ALICE - TRANSFER,
    alicePending: true,
    bobBalance: INITIAL_BOB,
    state: "active",
    codeSnippet: `sourceWallet.Balance -= ${TRANSFER};\nawait _context.SaveChangesAsync();`,
  },
  {
    label: "BANK AUTHORIZATION",
    sub: "Routing service delegates to BankService. Simulated 300ms network call → HTTP 200 AUTHORIZED.",
    aliceBalance: INITIAL_ALICE - TRANSFER,
    alicePending: true,
    bobBalance: INITIAL_BOB,
    state: "active",
    codeSnippet: 'var approved = await _routingService.RouteAndAuthorizeAsync(tx);\n// result: AUTHORIZED',
  },
  {
    label: "CREDIT DESTINATION",
    sub: `Bob's balance incremented by $${TRANSFER}. Both changes still within transaction scope.`,
    aliceBalance: INITIAL_ALICE - TRANSFER,
    alicePending: true,
    bobBalance: INITIAL_BOB + TRANSFER,
    bobPending: true,
    state: "active",
    codeSnippet: `destWallet.Balance += ${TRANSFER};\nawait _context.SaveChangesAsync();`,
  },
  {
    label: "COMMIT",
    sub: "All changes written atomically to SQLite. Transaction closed. Balances are now durable.",
    aliceBalance: INITIAL_ALICE - TRANSFER,
    bobBalance: INITIAL_BOB + TRANSFER,
    state: "success",
    codeSnippet: "await dbTransaction.CommitAsync();\n// HTTP 200 — transfer complete",
  },
]

const ROLLBACK_STEPS: TxStep[] = [
  {
    label: "BEGIN TRANSACTION",
    sub: "Database transaction opened. Both wallets locked for this operation.",
    aliceBalance: INITIAL_ALICE,
    bobBalance: INITIAL_BOB,
    state: "active",
    codeSnippet: "await using var tx = await _context.Database.BeginTransactionAsync();",
  },
  {
    label: "DEBIT SOURCE",
    sub: `Alice's balance decremented by $${TRANSFER}. Uncommitted — held in transaction scope.`,
    aliceBalance: INITIAL_ALICE - TRANSFER,
    alicePending: true,
    bobBalance: INITIAL_BOB,
    state: "active",
    codeSnippet: `sourceWallet.Balance -= ${TRANSFER};\nawait _context.SaveChangesAsync();`,
  },
  {
    label: "BANK TIMEOUT / FAILURE",
    sub: "BankService returns HTTP 504 Gateway Timeout after 300ms. catch(Exception) triggered.",
    aliceBalance: INITIAL_ALICE - TRANSFER,
    alicePending: true,
    bobBalance: INITIAL_BOB,
    state: "error",
    codeSnippet: "// catch (Exception ex)\n// { await dbTransaction.RollbackAsync(); }",
  },
  {
    label: "ROLLBACK",
    sub: "RollbackAsync() reverts every change since BeginTransactionAsync(). No money was moved.",
    aliceBalance: INITIAL_ALICE,
    bobBalance: INITIAL_BOB,
    state: "rollback",
    codeSnippet: "await dbTransaction.RollbackAsync();\nreturn StatusCode(500, \"Bank authorization failed.\");",
  },
  {
    label: "STATE PRESERVED",
    sub: "Alice: $500 · Bob: $100. Zero financial drift. ACID Atomicity enforced.",
    aliceBalance: INITIAL_ALICE,
    bobBalance: INITIAL_BOB,
    state: "rollback",
    codeSnippet: "// Atomicity: all operations succeed or none do.\n// No phantom debit. No lost funds.",
  },
]

// ── Currency formatter ────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

// ── Wallet card ───────────────────────────────────────────────────────────────

function WalletCard({
  name,
  role,
  balance,
  pending,
  stepState,
}: {
  name: string
  role: string
  balance: number
  pending?: boolean
  stepState: TxStep["state"]
}) {
  const isError = stepState === "error" && pending
  const isRollback = stepState === "rollback"
  const isSuccess = stepState === "success"

  return (
    <div
      className={[
        "tx-wallet-card",
        pending && stepState !== "rollback" ? "tx-wallet--pending" : "",
        isError ? "tx-wallet--error" : "",
        isSuccess && !pending ? "tx-wallet--success" : "",
        isRollback ? "tx-wallet--restored" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="tx-wallet-name">
        {name} · <span className="tx-wallet-role">{role}</span>
      </span>
      <span className="tx-wallet-balance">{fmt(balance)}</span>
      {pending && stepState === "active" && (
        <span className="tx-wallet-tag tx-wallet-tag--uncommitted">uncommitted</span>
      )}
      {isSuccess && (
        <span className="tx-wallet-tag tx-wallet-tag--committed">committed</span>
      )}
      {isRollback && (
        <span className="tx-wallet-tag tx-wallet-tag--restored">restored</span>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TransactionInspector() {
  const [scenario, setScenario] = useState<ScenarioId>("commit")
  const [stepIndex, setStepIndex] = useState(-1) // -1 = idle
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = scenario === "commit" ? COMMIT_STEPS : ROLLBACK_STEPS
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null
  const isFinished = stepIndex >= steps.length - 1 && !running

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }

  function changeScenario(id: ScenarioId) {
    stop()
    setScenario(id)
    setStepIndex(-1)
  }

  function start() {
    stop()
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0)
    } else if (stepIndex === -1) {
      setStepIndex(0)
    }
    setRunning(true)
  }

  function stepBack() {
    stop()
    setStepIndex((idx) => Math.max(0, idx - 1))
  }

  function stepForward() {
    stop()
    setStepIndex((idx) => Math.min(steps.length - 1, idx + 1))
  }

  function jumpToStep(idx: number) {
    stop()
    setStepIndex(idx)
  }

  function reset() {
    stop()
    setStepIndex(-1)
  }

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setRunning(false)
          return prev
        }
        return prev + 1
      })
    }, 1100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, steps.length])

  // Derived wallet values from current step
  const alice = currentStep?.aliceBalance ?? INITIAL_ALICE
  const bob = currentStep?.bobBalance ?? INITIAL_BOB
  const alicePending = currentStep?.alicePending ?? false
  const bobPending = currentStep?.bobPending ?? false
  const stepState: TxStep["state"] = currentStep?.state ?? "idle"
  const stepNum = stepIndex + 1
  const totalSteps = steps.length

  return (
    <div className="tx-inspector font-mono">
      {/* ── Header ── */}
      <div className="tx-inspector-header">
        <div>
          <span className="tx-kicker">TRANSACTION REPLAY</span>
          <p className="tx-header-sub">
            Atomicity is the central guarantee. Watch it fail and recover.
          </p>
        </div>
        <span className="tx-demo-badge">Interactive demo</span>
      </div>

      {/* ── Wallet balances ── */}
      <div className="tx-wallets">
        <WalletCard
          name="Alice"
          role="Source"
          balance={alice}
          pending={alicePending}
          stepState={stepState}
        />
        <div className="tx-transfer-arrow" aria-hidden="true">
          <div className="tx-arrow-amount">{fmt(TRANSFER)}</div>
          <div className="tx-arrow-line">
            <svg viewBox="0 0 80 24" fill="none">
              <path d="M0 12 H68 M56 4 L68 12 L56 20" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <WalletCard
          name="Bob"
          role="Destination"
          balance={bob}
          pending={bobPending}
          stepState={stepState}
        />
      </div>

      {/* ── Scenario selector ── */}
      <div className="tx-scenario-section">
        <p className="tx-scenario-hint">Choose a scenario to preview the state transitions.</p>
        <div className="tx-scenario-row">
          <button
            type="button"
            className={`tx-scenario-btn${scenario === "commit" ? " active" : ""}`}
            onClick={() => changeScenario("commit")}
          >
            Success / Commit
          </button>
          <button
            type="button"
            className={`tx-scenario-btn${scenario === "rollback" ? " active" : ""}`}
            onClick={() => changeScenario("rollback")}
          >
            Failure / Rollback
          </button>
        </div>
      </div>

      {/* ── Step display (Fixed-height container so UI never jumps) ── */}
      <div className="tx-step-display">
        <div className="tx-step-header">
          {stepIndex >= 0 ? (
            <span className="tx-step-counter font-mono">STEP {stepNum} OF {totalSteps}</span>
          ) : (
            <span className="tx-step-counter font-mono">READY TO PLAY</span>
          )}
          {stepState === "error" && (
            <span className="tx-state-badge tx-state-badge--error">⚠ EXCEPTION</span>
          )}
          {stepState === "rollback" && (
            <span className="tx-state-badge tx-state-badge--rollback">↺ ROLLBACK</span>
          )}
          {stepState === "success" && (
            <span className="tx-state-badge tx-state-badge--success">✓ COMMITTED</span>
          )}
          {stepState === "active" && (
            <span className="tx-state-badge tx-state-badge--active">● IN TRANSACTION</span>
          )}
        </div>

        <div className="tx-step-body">
          {currentStep ? (
            <>
              <div
                className={[
                  "tx-step-title",
                  stepState === "error" ? "tx-step-title--error" : "",
                  stepState === "rollback" ? "tx-step-title--rollback" : "",
                  stepState === "success" ? "tx-step-title--success" : "",
                ].filter(Boolean).join(" ")}
              >
                {currentStep.label}
              </div>
              <p className="tx-step-sub">{currentStep.sub}</p>
              <pre className="tx-code-snippet">{currentStep.codeSnippet}</pre>
            </>
          ) : (
            <div className="tx-idle-placeholder">
              <span className="tx-idle-icon">▶</span>
              <div>
                <strong>Scenario ready: {scenario === "commit" ? "Atomic Commit" : "Injected Failure & Rollback"}</strong>
                <p>Click Play to step through the lifecycle or use Step buttons to inspect line-by-line.</p>
              </div>
            </div>
          )}
        </div>

        {/* Step progress bar */}
        <div className="tx-step-progress" role="progressbar" aria-valuenow={stepNum} aria-valuemax={totalSteps}>
          <div
            className={[
              "tx-step-progress-fill",
              stepState === "error" || stepState === "rollback" ? "tx-step-progress-fill--error" : "",
              stepState === "success" ? "tx-step-progress-fill--success" : "",
            ].filter(Boolean).join(" ")}
            style={{ width: `${stepIndex >= 0 ? (stepNum / totalSteps) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* ── Step breadcrumb trail (Clickable & Responsive) ── */}
      <div className="tx-trail" aria-label="Transaction steps">
        {steps.map((s, i) => {
          const shortNamesCommit = ["1. Begin", "2. Debit", "3. Auth", "4. Credit", "5. Commit"]
          const shortNamesRollback = ["1. Begin", "2. Debit", "3. Timeout", "4. Rollback", "5. Restored"]
          const shortLabel = scenario === "commit" ? shortNamesCommit[i] : shortNamesRollback[i]

          return (
            <button
              key={i}
              type="button"
              className={[
                "tx-trail-item",
                i <= stepIndex ? "tx-trail-item--done" : "",
                i === stepIndex ? "tx-trail-item--current" : "",
                i === stepIndex && (stepState === "error" || stepState === "rollback") ? "tx-trail-item--error" : "",
                i === stepIndex && stepState === "success" ? "tx-trail-item--success" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => jumpToStep(i)}
              title={`Jump to step ${i + 1}: ${s.label}`}
            >
              <span className="tx-trail-dot">{i + 1}</span>
              <span className="tx-trail-label">{shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* ── Atomicity callout (shows when on final rollback step) ── */}
      {scenario === "rollback" && stepIndex >= 3 && (
        <div className="tx-acid-callout">
          <span className="tx-acid-icon" aria-hidden="true">🔒</span>
          <div>
            <strong>ACID Atomicity in action:</strong>
            <span> When bank auth timed out, <code>RollbackAsync()</code> reverted Alice&apos;s $150 debit instantly. Both wallets remain at their exact starting balances. Zero financial drift.</span>
          </div>
        </div>
      )}

      {/* ── Stable Controls Bar (Fixed layout so buttons never shift) ── */}
      <div className="tx-controls">
        {running ? (
          <button type="button" className="tx-ctrl-btn tx-ctrl-btn--primary" onClick={stop}>
            ⏸ Pause
          </button>
        ) : (
          <button type="button" className="tx-ctrl-btn tx-ctrl-btn--primary" onClick={start}>
            {stepIndex >= steps.length - 1 ? "↺ Replay" : stepIndex >= 0 ? "▶ Resume" : "▶ Play"}
          </button>
        )}

        <button
          type="button"
          className="tx-ctrl-btn"
          onClick={stepBack}
          disabled={stepIndex <= 0}
          title="Previous step"
        >
          ← Prev
        </button>

        <button
          type="button"
          className="tx-ctrl-btn"
          onClick={stepForward}
          disabled={stepIndex >= steps.length - 1}
          title="Next step"
        >
          Next →
        </button>

        <button
          type="button"
          className="tx-ctrl-btn tx-ctrl-btn--ghost"
          onClick={reset}
          disabled={stepIndex === -1 && !running}
          title="Reset to beginning"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  )
}
