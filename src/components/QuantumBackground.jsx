import { useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";
import { usePrefersReducedMotion, useIsLowPower } from "../hooks/useMediaQuery";

// Pool of Dirac-notation and quantum-math snippets the field draws its
// formulas from. Mixed lengths so the canvas reads as a genuine field
// of notation rather than one repeated symbol.
const FORMULA_POOL = [
  "|φ⟩",
  "ħ",
  "U(θ, φ, λ)",
  "⊗",
  "†",
  "|ψ⟩",
  "α|0⟩ + β|1⟩",
  "H",
  "CNOT",
  "√2",
  "π/4",
  "⟨0|1⟩ = 0",
  "e^{iθ}",
  "∑ᵢ pᵢ",
  "Δt",
  "|0⟩",
  "|1⟩",
  "Rz(θ)",
  "⟨ψ|",
];

/**
 * Global, full-viewport quantum-themed background: a drifting field of
 * Dirac-notation formulas and quantum symbols, rendered character by
 * character on a plain 2D canvas (not three.js, so it stays cheap
 * enough to sit behind the entire page, including the WebGL Bloch
 * sphere in the hero).
 *
 * Cursor physics: every character in a formula is simulated as a tiny
 * spring-mass point anchored to its normal slot in the text. When the
 * pointer comes near, nearby characters get pushed outward — the
 * formula visibly fractures and scatters — and a spring pulls each
 * character back toward its slot the moment the pointer moves away,
 * so the formula gently coalesces back into place.
 *
 * - Sits `fixed inset-0` behind everything (see App.jsx), `pointer-events-none`
 *   so it never intercepts clicks/drags meant for content above it.
 * - Reads the current theme so formula colors/opacity match light vs dark.
 * - Formula counts scale down on low-power devices; the whole effect
 *   freezes on prefers-reduced-motion (still paints one static frame).
 * - Pauses its animation loop while the tab is hidden to save battery.
 */
export default function QuantumBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsLowPower();

  // Keep latest theme/perf flags available inside the RAF loop without
  // having to tear down and rebuild the whole formula field on toggle.
  const themeRef = useRef({ isDark, reducedMotion, lowPower });
  themeRef.current = { isDark, reducedMotion, lowPower };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let formulas = [];
    let rafId = null;
    let running = true;

    const pointer = { x: -9999, y: -9999, active: false };
    const FONT_FAMILY = "'IBM Plex Mono', monospace";

    // Accent palette to sample from: Quantum Sapphire → Cyan → Violet → Magenta
    function colorFor(hue, alpha, dark) {
      if (hue < 0.25) return dark ? `rgba(96,165,250,${alpha})` : `rgba(37,99,235,${alpha})`;
      if (hue < 0.5) return dark ? `rgba(34,211,238,${alpha})` : `rgba(8,145,178,${alpha})`;
      if (hue < 0.75) return dark ? `rgba(167,139,250,${alpha})` : `rgba(124,58,237,${alpha})`;
      return dark ? `rgba(232,121,249,${alpha})` : `rgba(192,38,212,${alpha})`;
    }

    function countFor() {
      const { lowPower } = themeRef.current;
      const area = width * height;
      const base = Math.round(area / (lowPower ? 42000 : 26000));
      return Math.max(8, Math.min(base, lowPower ? 16 : 32));
    }

    // Build one formula: pick text, a font size, a home position/drift
    // velocity, and pre-measure each character's slot offset within
    // the formula so the physics has a fixed rest position to spring
    // back to.
    function makeFormula() {
      const text = FORMULA_POOL[Math.floor(Math.random() * FORMULA_POOL.length)];
      const fontSize = 13 + Math.random() * 11;
      ctx.font = `500 ${fontSize}px ${FONT_FAMILY}`;

      let cursor = 0;
      const chars = Array.from(text).map((ch) => {
        const w = ctx.measureText(ch).width;
        const slot = { ch, ox: cursor, dx: 0, dy: 0, vx: 0, vy: 0 };
        cursor += w;
        return slot;
      });

      return {
        chars,
        width: cursor,
        fontSize,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        hue: Math.random(),
        twinkle: Math.random() * Math.PI * 2,
      };
    }

    function makeFormulas() {
      const n = countFor();
      formulas = Array.from({ length: n }, makeFormula);
    }

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || window.innerWidth;
      height = rect?.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeFormulas();
    }

    // Physics constants for the fracture/coalesce effect — kept subtle
    // on purpose: a small trigger radius, a gentle push, a fast spring
    // back to rest, and a tight cap on how far any glyph can drift, so
    // the field reads as a quiet ambient disturbance near the cursor
    // rather than an attention-grabbing scatter.
    const TRIGGER_RADIUS = 70;
    const REPULSION = 0.32;
    const SPRING_K = 0.032;
    const FRICTION = 0.88;
    const MAX_DISPLACEMENT = 18;

    function step(dt) {
      const { reducedMotion } = themeRef.current;
      const speedMul = reducedMotion ? 0 : 1;

      for (const f of formulas) {
        // Gentle drift of the whole formula
        f.x += f.vx * dt * speedMul;
        f.y += f.vy * dt * speedMul;
        f.twinkle += 0.012 * dt * (reducedMotion ? 0 : 1);

        // Wrap around edges so the field feels infinite
        if (f.x < -f.width - 20) f.x = width + 20;
        if (f.x > width + 20) f.x = -f.width - 20;
        if (f.y < -20) f.y = height + 20;
        if (f.y > height + 20) f.y = -20;

        for (const c of f.chars) {
          let ax = 0;
          let ay = 0;

          if (pointer.active && !reducedMotion) {
            const wx = f.x + c.ox + c.dx;
            const wy = f.y + c.dy;
            const ddx = wx - pointer.x;
            const ddy = wy - pointer.y;
            const dist2 = ddx * ddx + ddy * ddy;
            if (dist2 < TRIGGER_RADIUS * TRIGGER_RADIUS) {
              const dist = Math.sqrt(dist2) || 0.01;
              const forceMag = (1 - dist / TRIGGER_RADIUS) * REPULSION;
              ax += (ddx / dist) * forceMag;
              ay += (ddy / dist) * forceMag;
            }
          }

          // Spring pulling each character back toward its resting slot
          ax += -SPRING_K * c.dx;
          ay += -SPRING_K * c.dy;

          c.vx = (c.vx + ax * dt) * FRICTION;
          c.vy = (c.vy + ay * dt) * FRICTION;
          c.dx += c.vx * dt * speedMul;
          c.dy += c.vy * dt * speedMul;

          // Keep the fracture contained so the field never sends
          // glyphs flying off-screen
          const mag = Math.hypot(c.dx, c.dy);
          if (mag > MAX_DISPLACEMENT) {
            const scale = MAX_DISPLACEMENT / mag;
            c.dx *= scale;
            c.dy *= scale;
          }
        }
      }
    }

    function draw() {
      const { isDark, reducedMotion } = themeRef.current;
      ctx.clearRect(0, 0, width, height);

      for (const f of formulas) {
        const twinkle = reducedMotion ? 0.85 : 0.62 + Math.sin(f.twinkle) * 0.32;
        const baseAlpha = (isDark ? 0.62 : 0.46) * twinkle;
        ctx.font = `500 ${f.fontSize}px ${FONT_FAMILY}`;
        ctx.textBaseline = "middle";

        for (const c of f.chars) {
          // Characters that have fractured away from their slot fade
          // slightly and glow a touch brighter, so the scatter reads
          // as an active disruption rather than just a smear.
          const displaced = Math.min(1, Math.hypot(c.dx, c.dy) / MAX_DISPLACEMENT);
          const alpha = baseAlpha * (1 - displaced * 0.25);
          ctx.fillStyle = colorFor(f.hue, alpha, isDark);
          if (displaced > 0.05) {
            ctx.shadowColor = colorFor(f.hue, 0.9, isDark);
            ctx.shadowBlur = 5 * displaced;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(c.ch, f.x + c.ox + c.dx, f.y + c.dy);
        }
        ctx.shadowBlur = 0;
      }
    }

    let last = performance.now();
    function loop(now) {
      if (!running) return;
      const dt = Math.min(now - last, 48);
      last = now;
      step(dt);
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }
    function handlePointerLeave() {
      pointer.active = false;
    }
    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();
    draw();
    if (!reducedMotion) {
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // Intentionally run once — theme/perf flags are read live via themeRef
    // so the sim doesn't restart (and lose formula positions) on toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
