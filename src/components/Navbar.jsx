import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS, LINKS } from "../data/siteData";
import { cn } from "../lib/utils";
import { MagneticButton, MagneticAnchor } from "./Magnetic";
import ThemeToggle from "./ThemeToggle";
import qffBadge from "../assets/qff-fall-fest-badge.png";

// Co-host / partner marks. CQT's badge links out to the center's own
// site; Quantica's links to the Quantica microsite (see siteData.js).
const CQT_URL = "https://cqt.iiitd.ac.in/";

/** Co-host / partner badge — a small logo chip linked out to the
 * organization. IBM has no logo asset on hand, so it renders as a
 * clean wordmark in the IBM blue instead of an unlicensed image. */
function PartnerBadge({ href, label, src, wordmark }) {
  const content = src ? (
    <img src={src} alt={label} className="h-5 md:h-6 w-auto object-contain" draggable="false" />
  ) : (
    <span
      className="text-[13px] md:text-sm font-bold tracking-tight"
      style={{ fontFamily: "var(--font-display)", color: "#0f62fe" }}
    >
      {wordmark}
    </span>
  );

  const Wrapper = href ? MagneticAnchor : "div";
  const wrapperProps = href
    ? { href, target: "_blank", rel: "noopener noreferrer", "aria-label": label, title: label }
    : { "aria-label": label, title: label };

  return (
    <Wrapper
      {...wrapperProps}
      className="flex items-center justify-center h-7 md:h-8 px-1.5 rounded-lg opacity-80 hover:opacity-100 transition-opacity duration-300"
    >
      {content}
    </Wrapper>
  );
}

export default function Navbar({ onRegister }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-white/70 dark:bg-[#07090e]/80 border-b border-black/5 dark:border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <MagneticButton onClick={() => go("top")} className="flex items-center gap-2.5 shrink-0">
            <img src={qffBadge} alt="Qiskit Fall Fest 2026" className="w-8 h-8 md:w-9 md:h-9 object-contain" draggable="false" />
            <span className="text-[15px] md:text-base tracking-tight font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
              Qiskit Fall Fest
            </span>
          </MagneticButton>

          {/* Co-host / partner badges — Quantica, CQT, IBM, side by side */}
          <div
            className="hidden md:flex items-center gap-1 pl-3 ml-1 border-l"
            style={{ borderColor: "var(--line)" }}
          >
            <PartnerBadge href={LINKS.quantica} label="Quantica" src="/logos/quantica.png" />
            <PartnerBadge href={CQT_URL} label="CQT, IIIT-Delhi" src="/logos/cqt.png" />
            <PartnerBadge href="https://www.ibm.com/quantum" label="IBM Quantum" wordmark="IBM" />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <motion.button
              key={l.id}
              onClick={() => go(l.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0, scale: 0.96 }}
              className="relative px-4 py-2 rounded-full text-sm tracking-wide transition-all duration-300 hover:text-[color:var(--text)]"
              style={{ color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "color-mix(in srgb, var(--cyan) 10%, transparent)";
                e.currentTarget.style.boxShadow = "0 0 15px color-mix(in srgb, var(--cyan) 50%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {l.label}
            </motion.button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <MagneticButton
            onClick={onRegister}
            className="btn-primary chip-sm px-5 py-2.5 text-[13px] tracking-wide inline-flex items-center gap-2"
          >
            Register Now <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 -mr-2"
            style={{ color: "var(--text)" }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-black/5 dark:border-white/10 bg-white/97 dark:bg-[#07090e]/97 backdrop-blur-md"
          >
            <div className="px-5 py-6 flex flex-col gap-5">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="text-left text-base"
                  style={{ color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onRegister();
                }}
                className="btn-primary chip-sm px-5 py-3 text-sm inline-flex items-center justify-center gap-2 mt-2"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pt-4 mt-1 border-t" style={{ borderColor: "var(--line)" }}>
                <PartnerBadge href={LINKS.quantica} label="Quantica" src="/logos/quantica.png" />
                <PartnerBadge href={CQT_URL} label="CQT, IIIT-Delhi" src="/logos/cqt.png" />
                <PartnerBadge href="https://www.ibm.com/quantum" label="IBM Quantum" wordmark="IBM" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
