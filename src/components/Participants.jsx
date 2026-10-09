import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  ArrowUpRight,
  Users,
  Clock,
  Radio,
  Building2,
  Gavel,
  Presentation,
  Info,
} from "lucide-react";
import { fadeUp, staggerContainer, viewportReveal } from "../lib/motionVariants";
import { MagneticAnchor } from "./Magnetic";
import {
  LINKS,
  PARTICIPANT_SCHEDULE,
  GETTING_STARTED,
  TEAM_FORM_DEADLINE,
  TEAM_FORM_DEADLINE_LABEL,
  PARTICIPANTS_LAST_UPDATED,
  FINALE_VENUE_PLACEHOLDER,
} from "../data/siteData";

const MONO = { fontFamily: "var(--font-mono)" };

function Eyebrow({ children, color = "var(--blue)" }) {
  return (
    <span className="text-[11px] tracking-[0.14em] uppercase" style={{ ...MONO, color }}>
      {children}
    </span>
  );
}

function IconBadge({ Icon, color = "var(--blue)" }) {
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
      }}
    >
      <Icon className="w-5 h-5" strokeWidth={1.6} style={{ color }} />
    </div>
  );
}

/** True once the team-matching deadline has passed. Re-checks every
 * 30 s so a page left open flips over without a reload. */
function useTeamFormClosed() {
  const deadline = new Date(TEAM_FORM_DEADLINE).getTime();
  const [closed, setClosed] = useState(() => Date.now() >= deadline);
  useEffect(() => {
    if (closed) return undefined;
    const id = setInterval(() => {
      if (Date.now() >= deadline) setClosed(true);
    }, 30000);
    return () => clearInterval(id);
  }, [closed, deadline]);
  return closed;
}

function ScheduleRow({ item }) {
  const inPerson = item.mode.startsWith("In person");
  return (
    <li className="py-4 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span
          className="text-[11px] tracking-[0.1em] px-2.5 py-1 rounded-full border"
          style={{
            ...MONO,
            color: "var(--blue)",
            borderColor: "var(--line-bright)",
            background: "color-mix(in srgb, var(--blue) 8%, transparent)",
          }}
        >
          {item.date.toUpperCase()}
        </span>
        {item.mode && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.06em] px-2.5 py-1 rounded-full border"
            style={{
              ...MONO,
              color: inPerson ? "var(--violet)" : "var(--cyan)",
              borderColor: "var(--line-bright)",
            }}
          >
            {inPerson ? <Building2 className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
            {item.mode}
          </span>
        )}
      </div>
      <p className="text-[15px] md:text-base font-medium leading-snug">{item.title}</p>
      {item.time && (
        <p className="mt-1 text-[13px] flex items-center gap-1.5" style={{ ...MONO, color: "var(--text-dim)" }}>
          <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.6} />
          {item.time}
        </p>
      )}
      {item.venue && (
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-mid)" }}>
          Venue:{" "}
          <span
            className="px-1.5 py-0.5 rounded border border-dashed"
            style={{ ...MONO, borderColor: "var(--text-dim)" }}
          >
            {FINALE_VENUE_PLACEHOLDER}
          </span>
        </p>
      )}
    </li>
  );
}

export default function Participants() {
  const teamClosed = useTeamFormClosed();

  return (
    <section
      id="participants"
      className="relative py-12 md:py-24 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="max-w-[62ch] mb-8 md:mb-12"
        >
          <Eyebrow>FOR PARTICIPANTS</Eyebrow>
          <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.05] tracking-tight">
            Registered? Start here.
          </h2>
          <p className="mt-4 text-sm md:text-base" style={{ color: "var(--text-mid)" }}>
            Registrations are closed. Everything you need for the week is on this page. Joining
            links are shared on Discord and by email.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="grid lg:grid-cols-[1fr,1fr] gap-5"
        >
          {/* Left column: Discord + team box */}
          <div className="flex flex-col gap-5">
            <motion.div
              variants={fadeUp}
              className="surface-card chip relative overflow-hidden p-6 md:p-8"
              style={{ borderColor: "var(--line-bright)" }}
            >
              <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 pointer-events-none"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--violet) 30%, transparent), transparent 70%)" }}
              />
              <div className="relative">
                <IconBadge Icon={MessageCircle} color="var(--violet)" />
                <h3 className="mt-5 text-xl md:text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  Join our Discord
                </h3>
                <p className="mt-3 text-sm md:text-base leading-relaxed max-w-[52ch]" style={{ color: "var(--text-mid)" }}>
                  All important announcements, challenge releases, updates and team formation happen
                  here. Please join if you have not already.
                </p>
                <MagneticAnchor
                  href={LINKS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary chip mt-6 w-full sm:w-auto min-h-[56px] px-8 py-4 text-[15px] inline-flex items-center justify-center gap-2"
                >
                  Join our Discord <ArrowUpRight className="w-4 h-4" />
                </MagneticAnchor>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="surface-card chip p-6 md:p-8" style={{ borderColor: "var(--line)" }}>
              <div className="flex items-center gap-4">
                <IconBadge Icon={Users} />
                <h3 className="text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  Need a team?
                </h3>
              </div>
              {teamClosed ? (
                <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-mid)" }}>
                  Team matching has closed. Ask on Discord.
                </p>
              ) : (
                <>
                  <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-mid)" }}>
                    Fill in the team-matching form and we will help you find teammates. Last date:{" "}
                    <strong style={{ color: "var(--text)" }}>{TEAM_FORM_DEADLINE_LABEL}</strong>.
                  </p>
                  <MagneticAnchor
                    href={LINKS.teamForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost chip-sm mt-5 w-full sm:w-auto min-h-[48px] px-6 py-3 text-sm inline-flex items-center justify-center gap-2"
                  >
                    Team-matching form <ArrowUpRight className="w-4 h-4" />
                  </MagneticAnchor>
                </>
              )}
            </motion.div>
          </div>

          {/* Right column: schedule */}
          <motion.div variants={fadeUp} className="surface-card chip p-6 md:p-8" style={{ borderColor: "var(--line)" }}>
            <Eyebrow color="var(--cyan)">EVENT SCHEDULE · ALL TIMES IST</Eyebrow>
            <ul className="mt-3">
              {PARTICIPANT_SCHEDULE.map((item) => (
                <ScheduleRow key={item.date} item={item} />
              ))}
            </ul>
            <p className="mt-3 text-[13px] flex items-start gap-2" style={{ color: "var(--text-dim)" }}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.6} />
              Joining links are shared on Discord and by email.
            </p>
          </motion.div>
        </motion.div>

        {/* Getting started */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="mt-5 surface-card chip p-6 md:p-8"
          style={{ borderColor: "var(--line)" }}
        >
          <Eyebrow>GETTING STARTED</Eyebrow>
          <h3 className="mt-3 text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Four things to do before kickoff
          </h3>
          <ol className="mt-5 grid sm:grid-cols-2 gap-4">
            {GETTING_STARTED.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] shrink-0"
                  style={{
                    ...MONO,
                    color: "var(--blue)",
                    border: "1px solid color-mix(in srgb, var(--blue) 50%, transparent)",
                    background: "color-mix(in srgb, var(--blue) 10%, transparent)",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm md:text-base leading-relaxed pt-0.5" style={{ color: "var(--text-mid)" }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Judging + poster session */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportReveal}
          className="mt-5 grid md:grid-cols-2 gap-5"
        >
          <motion.div variants={fadeUp} className="surface-card chip p-6 md:p-8" style={{ borderColor: "var(--line)" }}>
            <IconBadge Icon={Gavel} />
            <h3 className="mt-5 text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              How judging works
            </h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-mid)" }}>
              Faculty judges score every submission on one 100-point rubric covering technical
              depth, validation, hardware awareness, analysis and presentation. The top 3 teams per
              track present live at the finale on 16 Oct.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="surface-card chip p-6 md:p-8" style={{ borderColor: "var(--line)" }}>
            <IconBadge Icon={Presentation} color="var(--violet)" />
            <h3 className="mt-5 text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Research poster session
            </h3>
            <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: "var(--text-mid)" }}>
              Open to any student or researcher at the university with quantum work to show.
              Abstracts were due Mon, 12 Oct. Judged prize and people's choice prize.
            </p>
          </motion.div>
        </motion.div>

        <p className="mt-8 text-[12px]" style={{ ...MONO, color: "var(--text-dim)" }}>
          Last updated: {PARTICIPANTS_LAST_UPDATED}
        </p>
      </div>
    </section>
  );
}
