"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Project IDs (must match the id field in PROJECTS array) ─── */
const FEATURED_PROJECTS = ["mini-ai-agent", "raabta", "parhofast"];

export default function Autopilot() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const scrollLockRef = useRef(false);
  // refs to hold sub‑step timeout IDs for cleanup
  const projectTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // ─── Timeline engine (adjusted timings for project cycling) ───
  useEffect(() => {
    if (!active) return;

    const t1 = setTimeout(() => setStep(1), 0);        // 0s
    const t2 = setTimeout(() => setStep(2), 3000);     // 3s  → snapshot
    const t3 = setTimeout(() => setStep(3), 7000);     // 7s  → projects (start cycling)
    const t4 = setTimeout(() => setStep(4), 22000);    // 22s → close projects, go to architecture
    const t5 = setTimeout(() => setStep(5), 27000);    // 27s → inspect router node
    const t6 = setTimeout(() => setStep(6), 32000);    // 32s → close node, switch to business view
    const t7 = setTimeout(() => setStep(7), 37000);    // 37s → scroll to experience

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [active]);

  // ─── Robust scroll helper (unchanged) ───
  const scrollToSection = (id: string, callback?: () => void) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (scrollLockRef.current) {
      setTimeout(() => scrollToSection(id, callback), 100);
      return;
    }
    scrollLockRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      scrollLockRef.current = false;
      if (callback) callback();
    }, 650);
  };

  // ─── Cycle through featured projects inside step 3 ───
  useEffect(() => {
    if (!active || step !== 3) return;

    // Clear any leftover project timeouts
    projectTimeoutsRef.current.forEach(clearTimeout);
    projectTimeoutsRef.current = [];

    // First, scroll to the projects section, then start cycling
    scrollToSection("projects", () => {
      let index = 0;

      const openNext = () => {
        if (index >= FEATURED_PROJECTS.length) return; // safety

        const projectId = FEATURED_PROJECTS[index];
        // scroll the individual card into view (if card has its own id)
        const cardEl = document.getElementById(`project-${projectId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // small delay to let the scroll settle, then open the card
        const tOpen = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("autopilot:set-project", { detail: { id: projectId } })
          );
        }, 400);
        projectTimeoutsRef.current.push(tOpen);

        // schedule closing this project after 3.5 seconds
        const tClose = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("autopilot:set-project", { detail: { id: null } })
          );
        }, 3500 + 400); // 3.5s from the open moment
        projectTimeoutsRef.current.push(tClose);

        // move to next project after 4.2 seconds (giving time for close animation)
        index++;
        if (index < FEATURED_PROJECTS.length) {
          const tNext = setTimeout(() => {
            openNext();
          }, 4200); // enough for open + read + close animation
          projectTimeoutsRef.current.push(tNext);
        }
      };

      openNext();
    });

    return () => {
      projectTimeoutsRef.current.forEach(clearTimeout);
    };
  }, [active, step, scrollToSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Main step ↔ action sync (steps 1,2,4,5,6,7) ───
  useEffect(() => {
    if (!active) return;

    switch (step) {
      case 1:
        scrollToSection("home");
        break;
      case 2:
        scrollToSection("snapshot");
        break;
      // step 3 is handled by its own effect above
      case 4:
        // ensure any leftover project card is closed
        window.dispatchEvent(new CustomEvent("autopilot:set-project", { detail: { id: null } }));
        // switch to technical view, then scroll to architecture
        window.dispatchEvent(new CustomEvent("autopilot:set-arch-view", { detail: { view: "technical" } }));
        setTimeout(() => {
          scrollToSection("architecture");
        }, 500);
        break;
      case 5:
        window.dispatchEvent(new CustomEvent("autopilot:set-arch-node", { detail: { id: "router" } }));
        break;
      case 6:
        window.dispatchEvent(new CustomEvent("autopilot:set-arch-node", { detail: { id: null } }));
        window.dispatchEvent(new CustomEvent("autopilot:set-arch-view", { detail: { view: "business" } }));
        break;
      case 7:
        scrollToSection("experience");
        break;
    }
  }, [step, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStop = () => {
    setActive(false);
    setStep(0);
    // clear any project sub‑timeouts
    projectTimeoutsRef.current.forEach(clearTimeout);
    window.dispatchEvent(new CustomEvent("autopilot:set-project", { detail: { id: null } }));
    window.dispatchEvent(new CustomEvent("autopilot:set-arch-node", { detail: { id: null } }));
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setActive(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "10px 28px",
          borderRadius: "4px",
          border: "1px solid #00c8ff",
          color: "#00c8ff",
          fontWeight: 400,
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
          transition: "background-color 150ms ease, color 150ms ease",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
      >
        [ Take 60-Second System Tour ]
      </button>

      {/* Autopilot HUD Overlay (unchanged) */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            style={{
              position: "fixed",
              bottom: "32px",
              left: "50%",
              zIndex: 9999,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid #00c8ff",
              borderRadius: "8px",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              boxShadow: "0 8px 32px rgba(0, 200, 255, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#00c8ff",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px #00c8ff",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#00c8ff",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                }}
              >
                SYSTEM AUTOPILOT ENGAGED... [ Step {Math.min(step, 7)} of 7 ]
              </span>
            </div>
            <button
              onClick={handleStop}
              style={{
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                border: "1px solid rgba(255, 0, 0, 0.4)",
                color: "#ff4444",
                padding: "8px 16px",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              [ Exit Tour / Take Control ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 7 Success Toast (unchanged) */}
      <AnimatePresence>
        {active && step === 7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "fixed",
              bottom: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9998,
              backgroundColor: "#0a0a0a",
              border: "1px solid #22c55e",
              borderRadius: "6px",
              padding: "20px 32px",
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "#22c55e",
                letterSpacing: "0.05em",
                textAlign: "center",
              }}
            >
              TOUR COMPLETE.
              <br />
              Ready to ship production systems? Let's talk.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}