import { motion } from "framer-motion";
import { MessageCircle, CalendarDays, ArrowUpRight } from "lucide-react";
import { fadeUp } from "../lib/motionVariants";
import { MagneticAnchor } from "./Magnetic";
import { LINKS, REGISTRATION_CLOSED_MESSAGE } from "../data/siteData";
import qffBadge from "../assets/qff-fall-fest-badge.png";

/** Shown instead of the old registration page (/register, #register,
 * or an old ?join= invite link). There is no form here. */
export default function RegistrationClosed() {
  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-5 py-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="surface-card chip relative w-full max-w-[560px] p-8 md:p-10 text-center"
        style={{ borderColor: "var(--line-bright)" }}
      >
        <img src={qffBadge} alt="Qiskit Fall Fest 2026" className="w-14 h-14 mx-auto object-contain" draggable="false" />
        <span
          className="mt-6 block text-[11px] tracking-[0.14em]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}
        >
          QISKIT FALL FEST 2026
        </span>
        <h1 className="mt-3 font-bold text-3xl md:text-4xl leading-tight tracking-tight">Registrations closed</h1>
        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-mid)" }}>
          {REGISTRATION_CLOSED_MESSAGE} If you are already registered, join the Discord for
          announcements and see the schedule for what happens next.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <MagneticAnchor
            href={LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary chip min-h-[56px] px-8 py-4 text-[15px] inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Join our Discord <ArrowUpRight className="w-4 h-4" />
          </MagneticAnchor>
          <a
            href="/#participants"
            className="btn-ghost chip min-h-[52px] px-8 py-3.5 text-sm inline-flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" /> View the schedule
          </a>
        </div>
      </motion.div>
    </main>
  );
}
