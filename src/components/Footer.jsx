import { motion } from "framer-motion";
import { Mail, Calendar, MapPin, ArrowRight, ArrowUpRight } from "lucide-react";
import { MagneticButton } from "./Magnetic";
import useMagneticCursor from "../hooks/useMagneticCursor";
import { EVENT_INFO, LINKS, NAV_LINKS } from "../data/siteData";
import { InstagramIcon, LinkedinIcon } from "./icons";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import qffBadge from "../assets/qff-fall-fest-badge.png";

const CQT_URL = "https://cqt.iiitd.ac.in/";

const SOCIALS = [
  {
    Icon: InstagramIcon,
    href: "https://www.instagram.com/quantica_iiitd?igsh=ZTRtdDNrZHduem8x",
    label: "Instagram",
  },
  {
    Icon: LinkedinIcon,
    href: "https://www.linkedin.com/company/quantica-hq/",
    label: "LinkedIn",
  },
  {
    Icon: Mail,
    href: "mailto:quantica@iiitd.ac.in",
    label: "Email Quantica",
  },
];

/** Host/organizer badge — Quantica + CQT render their real mark, IBM
 * renders as a clean wordmark since no licensed logo asset is on hand. */
function OrganizerBadge({ href, label, src, wordmark }) {
  const content = src ? (
    <img src={src} alt={label} className="h-6 md:h-7 w-auto object-contain" draggable="false" />
  ) : (
    <span className="text-sm md:text-base font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "#4589ff" }}>
      {wordmark}
    </span>
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex items-center justify-center h-9 md:h-10 px-3 rounded-lg border opacity-85 hover:opacity-100 transition-all duration-300"
      style={{ borderColor: "var(--line)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--cyan)";
        e.currentTarget.style.boxShadow = "0 0 18px -4px color-mix(in srgb, var(--cyan) 55%, transparent)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {content}
    </a>
  );
}

function SocialLink({ Icon, href, label }) {
  const ref = useMagneticCursor();
  const isExternal = href.startsWith("http");
  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      data-magnetic
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300"
      style={{ borderColor: "var(--line)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--cyan)";
        e.currentTarget.style.boxShadow = "0 0 15px color-mix(in srgb, var(--cyan) 50%, transparent)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <Icon className="w-4 h-4" style={{ color: "var(--text-mid)" }} strokeWidth={1.6} />
    </a>
  );
}

/** Modernized quantum-dark footer: brand + organizer marks, quick nav
 * anchors, event logistics, socials, and a closing CTA/credit bar. */
export default function Footer({ onRegister }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t" style={{ borderColor: "var(--line)", background: "var(--bg)" }}>
      {/* Ambient quantum glow — same soft, low-opacity radial language as
          every other section, on the same base color as the page (var(--bg))
          instead of the lighter var(--bg-1), so the footer reads as a
          continuation of the page rather than a separate block. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 15% 0%, color-mix(in srgb, var(--cyan) 7%, transparent), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 100%, color-mix(in srgb, var(--violet) 8%, transparent), transparent 60%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportReveal}
        className="relative max-w-[1400px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-8"
      >
        <div className="grid md:grid-cols-[1.3fr,0.8fr,0.9fr] gap-10 md:gap-8 pb-10 border-b" style={{ borderColor: "var(--line)" }}>
          {/* Brand + organizers */}
          <div>
            <div className="flex items-center gap-2.5">
              <img src={qffBadge} alt="Qiskit Fall Fest 2026" className="w-8 h-8 object-contain" draggable="false" />
              <span className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
                Qiskit Fall Fest
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed max-w-[42ch]" style={{ color: "var(--text-mid)" }}>
              {EVENT_INFO.subheadline}
            </p>
            <div className="mt-5 flex items-center gap-2.5 flex-wrap">
              <OrganizerBadge href={LINKS.quantica} label="Quantica" src="/logos/quantica.png" />
              <OrganizerBadge href={CQT_URL} label="CQT, IIIT-Delhi" src="/logos/cqt.png" />
              <OrganizerBadge href="https://www.ibm.com/quantum" label="IBM Quantum" wordmark="IBM" />
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <span className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
              Explore
            </span>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    className="text-sm inline-block hover:text-[color:var(--cyan)] hover:translate-x-1 transition-all duration-200"
                    style={{ color: "var(--text-mid)" }}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => go("register")}
                  className="text-sm inline-block hover:text-[color:var(--cyan)] hover:translate-x-1 transition-all duration-200"
                  style={{ color: "var(--text-mid)" }}
                >
                  Register
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics + socials */}
          <div>
            <span className="text-[11px] tracking-[0.14em] uppercase" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
              Details
            </span>
            <div className="mt-4 flex flex-col gap-2.5 text-sm" style={{ color: "var(--text-mid)" }}>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
                {EVENT_INFO.dateRangeShort}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
                {EVENT_INFO.venue}
              </span>
              <a
                href="mailto:quantica@iiitd.ac.in"
                className="flex items-center gap-2 hover:text-[color:var(--cyan)] transition-colors duration-200"
              >
                <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
                quantica@iiitd.ac.in
              </a>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <SocialLink key={s.label} Icon={s.Icon} href={s.href} label={s.label} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA + legal bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              © 2026 Quantica, IIIT-Delhi. Built for the Qiskit Fall Fest.
            </span>
            <span className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
              Part of IBM's global Qiskit Fall Fest series
              <a
                href="https://qiskit.org/events/fall-fest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-[color:var(--cyan)] transition-colors duration-200"
              >
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </span>
          </div>

          <MagneticButton
            onClick={onRegister}
            className="btn-primary chip-sm px-5 py-2.5 text-[13px] inline-flex items-center gap-2"
          >
            Register Now <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>
      </motion.div>
    </footer>
  );
}
