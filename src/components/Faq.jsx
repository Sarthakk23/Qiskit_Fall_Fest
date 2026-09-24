import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import { FAQS } from "../data/siteData";

// A CSS grid-template-rows 0fr → 1fr collapse (rather than framer's
// `height: 0 → auto`) never needs to *measure* the answer's pixel
// height mid-animation, so it can't momentarily overshoot/undershoot
// and cause the surrounding grid to snap. Paired with `layout` on the
// ancestors below, any resulting reflow (e.g. the section re-centering
// on tall viewports) animates smoothly instead of jumping.
function FaqItem({ item, open, onClick }) {
  return (
    <motion.div layout="position" className="border-b" style={{ borderColor: "var(--line)" }}>
      <motion.button
        layout="position"
        onClick={onClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full py-6 flex items-center justify-between text-left gap-6"
      >
        <span className="text-base md:text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          {item.q}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "var(--cyan)" }} />
        </motion.span>
      </motion.button>

      <div
        className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", transitionDuration: "350ms" }}
      >
        <div className="overflow-hidden min-h-0">
          <p className="pb-6 text-sm md:text-base leading-relaxed max-w-[70ch]" style={{ color: "var(--text-mid)" }}>
            {item.a}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section
      id="faq"
      className="relative lg:min-h-[100dvh] flex flex-col justify-center py-10 md:py-24 lg:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[0.7fr,1.3fr] gap-6 lg:gap-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
            <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
              FAQ
            </span>
            <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
              Questions, answered.
            </h2>
          </motion.div>
          <motion.div
            layout
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportReveal}
            transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
          >
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} open={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
