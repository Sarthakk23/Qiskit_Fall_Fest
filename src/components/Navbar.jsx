import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Atom } from "lucide-react";
import { NAV_LINKS } from "../data/siteData";
import { cn } from "../lib/utils";
import { MagneticButton } from "./Magnetic";
import ThemeToggle from "./ThemeToggle";

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
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <MagneticButton onClick={() => go("top")} className="flex items-center gap-2">
          <Atom className="w-6 h-6" style={{ color: "var(--cyan)" }} strokeWidth={1.6} />
          <span className="text-[15px] md:text-base tracking-tight font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Qiskit Fall Fest
          </span>
        </MagneticButton>

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
