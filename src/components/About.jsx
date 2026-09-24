import { motion } from "framer-motion";
import { NotebookPen, Users2, ArrowUpRight } from "lucide-react";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { LINKS } from "../data/siteData";

const PILLARS = [
  {
    title: "Quantica",
    href: LINKS.quantica,
    body: "The Quantum Computing Society at IIIT-Delhi — a student community building fluency in quantum information through workshops, reading groups, and open-source Qiskit projects.",
  },
  {
    title: "CQT",
    body: "The Centre for Quantum Technologies at IIIT-Delhi houses the research and faculty mentorship that anchors the fest, connecting students with active quantum research.",
  },
  {
    title: "IBM",
    body: "As part of IBM's global Qiskit Fall Fest series, this edition brings IBM's quantum engineers, open-source tooling, and real quantum hardware access directly into the week — turning a set of workshops into a genuine on-ramp to the field.",
    wide: true,
  },
];

const HIGHLIGHTS = [
  {
    icon: NotebookPen,
    title: "Start from zero, notebook in hand",
    body: "Every participant gets a custom, curated Jupyter Notebook (.ipynb) template that builds up foundational quantum computing concepts from scratch — no prior background assumed.",
  },
  {
    icon: Users2,
    title: "Built for every level",
    body: "The fest is designed for absolute beginners taking their first steps into quantum, and for advanced academic researchers pushing on open problems — the same week serves both.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative lg:min-h-[100dvh] flex flex-col justify-center py-10 md:py-24 lg:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[0.7fr,1.3fr] gap-8 lg:gap-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportReveal}
          >
            <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>
              ABOUT THE FEST
            </span>
            <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
              Three orgs. One waveform.
            </h2>
            <p className="mt-5 text-sm leading-relaxed max-w-[46ch]" style={{ color: "var(--text-mid)" }}>
              Qiskit Fall Fest is a global series of student-organized quantum computing events
              supported by IBM Quantum. This edition pairs that global program with a local
              goal: give IIIT-Delhi's community a genuine, hands-on week in quantum computing.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={viewportReveal}
            className="grid sm:grid-cols-2 gap-8 md:gap-10"
          >
            {PILLARS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={p.wide ? "pt-2 sm:col-span-2" : "pb-6 border-b"}
                style={!p.wide ? { borderColor: "var(--line)" } : undefined}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      {p.title}
                      <ArrowUpRight className="w-4 h-4" strokeWidth={1.8} style={{ color: "var(--blue)" }} />
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${p.wide ? "max-w-[60ch]" : ""}`}
                  style={{ color: "var(--text-mid)" }}
                >
                  {p.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="mt-10 md:mt-16 lg:mt-20 grid sm:grid-cols-2 gap-5"
        >
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={h.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="surface-card chip p-7 md:p-8"
                style={{ borderColor: "var(--line)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                  style={{
                    background: "color-mix(in srgb, var(--blue) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--blue) 40%, transparent)",
                  }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.6} style={{ color: "var(--blue)" }} />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {h.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                  {h.body}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
