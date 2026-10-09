import { motion } from "framer-motion";
import { MessageCircle, Mail, ArrowUpRight } from "lucide-react";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import { MagneticAnchor } from "./Magnetic";
import { LINKS, CONTACT_EMAIL_PLACEHOLDER } from "../data/siteData";

export default function Contact() {
  return (
    <section id="contact" className="relative py-12 md:py-20 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
          <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>
            CONTACT
          </span>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Questions? Reach us.
          </h2>
          <p className="mt-4 text-sm md:text-base max-w-[60ch]" style={{ color: "var(--text-mid)" }}>
            The fastest way to reach the team is Discord.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
            <MagneticAnchor
              href={LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary chip min-h-[56px] px-8 py-4 text-[15px] inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Join our Discord <ArrowUpRight className="w-4 h-4" />
            </MagneticAnchor>
            <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-mid)" }}>
              <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--blue)" }} strokeWidth={1.6} />
              <span
                className="px-1.5 py-0.5 rounded border border-dashed"
                style={{ fontFamily: "var(--font-mono)", borderColor: "var(--text-dim)" }}
              >
                {CONTACT_EMAIL_PLACEHOLDER}
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
