import { useState } from "react";
import { motion } from "framer-motion";
import { MonitorPlay, Calendar, BadgeCheck, GraduationCap, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { SPEAKERS } from "../data/siteData";
import useMagneticCursor from "../hooks/useMagneticCursor";
import { LinkedinIcon, XIcon } from "./icons";
import speakerPhoto from "../assets/speaker-bhavna-bose.jpg";

const SOCIAL_ICONS = { linkedin: LinkedinIcon, x: XIcon };
const PHOTOS = { "bhavna-bose": speakerPhoto };

/** A speaker's profile link. Hrefs still containing "..." are
 * placeholders: they render dimmed and inert until a real URL is set
 * in siteData.js, so nobody lands on a broken profile page. */
function SocialButton({ type, href, label }) {
  const Icon = SOCIAL_ICONS[type];
  if (!Icon) return null;

  const base = "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300";
  const isPlaceholder = href.includes("...");

  if (isPlaceholder) {
    return (
      <span
        role="img"
        aria-label={`${label} (link coming soon)`}
        title="Link coming soon"
        className={base}
        style={{ borderColor: "var(--line)", opacity: 0.45 }}
      >
        <Icon className="w-4 h-4" style={{ color: "var(--text-mid)" }} />
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className={base}
      style={{ borderColor: "var(--line)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--cyan)";
        e.currentTarget.style.boxShadow = "0 0 15px color-mix(in srgb, var(--cyan) 50%, transparent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Icon className="w-4 h-4" style={{ color: "var(--text-mid)" }} />
    </a>
  );
}

/** Flagship spotlight card for the fest's confirmed keynote speaker.
 * Full-bleed frosted dark-glass panel, portrait, credential badges,
 * and rich session metadata — built to flex, not a bento tile. */
function SpotlightSpeakerCard({ s }) {
  const ref = useMagneticCursor();
  const photo = s.photo ? PHOTOS[s.photo] : null;

  return (
    <div ref={ref} data-magnetic className="relative group">
      {/* Soft, single-hue ambient halo — a calm indigo/violet wash that
          breathes very slowly behind the card, replacing the old
          spinning rainbow border. */}
      <div
        className="absolute -inset-6 rounded-[32px] pointer-events-none spotlight-halo"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, color-mix(in srgb, var(--violet) 20%, transparent), transparent 70%), radial-gradient(50% 50% at 80% 85%, color-mix(in srgb, var(--blue) 14%, transparent), transparent 70%)",
          filter: "blur(28px)",
        }}
        aria-hidden="true"
      />

      <div className="relative rounded-[24px] overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12 spotlight-frame">
        {/* Thin metallic top-edge highlight — the "premium glass" cue */}
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in srgb, var(--violet) 55%, white 15%), color-mix(in srgb, var(--cyan) 45%, white 15%), transparent)",
            opacity: 0.6,
          }}
          aria-hidden="true"
        />

        {/* Portrait */}
        <div className="relative shrink-0 mx-auto lg:mx-0">
          <div
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden relative"
            style={{ border: "1px solid var(--line-bright)", boxShadow: "0 0 0 6px color-mix(in srgb, var(--cyan) 6%, transparent)" }}
          >
            {photo ? (
              <img
                src={photo}
                alt={`${s.name}, ${s.role}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                <span className="text-3xl" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
                  {s.initials}
                </span>
              </div>
            )}
          </div>
          <span
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.12em] px-3 py-1 rounded-full uppercase font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#07090e",
              background: "linear-gradient(90deg, var(--cyan), var(--violet))",
            }}
          >
            Keynote Speaker
          </span>
        </div>

        {/* Details */}
        <div className="relative flex-1 min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {s.name}
              </h3>
              <p className="mt-1 text-sm leading-snug max-w-[48ch]" style={{ color: "var(--text-mid)" }}>
                {s.role}, <span style={{ color: "var(--text)" }}>{s.org}</span>
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)" }}>
                <GraduationCap className="w-3.5 h-3.5" strokeWidth={1.8} />
                {s.community}
              </p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--cyan)",
                  borderColor: "color-mix(in srgb, var(--cyan) 40%, transparent)",
                  background: "color-mix(in srgb, var(--cyan) 8%, transparent)",
                }}
              >
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.6} />
                {s.sessionDate}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--violet)",
                  borderColor: "color-mix(in srgb, var(--violet) 40%, transparent)",
                  background: "color-mix(in srgb, var(--violet) 8%, transparent)",
                }}
              >
                <MonitorPlay className="w-3.5 h-3.5" strokeWidth={1.6} />
                {s.mode}
              </span>
            </div>
          </div>

          <h4
            className="mt-5 text-lg sm:text-xl font-semibold leading-snug"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            {s.session}
          </h4>
          <p className="mt-2 text-sm leading-relaxed max-w-[62ch]" style={{ color: "var(--text-mid)" }}>
            {s.summary}
          </p>

          {/* Credential badges */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {s.badges.map((b) => (
              <li
                key={b}
                className="flex items-center gap-1.5 text-[11.5px] px-3 py-1.5 rounded-full border"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text)", borderColor: "var(--line-bright)", background: "var(--surface-2)" }}
              >
                <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--cyan)" }} strokeWidth={1.8} />
                {b}
              </li>
            ))}
          </ul>

          {/* Research focus pills */}
          <div className="mt-5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--violet)" }} strokeWidth={1.6} />
            <ul className="flex flex-wrap gap-2">
              {s.topics.map((t) => (
                <li
                  key={t}
                  className="text-[11px] px-2.5 py-1 rounded-full border"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--text-mid)", borderColor: "var(--line)" }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 flex items-center gap-2">
            {s.socials.map((social) => (
              <SocialButton key={social.type} {...social} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Speaker to be announced. */
function PlaceholderSpeakerCard({ s }) {
  const [hover, setHover] = useState(false);
  const ref = useMagneticCursor();

  return (
    <div
      ref={ref}
      data-magnetic
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="surface-card chip relative h-full p-6 sm:min-h-[220px] flex flex-col justify-between overflow-hidden"
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
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-500"
          style={{
            border: "1px solid var(--line-bright)",
            background: "var(--surface-2)",
            transform: hover ? "scale(1.08)" : "scale(1)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }} className="text-base">
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
        className="relative mt-5 pt-4 border-t transition-opacity duration-400"
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
  const featured = SPEAKERS.find((s) => s.name);
  const placeholders = SPEAKERS.filter((s) => !s.name);

  return (
    <section
      id="speakers"
      className="relative lg:min-h-[100dvh] flex flex-col justify-center py-10 md:py-24 lg:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="max-w-[62ch] mb-8 md:mb-14"
        >
          <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
            IBM EXPERTS
          </span>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Learn from the people building this.
          </h2>
        </motion.div>

        {featured && (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal} className="mb-6 md:mb-8">
            <SpotlightSpeakerCard s={featured} />
          </motion.div>
        )}

        {placeholders.length > 0 && (
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={viewportReveal}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {placeholders.map((s) => (
              <motion.div
                key={s.role}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <PlaceholderSpeakerCard s={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
