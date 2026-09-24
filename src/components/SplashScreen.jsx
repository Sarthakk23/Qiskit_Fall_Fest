import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EVENT_INFO } from "../data/siteData";

const PARTNERS = [
  { label: "Quantica", src: "/logos/quantica.png" },
  { label: "CQT", src: "/logos/cqt.png" },
  { label: "IBM Quantum", wordmark: "IBM" },
];

// Fixed constellation of soft ambient particles — positions are
// hand-placed (not randomized) so the field is calm and identical on
// every load rather than jittery/random-feeling.
const PARTICLES = [
  { x: "12%", y: "22%", size: 3, color: "#22d3ee", delay: 0 },
  { x: "82%", y: "18%", size: 2, color: "#a78bfa", delay: 0.6 },
  { x: "20%", y: "78%", size: 2, color: "#a78bfa", delay: 1.1 },
  { x: "88%", y: "70%", size: 3, color: "#22d3ee", delay: 0.3 },
  { x: "50%", y: "12%", size: 2, color: "#e879f9", delay: 1.6 },
  { x: "68%", y: "88%", size: 2, color: "#22d3ee", delay: 0.9 },
];

// Exit is the literal "dissolve": the frosted panel's blur relaxes to
// zero at the same time it scales up and fades, so the crisp Hero
// underneath resolves into focus instead of just popping in.
const panelVariants = {
  enter: {
    opacity: 1,
    scale: 1,
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
  },
  exit: {
    opacity: 0,
    scale: 1.08,
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * High-tech entry splash shown once per page load. A quantum-circuit
 * ring spins up, the three host/partner marks reveal in sequence, then
 * the whole overlay dissolves — scale up, backdrop blur relaxing to
 * zero, opacity to zero, all in one eased motion — to reveal the
 * already-rendered Hero beneath it. Mounted/unmounted by <AnimatePresence>
 * in App.jsx so the `exit` variant above actually gets to play before
 * the component leaves the tree. Respects prefers-reduced-motion by
 * cutting the hold short and skipping the particle/ring animation.
 */
export default function SplashScreen({ onHoldComplete }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const holdMs = mql.matches ? 400 : 2200;
    const t1 = setTimeout(() => onHoldComplete?.(), holdMs);
    return () => clearTimeout(t1);
    // Runs once per mount — this component is only ever mounted for a
    // single splash pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "rgba(7,9,14,0.88)" }}
      variants={panelVariants}
      initial="enter"
      animate="enter"
      exit="exit"
    >
      {/* Ambient quantum backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, #0b1330 0%, #07090e 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(34,211,238,0.12), transparent 40%), radial-gradient(circle at 80% 70%, rgba(167,139,250,0.12), transparent 40%)",
        }}
      />

      {/* Soft ambient particle glows */}
      {!reduced &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 5}px ${p.size * 1.5}px ${p.color}`,
            }}
            animate={{ opacity: [0.15, 0.75, 0.15] }}
            transition={{ duration: 3.4, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      {/* Thin HUD corner brackets — crisp line-art framing */}
      <svg
        className="absolute top-6 left-6 w-10 h-10 sm:w-14 sm:h-14 opacity-30"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
      >
        <path d="M2 20V2H20" stroke="#7dd3fc" strokeWidth="1.2" />
      </svg>
      <svg
        className="absolute bottom-6 right-6 w-10 h-10 sm:w-14 sm:h-14 opacity-30"
        viewBox="0 0 56 56"
        fill="none"
        aria-hidden="true"
      >
        <path d="M54 36V54H36" stroke="#a78bfa" strokeWidth="1.2" />
      </svg>

      {/* Spinning quantum-circuit ring loader */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: "1.5px solid rgba(34,211,238,0.18)" }}
        />
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            border: "1.5px solid transparent",
            borderTopColor: "#22d3ee",
            borderRightColor: "#a78bfa",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-3 rounded-full"
          style={{ border: "1px dashed rgba(232,239,255,0.25)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-wide"
          style={{ color: "#e8effe" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          |ψ⟩
        </motion.span>
      </div>

      {/* Event title */}
      <motion.div
        className="relative mt-8 text-center px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1
          className="font-bold tracking-tight text-2xl sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "#f8fafc" }}
        >
          {EVENT_INFO.title}
        </h1>
        <p className="mt-2 font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "#7dd3fc" }}>
          Initializing quantum experience…
        </p>
      </motion.div>

      {/* Partner logo reveal row */}
      <motion.div
        className="relative mt-9 flex items-center gap-5 sm:gap-7"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.5 } } }}
      >
        {PARTNERS.map((p) => (
          <motion.div
            key={p.label}
            variants={{ hidden: { opacity: 0, y: 8, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center h-8"
            title={p.label}
          >
            {p.src ? (
              <img src={p.src} alt={p.label} className="h-6 sm:h-7 w-auto object-contain opacity-90" draggable="false" />
            ) : (
              <span className="text-sm sm:text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "#4589ff" }}>
                {p.wordmark}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Progress hairline */}
      <div className="relative mt-8 w-40 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #22d3ee, #a78bfa)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}
