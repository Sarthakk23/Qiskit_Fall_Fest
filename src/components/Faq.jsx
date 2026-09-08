import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import { FAQS } from "../data/siteData";

function FaqItem({ item, open, onClick }) {
  return (
    <div className="border-b" style={{ borderColor: "var(--line)" }}>
      <motion.button
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm md:text-base leading-relaxed max-w-[70ch]" style={{ color: "var(--text-mid)" }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section
      id="faq"
      className="relative min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[0.7fr,1.3fr] gap-10 lg:gap-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
            <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
              FAQ
            </span>
            <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
              Questions, answered.
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
            <div>
              {FAQS.map((item, i) => (
                <FaqItem key={item.q} item={item} open={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? -1 : i)} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
