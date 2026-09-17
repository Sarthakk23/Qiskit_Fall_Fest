import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import { registerAttendee, checkEmailExists, isSupabaseConfigured } from "../lib/supabaseClient";
import { EVENT_INFO } from "../data/siteData";

const EXPERIENCE_LEVELS = [
  { value: "", label: "Experience level (optional)" },
  { value: "new", label: "New to quantum computing" },
  { value: "some-qiskit", label: "Some Qiskit experience" },
  { value: "comfortable", label: "Comfortable with quantum algorithms" },
];

const inputClasses =
  "w-full px-4 py-3 text-sm rounded-lg outline-none transition-colors duration-200 " +
  "bg-white dark:bg-white/[0.04] " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "border border-black/10 dark:border-white/10 " +
  "focus:border-cyan-500 dark:focus:border-cyan-400 " +
  "focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20";

export default function Registration() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", teamName: "", experience: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | duplicate
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    // Fast pre-submit check so a returning visitor gets an instant,
    // friendly "you're already in" instead of only finding out after
    // the insert bounces off the database's unique constraint.
    const alreadyRegistered = await checkEmailExists(form.email);
    if (alreadyRegistered) {
      setStatus("duplicate");
      setErrorMsg(`${form.email.trim()} is already registered — check your inbox for your confirmation.`);
      return;
    }

    const { error, isDuplicate } = await registerAttendee(form);

    if (isDuplicate) {
      // Backstop for the rare race (e.g. two tabs submitting at once)
      // where the pre-check passed but the DB's unique constraint still
      // caught it on insert.
      setStatus("duplicate");
      setErrorMsg(`${form.email.trim()} is already registered — check your inbox for your confirmation.`);
      return;
    }

    if (error) {
      setStatus("error");
      setErrorMsg(
        isSupabaseConfigured
          ? "Something went wrong — please try again in a moment."
          : "Registration isn't connected yet (missing Supabase environment variables)."
      );
      return;
    }

    setStatus("success");
  };

  return (
    <section
      id="register"
      className="relative min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 w-full">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
          <div
            className="surface-card chip relative p-8 md:p-14 grid lg:grid-cols-[1.1fr,0.9fr] gap-10 lg:gap-14 items-start overflow-hidden"
            style={{ borderColor: "var(--line-bright)" }}
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--cyan) 18%, transparent), transparent 70%)" }}
            />

            <div className="relative">
              <span className="text-[11px] tracking-[0.14em]" style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>
                REGISTRATION
              </span>
              <h2 className="mt-4 font-bold text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] tracking-tight">
                Seats collapse fast.
              </h2>
              <p className="mt-4 text-sm md:text-base max-w-[52ch] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                Free to attend, open to all IIITD students — no prior quantum computing experience required.
                Teams of 1–4 for the hackathon track.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>5</div>
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>hackathon days</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>1–4</div>
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>team size</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>₹0</div>
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>entry fee</div>
                </div>
              </div>
            </div>

            {/* Live registration form, wired to Supabase */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-start gap-3 py-6"
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color: "var(--cyan)" }} strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                      You're in, {form.fullName.split(" ")[0]}.
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                      We've saved your spot for {EVENT_INFO.dateRangeShort}. Details land in your inbox at {form.email}{" "}
                      closer to the date.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3.5"
                    noValidate
                  >
                    <div>
                      <label htmlFor="fullName" className="sr-only">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="Full name"
                        value={form.fullName}
                        onChange={update("fullName")}
                        className={inputClasses}
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update("email")}
                        className={inputClasses}
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="sr-only">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={update("phone")}
                        className={inputClasses}
                        autoComplete="tel"
                      />
                    </div>

                    <div>
                      <label htmlFor="teamName" className="sr-only">
                        Team name
                      </label>
                      <input
                        id="teamName"
                        type="text"
                        placeholder="Team name (optional)"
                        value={form.teamName}
                        onChange={update("teamName")}
                        className={inputClasses}
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="sr-only">
                        Experience level
                      </label>
                      <select
                        id="experience"
                        value={form.experience}
                        onChange={update("experience")}
                        className={inputClasses + " appearance-none"}
                      >
                        {EXPERIENCE_LEVELS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <AnimatePresence>
                      {(status === "error" || status === "duplicate") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 text-sm overflow-hidden"
                          style={{ color: status === "duplicate" ? "var(--cyan)" : "#f87171" }}
                        >
                          {status === "duplicate" ? (
                            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{errorMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={status !== "loading" ? { y: -2, scale: 1.01 } : undefined}
                      whileTap={status !== "loading" ? { scale: 0.97 } : undefined}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="btn-primary chip mt-1.5 px-8 py-3.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Registering…
                        </>
                      ) : (
                        <>
                          Register Now <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    <span className="text-[12px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                      No spam — just fest logistics.
                    </span>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
