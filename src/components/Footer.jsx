import { Mail, Calendar, MapPin, ArrowRight, Atom } from "lucide-react";
import { MagneticButton } from "./Magnetic";
import useMagneticCursor from "../hooks/useMagneticCursor";
import { EVENT_INFO } from "../data/siteData";

/* Inline SVGs for LinkedIn / Instagram — some lucide-react builds ship
   these under different export names or drop them between versions,
   so they're hand-coded here rather than imported. */function LinkedinIcon({ className, style }) {
  return (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
    </svg>
  );
}

function InstagramIcon({ className, style }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

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
      className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300"
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
      <Icon className="w-3.5 h-3.5" style={{ color: "var(--text-mid)" }} strokeWidth={1.6} />
    </a>
  );
}

/** Compact horizontal footer — everything (brand, event info,
 * organizers, socials, copyright, CTA) lives in one slim bar instead
 * of a tall multi-row grid, with reduced vertical padding. */
export default function Footer({ onRegister }) {
  return (
    <footer className="relative border-t" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5" style={{ color: "var(--cyan)" }} strokeWidth={1.6} />
            <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Qiskit Fall Fest
            </span>
            <span
              className="hidden md:inline text-[12px] pl-3 ml-1 border-l"
              style={{ color: "var(--text-dim)", borderColor: "var(--line)" }}
            >
              Quantica · CQT · IBM
            </span>
          </div>

          {/* Event info + organizers, inline */}
          <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]"
            style={{ color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: "var(--blue)" }} /> {EVENT_INFO.dateRangeShort}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: "var(--blue)" }} /> {EVENT_INFO.venue}
            </span>
          </div>

          {/* Socials + CTA */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <SocialLink key={s.label} Icon={s.Icon} href={s.href} label={s.label} />
              ))}
            </div>
            <MagneticButton
              onClick={onRegister}
              className="btn-ghost chip-sm px-4 py-2 text-[12px] inline-flex items-center gap-1.5"
            >
              Register <ArrowRight className="w-3 h-3" />
            </MagneticButton>
          </div>
        </div>

        <div
          className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            © 2026 Quantica, IIIT-Delhi. Built for the Qiskit Fall Fest.
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Part of IBM's global Qiskit Fall Fest series
          </span>
        </div>
      </div>
    </footer>
  );
}
