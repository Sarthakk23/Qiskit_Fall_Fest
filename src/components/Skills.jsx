import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { VERTICALS } from "../data/siteData";
import { MagneticButton } from "./Magnetic";

function VerticalCard({ item, selected, onToggle }) {
  const Icon = item.icon;
  return (
    <MagneticButton
      onClick={onToggle}
      className="surface-card chip relative text-left p-6 md:p-7 w-full h-full min-h-[220px] flex flex-col justify-between"
      style={{
        borderColor: selected ? "var(--blue)" : "var(--line)",
        boxShadow: selected
          ? "0 0 0 1px color-mix(in srgb, var(--blue) 25%, transparent), 0 20px 50px -20px color-mix(in srgb, var(--blue) 35%, transparent), 0 0 30px -6px color-mix(in srgb, var(--violet) 40%, transparent)"
          : "none",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300"
          style={{
            background: selected
              ? "color-mix(in srgb, var(--blue) 12%, transparent)"
              : "color-mix(in srgb, var(--text) 5%, transparent)",
            border: `1px solid ${selected ? "color-mix(in srgb, var(--blue) 50%, transparent)" : "var(--line)"}`,
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={1.6} style={{ color: selected ? "var(--blue)" : "var(--text-mid)" }} />
        </div>

        <span
          className="text-[10px] tracking-[0.12em] px-2.5 py-1 rounded-full border uppercase transition-colors duration-300"
          style={{
            fontFamily: "var(--font-mono)",
            color: selected ? "var(--blue)" : "var(--text-dim)",
            borderColor: selected ? "color-mix(in srgb, var(--blue) 50%, transparent)" : "var(--line)",
            background: selected ? "color-mix(in srgb, var(--blue) 8%, transparent)" : "transparent",
          }}
        >
          {item.tagline}
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-base md:text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {item.title}
        </h3>
        <p
          className="text-sm leading-relaxed transition-opacity duration-300"
          style={{ color: "var(--text-mid)", opacity: selected ? 1 : 0.75 }}
        >
          {item.desc}
        </p>
      </div>
    </MagneticButton>
  );
}

export default function Skills() {
  const [selected, setSelected] = useState(() => new Set());

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section
      id="skills"
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
          <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>
            5-DAY HACKATHON
          </span>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Pick your vertical.
          </h2>
          <p className="mt-4 text-sm md:text-base" style={{ color: "var(--text-mid)" }}>
            Tap a card to shortlist it — every team builds one project inside one of these four
            verticals across the hacking period.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {VERTICALS.map((v) => (
            <motion.div
              key={v.id}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={v.big ? "lg:col-span-2" : ""}
            >
              <VerticalCard item={v} selected={selected.has(v.id)} onToggle={() => toggle(v.id)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
