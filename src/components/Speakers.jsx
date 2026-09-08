import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { SPEAKERS } from "../data/siteData";
import useMagneticCursor from "../hooks/useMagneticCursor";

function SpeakerCard({ s }) {
  const [hover, setHover] = useState(false);
  const ref = useMagneticCursor();

  return (
    <div
      ref={ref}
      data-magnetic
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="surface-card chip relative p-6 min-h-[260px] flex flex-col justify-between overflow-hidden"
      style={{ borderColor: hover ? "var(--cyan)" : "var(--line)" }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hover ? 1 : 0,
          background: "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--cyan) 12%, transparent), transparent 60%)",
        }}
      />
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-500"
          style={{
            border: "1px solid var(--line-bright)",
            background: "var(--surface-2)",
            transform: hover ? "scale(1.08)" : "scale(1)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }} className="text-lg">
            {s.initials}
          </span>
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {s.role}
        </h3>
        <span className="text-[12px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          {s.org}
        </span>
      </div>
      <div
        className="relative mt-6 pt-4 border-t transition-opacity duration-400"
        style={{ borderColor: "var(--line)", opacity: hover ? 1 : 0.5 }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
          {s.focus}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
          Speaker to be announced
        </span>
      </div>
    </div>
  );
}

export default function Speakers() {
  return (
    <section
      id="speakers"
      className="relative min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="max-w-[62ch] mb-14"
        >
          <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
            IBM EXPERTS
          </span>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Learn from the people building this.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SPEAKERS.map((s) => (
            <motion.div
              key={s.role}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <SpeakerCard s={s} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
