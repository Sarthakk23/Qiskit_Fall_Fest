import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle2, ChevronRight, Radio, Building2 } from "lucide-react";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { SCHEDULE, EVENT_INFO } from "../data/siteData";

export default function Schedule() {
  const [active, setActive] = useState(0);
  const activeDay = SCHEDULE[active];
  const isOffline = activeDay.mode === "Offline";

  return (
    <section
      id="schedule"
      className="relative lg:min-h-[100dvh] flex flex-col justify-center py-10 md:py-24 lg:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 w-full">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="max-w-[62ch] mb-6 md:mb-10"
        >
          <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>
            {EVENT_INFO.dateRangeShort.toUpperCase()}
          </span>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Eight days, one waveform.
          </h2>
          <p className="mt-4 text-sm md:text-base" style={{ color: "var(--text-mid)" }}>
            Online from the opening seminar through judging, then one offline day on campus for
            the poster session and grand finale.
          </p>
        </motion.div>

        {/* Pill tab rail — explicitly clickable date selectors */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
        >
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
            <span
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}
            >
              Select a day
            </span>
          </div>

          <div
            className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible"
            style={{ scrollbarWidth: "none" }}
          >
            {SCHEDULE.map((s, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <motion.button
                  key={s.day}
                  variants={fadeUp}
                  onClick={() => setActive(i)}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex-shrink-0 flex items-center gap-2.5 rounded-full border pl-3 pr-4 py-2.5 text-left transition-colors duration-300"
                  style={{
                    borderColor: isActive ? "var(--blue)" : "var(--line)",
                    background: isActive
                      ? "linear-gradient(135deg, color-mix(in srgb, var(--blue) 22%, transparent), color-mix(in srgb, var(--violet) 16%, transparent))"
                      : "color-mix(in srgb, var(--surface) 60%, transparent)",
                    boxShadow: isActive
                      ? "0 0 0 1px color-mix(in srgb, var(--blue) 35%, transparent), 0 0 28px -6px color-mix(in srgb, var(--blue) 55%, transparent)"
                      : "none",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="schedule-active-pill"
                      className="absolute inset-0 rounded-full pulse-glow"
                      style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--blue) 45%, transparent)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span
                    className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isActive || isPast ? "var(--blue)" : "var(--bg-1)",
                      border: `1.5px solid ${isActive || isPast ? "var(--blue)" : "var(--line-bright)"}`,
                    }}
                  >
                    {isPast && !isActive && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--bg)" }} />}
                  </span>
                  <span className="relative z-10 flex flex-col items-start leading-tight">
                    <span
                      className="text-[10px] tracking-[0.1em]"
                      style={{ fontFamily: "var(--font-mono)", color: isActive ? "var(--blue)" : "var(--text-dim)" }}
                    >
                      {s.day.toUpperCase()} · {s.date}
                    </span>
                    <span
                      className="text-[13px] font-medium whitespace-nowrap"
                      style={{ color: isActive ? "var(--text)" : "var(--text-mid)" }}
                    >
                      {s.title.length > 26 ? s.title.slice(0, 24) + "…" : s.title}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Active day detail panel */}
        <div
          className="surface-card chip mt-8 p-8 md:p-10 min-h-[180px] flex flex-col justify-center overflow-hidden relative"
          style={{ borderColor: "var(--line-bright)" }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--blue) 30%, transparent), transparent 70%)" }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-[11px] tracking-[0.14em] px-2.5 py-1 rounded-full border"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--blue)",
                    borderColor: "var(--line-bright)",
                    background: "color-mix(in srgb, var(--blue) 8%, transparent)",
                  }}
                >
                  {activeDay.day.toUpperCase()} · {activeDay.date}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] px-2.5 py-1 rounded-full border"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: isOffline ? "var(--violet)" : "var(--cyan)",
                    borderColor: "var(--line-bright)",
                    background: isOffline
                      ? "color-mix(in srgb, var(--violet) 8%, transparent)"
                      : "color-mix(in srgb, var(--cyan) 8%, transparent)",
                  }}
                >
                  {isOffline ? <Building2 className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                  {activeDay.mode} · {activeDay.location}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                  <ChevronRight className="w-3.5 h-3.5" /> Day {active + 1} of {SCHEDULE.length}
                </span>
              </div>
              <h3 className="text-lg md:text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {activeDay.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed max-w-[70ch]" style={{ color: "var(--text-mid)" }}>
                {activeDay.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
