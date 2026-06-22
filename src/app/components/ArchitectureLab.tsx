"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────── */
type ViewMode = "technical" | "business";

interface ArchNode {
  id:      string;
  label:   string;
  x:       number;   // percentage of SVG width
  y:       number;   // percentage of SVG height
  icon:    string;
}

interface NodeDetail {
  id:      string;
  heading: string;
  body:    string;
  code?:   string;
}

/* ─── Graph nodes & edges ────────────────────────────────────── */
const NODES: ArchNode[] = [
  { id: "gateway",    label: "Client Gateway",       x: 8,  y: 42, icon: "⬡" },
  { id: "router",     label: "FastAPI Router",        x: 34, y: 42, icon: "⚡" },
  { id: "cache",      label: "Redis Cache Layer",     x: 60, y: 42, icon: "◈" },
  { id: "db",         label: "PostgreSQL DB Store",   x: 86, y: 42, icon: "⬙" },
];

// Each edge: [from-id, to-id]
const EDGES: [string, string][] = [
  ["gateway", "router"],
  ["router",  "cache"],
  ["cache",   "db"],
];

/* ─── Node detail panels ─────────────────────────────────────── */
const NODE_DETAILS: Record<string, NodeDetail> = {
  gateway: {
    id:      "gateway",
    heading: "Client Gateway",
    body:    "Edge termination layer. Handles mTLS handshakes, token-bucket rate limiting (1000 req/min per tenant), and request schema validation before forwarding. Circuit-breaker trips at 5 consecutive upstream failures.",
    code:    `# nginx upstream config
upstream fastapi_cluster {
  least_conn;
  server 127.0.0.1:8001 weight=3;
  server 127.0.0.1:8002 weight=3;
  keepalive 64;
}

limit_req_zone $binary_remote_addr
  zone=api:10m rate=100r/s;`,
  },
  router: {
    id:      "router",
    heading: "FastAPI Router",
    body:    "Modular async routing layer. Each domain (auth, core, admin) is an isolated APIRouter with its own middleware stack. Rate-limiting, request-id injection, and structured logging are applied as ASGI middleware.",
    code:    `# Modular router with rate-limiting middleware
from fastapi import APIRouter, Request
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
router  = APIRouter(prefix="/api/v1")

@router.get("/infer")
@limiter.limit("60/minute")
async def run_inference(
    request: Request,
    payload: InferRequest,
) -> InferResponse:
    result = await engine.process(payload)
    return InferResponse(data=result)`,
  },
  cache: {
    id:      "cache",
    heading: "Redis Cache Layer",
    body:    "Read-through cache with TTL-based invalidation. Stores serialised query results under deterministic hash keys. Drastically reduces PostgreSQL round-trips on hot-path reads.",
    code:    `// Live telemetry snapshot
{
  "layer":        "Redis 7.2 (Cluster)",
  "avg_latency":  "4ms",
  "p99_latency":  "18ms",
  "hit_rate":     "94.2%",
  "eviction_policy": "allkeys-lru",
  "memory_used":  "1.2 GB / 4 GB",
  "keyspace_hits_per_sec": 8400
}`,
  },
  db: {
    id:      "db",
    heading: "PostgreSQL DB Store",
    body:    "Primary relational store. Connection pool capped at 20 per replica to prevent exhaustion under burst traffic. Async queries via asyncpg. Schema migrations handled through Alembic with zero-downtime strategies.",
    code:    `# asyncpg connection pool config
pool = await asyncpg.create_pool(
    dsn=settings.DATABASE_URL,
    min_size=5,
    max_size=20,           # hard cap per replica
    command_timeout=30,
    server_settings={
        "application_name": "portfolio-api",
        "jit": "off",      # disable JIT for OLTP
    },
)`,
  },
};

/* ─── Business View Cards ────────────────────────────────────── */
const BUSINESS_CARDS = [
  {
    id:     "bottleneck",
    icon:   "⚠",
    label:  "Core Bottleneck",
    color:  "#f59e0b",
    body:   "High-concurrency database connection exhaustion during peak traffic. Every request was opening a raw connection — no pooling — causing cascading timeouts and 503s at scale.",
  },
  {
    id:     "solution",
    icon:   "⚙",
    label:  "System Solution",
    color:  "#00c8ff",
    body:   "Implemented a strict connection pool tracking architecture with Redis read-through caching layers. Pool size capped per replica; hot-path reads served from cache with 94%+ hit rate — eliminating the direct-to-DB pressure.",
  },
  {
    id:     "impact",
    icon:   "↑",
    label:  "Measurable Business Impact",
    color:  "#22c55e",
    body:   "Drastically reduced database lookup frequencies, decreasing customer response times from minutes-long timeout intervals to sub-100ms execution. Improved system reliability from ~72% to 99.4% uptime under load.",
  },
];

/* ─── SVG node width/height constants (% of viewBox) ────────── */
const NODE_W   = 12;   // % of 100 viewBox width
const NODE_H   = 16;   // % of 100 viewBox height
const VIEWBOX  = "0 0 100 100";

/* ─── Component ──────────────────────────────────────────────── */
export default function ArchitectureLab() {
  const [view,       setView]       = useState<ViewMode>("technical");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  useEffect(() => {
    const handleSetView = (e: Event) => {
      const customEvent = e as CustomEvent<{ view: ViewMode }>;
      if (customEvent.detail?.view) {
        setView(customEvent.detail.view);
      }
    };
    const handleSetNode = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string | null }>;
      if (customEvent.detail !== undefined) {
        setActiveNode(customEvent.detail.id);
      }
    };

    window.addEventListener("autopilot:set-arch-view", handleSetView);
    window.addEventListener("autopilot:set-arch-node", handleSetNode);

    return () => {
      window.removeEventListener("autopilot:set-arch-view", handleSetView);
      window.removeEventListener("autopilot:set-arch-node", handleSetNode);
    };
  }, []);

  const detail = activeNode ? NODE_DETAILS[activeNode] : null;

  return (
    <div>
      {/* ── View Switcher ── */}
      <div
        style={{
          display:        "inline-flex",
          border:         "1px solid var(--color-border)",
          borderRadius:   "4px",
          overflow:       "hidden",
          marginBottom:   "48px",
        }}
        role="group"
        aria-label="Architecture view mode"
      >
        {(["technical", "business"] as const).map((mode) => (
          <button
            key={mode}
            id={`arch-view-${mode}`}
            aria-pressed={view === mode}
            onClick={() => {
              setView(mode);
              setActiveNode(null);
            }}
            style={{
              padding:         "9px 22px",
              fontFamily:      "var(--font-mono)",
              fontSize:        "0.72rem",
              letterSpacing:   "0.08em",
              textTransform:   "uppercase",
              border:          "none",
              borderRight:     mode === "technical" ? "1px solid var(--color-border)" : "none",
              cursor:          "pointer",
              backgroundColor: view === mode ? "var(--color-accent)" : "var(--color-surface)",
              color:           view === mode ? "#000" : "var(--color-text-muted)",
              fontWeight:      view === mode ? 600 : 400,
              transition:      "background-color 200ms ease, color 200ms ease",
            }}
          >
            {mode === "technical" ? "Technical View" : "Business View"}
          </button>
        ))}
      </div>

      {/* ── Panel ── */}
      <AnimatePresence mode="wait">
        {view === "technical" ? (
          <motion.div
            key="technical"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <TechnicalView
              activeNode={activeNode}
              setActiveNode={setActiveNode}
              detail={detail}
            />
          </motion.div>
        ) : (
          <motion.div
            key="business"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <BusinessView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Technical View
────────────────────────────────────────────────────────────── */
interface TechnicalViewProps {
  activeNode:    string | null;
  setActiveNode: (id: string | null) => void;
  detail:        NodeDetail | null;
}

function TechnicalView({ activeNode, setActiveNode, detail }: TechnicalViewProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: detail ? "1fr 1fr" : "1fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Left: Node graph */}
      <div
        className={
          !detail
            ? "flex items-center justify-center w-full min-h-[450px] py-12 max-w-2xl mx-auto"  // ✅ capped width when collapsed
            : ""
        }
        style={{
          border:          "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          borderRadius:    "4px",
          overflow:        "hidden",
          position:        "relative",
        }}
      >
        {/* Instruction label */}
        <p
          style={{
            position:      "absolute",
            top:           0,
            left:          0,
            right:         0,
            zIndex:        10,
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.65rem",
            letterSpacing: "0.1em",
            color:         "var(--color-text-muted)",
            padding:       "12px 16px",
            borderBottom:  "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          CLICK ANY NODE TO INSPECT →
        </p>

        {/* SVG graph */}
        <svg
          viewBox={VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "auto", display: "block", padding: "4px 0" }}
          aria-label="System architecture node graph"
          role="img"
        >
          <defs>
            {/* Animated flowing dash on edges */}
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill="var(--color-border)" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill="#00c8ff" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map(([fromId, toId]) => {
            const from = NODES.find((n) => n.id === fromId)!;
            const to   = NODES.find((n) => n.id === toId)!;

            const x1 = from.x + NODE_W;
            const y1 = from.y;
            const x2 = to.x;
            const y2 = to.y;

            const isActive =
              activeNode === fromId || activeNode === toId;

            return (
              <line
                key={`${fromId}-${toId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? "#00c8ff" : "#1f1f1f"}
                strokeWidth={isActive ? 0.6 : 0.4}
                markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                strokeDasharray={isActive ? "2 1" : "none"}
                style={{ transition: "stroke 200ms ease, stroke-width 200ms ease" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isActive = activeNode === node.id;
            const cx = node.x + NODE_W / 2;
            const cy = node.y;

            return (
              <g
                key={node.id}
                onClick={() => setActiveNode(isActive ? null : node.id)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={`Inspect ${node.label}`}
                aria-pressed={isActive}
              >
                {/* Outer glow rect when active */}
                {isActive && (
                  <rect
                    x={node.x - 1}
                    y={cy - NODE_H / 2 - 1}
                    width={NODE_W + 2}
                    height={NODE_H + 2}
                    rx="1.5"
                    fill="rgba(0,200,255,0.06)"
                    stroke="#00c8ff"
                    strokeWidth="0.35"
                  />
                )}

                {/* Card background */}
                <rect
                  x={node.x}
                  y={cy - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx="1"
                  fill={isActive ? "#0a0a0a" : "#111111"}
                  stroke={isActive ? "#00c8ff" : "#1f1f1f"}
                  strokeWidth={isActive ? 0.4 : 0.25}
                  style={{ transition: "stroke 200ms, fill 200ms" }}
                />

                {/* Icon */}
                <text
                  x={cx}
                  y={cy - 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="5"
                  fill={isActive ? "#00c8ff" : "#4a4a4a"}
                  style={{ userSelect: "none", transition: "fill 200ms" }}
                >
                  {node.icon}
                </text>

                {/* Label (split at space) */}
                {node.label.split(" ").map((word, wi, arr) => (
                  <text
                    key={word}
                    x={cx}
                    y={cy + 3.5 + (wi - (arr.length - 1) / 2) * 3.2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="2.1"
                    fill={isActive ? "#f0f0f0" : "#8a8a8a"}
                    fontFamily="monospace"
                    style={{ userSelect: "none", transition: "fill 200ms" }}
                  >
                    {word}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: Detail panel */}
      <AnimatePresence mode="wait">
        {detail && (
          <motion.div
            key={detail.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              border:          "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              borderRadius:    "4px",
              overflow:        "hidden",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding:        "12px 16px",
                borderBottom:   "1px solid var(--color-border)",
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "center",
              }}
            >
              <p
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.1em",
                  color:         "var(--color-accent)",
                }}
              >
                INSPECT: {detail.heading.toUpperCase()}
              </p>
              <button
                aria-label="Close panel"
                onClick={() => {/* parent handles via setActiveNode(null) on same-click */}}
                style={{
                  background:  "none",
                  border:      "none",
                  color:       "var(--color-text-muted)",
                  cursor:      "pointer",
                  fontFamily:  "var(--font-mono)",
                  fontSize:    "0.75rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body text */}
            <div style={{ padding: "16px" }}>
              <p
                style={{
                  fontSize:     "0.8125rem",
                  color:        "var(--color-text-secondary)",
                  lineHeight:   1.7,
                  marginBottom: "16px",
                }}
              >
                {detail.body}
              </p>

              {/* Code / metrics block */}
              {detail.code && (
                <pre
                  style={{
                    fontFamily:      "var(--font-mono)",
                    fontSize:        "0.7rem",
                    lineHeight:      1.65,
                    color:           "#22c55e",
                    backgroundColor: "#000",
                    border:          "1px solid var(--color-border)",
                    borderRadius:    "4px",
                    padding:         "14px",
                    overflowX:       "auto",
                    margin:          0,
                    whiteSpace:      "pre",
                  }}
                >
                  {detail.code}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Business View
────────────────────────────────────────────────────────────── */
function BusinessView() {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap:                 "1px",
        backgroundColor:     "var(--color-border)",
        border:              "1px solid var(--color-border)",
      }}
    >
      {BUSINESS_CARDS.map((card) => (
        <div
          key={card.id}
          id={`arch-biz-${card.id}`}
          style={{
            backgroundColor: "var(--color-surface)",
            padding:         "36px 32px",
            display:         "flex",
            flexDirection:   "column",
            gap:             "14px",
          }}
        >
          <span
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "1.4rem",
              color:         card.color,
            }}
          >
            {card.icon}
          </span>
          <p
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color:         card.color,
            }}
          >
            {card.label}
          </p>
          <p
            style={{
              fontSize:   "0.875rem",
              color:      "var(--color-text-secondary)",
              lineHeight: 1.72,
            }}
          >
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}
