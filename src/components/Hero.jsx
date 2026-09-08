import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { fadeUp, staggerContainer } from "../lib/motionVariants";
import { useTheme } from "../lib/ThemeContext";
import { MagneticButton } from "./Magnetic";
import BlochSphereFallback from "./BlochSphereFallback";
import { EVENT_INFO } from "../data/siteData";

// The three.js scene is its own chunk — the hero's text and CTAs render
// immediately, and the sphere fades in as soon as it's ready.
const BlochSphere = lazy(() => import("./BlochSphere"));

export default function Hero({ onRegister }) {
  const { isDark } = useTheme();

  return (
    <section
      id="top"
      className="relative min-h-[100dvh] flex flex-col justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Ambient theme-aware backdrop, sits behind the 3D sphere */}
      <div
        className="absolute inset-0 -z-10 transition-colors duration-700"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 90% 70% at 50% 0%, #0b1330 0%, var(--bg) 65%)"
            : "radial-gradient(ellipse 90% 70% at 50% 0%, #eef2ff 0%, var(--bg) 70%)",
        }}
      />

      <div className="absolute inset-0 -z-10">
        <Suspense fallback={<BlochSphereFallback />}>
          <BlochSphere dark={isDark} />
        </Suspense>
      </div>

      {/* Vignette so text stays legible over the sphere */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 38%, transparent 0%, var(--bg) 88%)",
        }}
      />

      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-8 w-full text-center flex flex-col items-center"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border chip-sm"
          style={{ borderColor: "var(--line-bright)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--blue)", boxShadow: "0 0 8px 2px color-mix(in srgb, var(--blue) 80%, transparent)" }}
          />
          <span
            className="text-[11px] tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--text-mid)" }}
          >
            {EVENT_INFO.dateRangeShort.toUpperCase()} · HYBRID · {EVENT_INFO.organizersLine.toUpperCase()}
          </span>
        </motion.div>

        <h1
          className="font-bold leading-[0.92] tracking-tight text-[clamp(2.75rem,10vw,8.5rem)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <motion.span variants={fadeUp} className="block">
            Qiskit Fall Fest
          </motion.span>
          <motion.span variants={fadeUp} className="block">
            <span
              style={{
                background: "linear-gradient(90deg, var(--blue), var(--violet))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              2026.
            </span>
          </motion.span>
        </h1>

        <motion.p
          variants={fadeUp}
          className="mt-7 text-base md:text-lg max-w-[54ch] leading-relaxed"
          style={{ color: "var(--text-mid)" }}
        >
          {EVENT_INFO.subheadline} Organized by {EVENT_INFO.organizersLine}. Free · Open to everyone.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            onClick={onRegister}
            className="btn-primary chip px-8 py-4 text-sm inline-flex items-center gap-2"
          >
            Register Now <ArrowRight className="w-4 h-4" />
          </MagneticButton>
          <MagneticButton
            onClick={() => document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-ghost chip px-8 py-4 text-sm"
          >
            View Schedule
          </MagneticButton>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-2" style={{ color: "var(--text-mid)" }}>
            <Calendar className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
            <span className="text-[13px]" style={{ fontFamily: "var(--font-mono)" }}>
              {EVENT_INFO.dateRange}, 2026
            </span>
          </div>
          <div className="flex items-center gap-2" style={{ color: "var(--text-mid)" }}>
            <MapPin className="w-4 h-4" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
            <span className="text-[13px]" style={{ fontFamily: "var(--font-mono)" }}>
              {EVENT_INFO.venue}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
