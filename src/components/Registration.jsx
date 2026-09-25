import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldAlert,
  User,
  Users,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { fadeUp, viewportReveal } from "../lib/motionVariants";
import {
  registerIndividual,
  createTeam,
  joinTeam,
  upgradeToTeamLeader,
  upgradeJoinTeam,
  checkEmailExists,
  isSupabaseConfigured,
} from "../lib/supabaseClient";
import { EVENT_INFO, VERTICALS } from "../data/siteData";

const EXPERIENCE_LEVELS = [
  { value: "", label: "Experience level (optional)" },
  { value: "new", label: "New to quantum computing" },
  { value: "some-qiskit", label: "Some Qiskit experience" },
  { value: "comfortable", label: "Comfortable with quantum algorithms" },
];

const MODES = [
  { id: "individual", label: "Individual", icon: User, blurb: "Register solo — perfect for Qiskit Quest." },
  { id: "create", label: "Create a Team", icon: Users, blurb: "Become the leader, get an invite code to share." },
  { id: "join", label: "Join a Team", icon: UserPlus, blurb: "Already have an invite code? Enter it here." },
];

const inputClasses =
  "w-full px-4 py-3 text-sm rounded-lg outline-none transition-colors duration-200 " +
  "bg-white dark:bg-white/[0.04] " +
  "text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "border border-black/10 dark:border-white/10 " +
  "focus:border-cyan-500 dark:focus:border-cyan-400 " +
  "focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20";

function readInviteCodeFromUrl() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("join")?.trim().toUpperCase() || "";
}

export default function Registration() {
  const [mode, setMode] = useState("individual");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    teamName: "",
    track: "",
    inviteCode: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | duplicate
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null); // holds the RPC's returned row on success
  const [copied, setCopied] = useState(false);

  // If someone arrives via a teammate's shared invite link
  // (…/#register?join=ABC123), jump straight into the Join tab, prefilled.
  useEffect(() => {
    const code = readInviteCodeFromUrl();
    if (code) {
      setMode("join");
      setForm((f) => ({ ...f, inviteCode: code }));
    }
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (id) => {
    setMode(id);
    setStatus("idle");
    setErrorMsg("");
  };

  // Leaders copy the bare invite code, not a link — a link invites
  // "what's this URL?" confusion; the code is what they'll actually
  // read out or paste into the "Join a Team" tab.
  const copyInvite = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) —
      // the code is still shown on screen for a manual copy either way.
    }
  };

  // Lets someone register the next person (a teammate, or the next
  // walk-in at a shared laptop) without reloading the page. Clears
  // the form and result but leaves the currently selected mode as-is,
  // since the next person is often doing the same kind of signup.
  const resetForm = () => {
    setForm((f) => ({
      ...f,
      fullName: "",
      email: "",
      phone: "",
      experience: "",
      teamName: "",
      track: "",
      inviteCode: "",
    }));
    setStatus("idle");
    setErrorMsg("");
    setResult(null);
    setCopied(false);
  };

  const friendlyError = (reason, fallback) => {
    switch (reason) {
      case "duplicate-email":
        return `${form.email.trim()} is already registered — check your inbox for your confirmation.`;
      case "team-name-taken":
        return "That team name is already taken — try another one.";
      case "team-full":
        return "That team already has 4 members — ask the leader to double-check the code.";
      case "invite-not-found":
        return "We couldn't find a team for that invite code — double-check it with your team leader.";
      case "invalid-track":
        return "That's not a valid track — please pick one from the list or leave it unset.";
      case "not-registered":
        return "We couldn't find a registration for that email — double-check it, or register as an individual first.";
      case "already-on-team":
        return `${form.email.trim()} is already part of a team — if that's wrong, contact the organizers.`;
      default:
        return fallback;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) return;
    if (mode === "create" && !form.teamName.trim()) return;
    if (mode === "join" && !form.inviteCode.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    // Fast pre-submit check so a returning visitor gets an instant,
    // friendly response instead of only finding out after the insert
    // bounces off the database's unique constraint. Registering fresh
    // as an "Individual" with an email that's already in use is still
    // a hard block. But for Create/Join, an already-registered email
    // isn't an error — it's exactly the "I registered solo, now I
    // found a team" case, so route it through the upgrade RPCs, which
    // reuse the existing profile instead of trying to insert a new one.
    const alreadyRegistered = await checkEmailExists(form.email);
    if (mode === "individual" && alreadyRegistered) {
      setStatus("duplicate");
      setErrorMsg(friendlyError("duplicate-email"));
      return;
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      experience: form.experience,
    };

    let response;
    if (mode === "individual") {
      response = await registerIndividual(payload);
    } else if (mode === "create") {
      response = alreadyRegistered
        ? await upgradeToTeamLeader({ email: form.email, teamName: form.teamName, track: form.track })
        : await createTeam({ ...payload, teamName: form.teamName, track: form.track });
    } else {
      response = alreadyRegistered
        ? await upgradeJoinTeam({ email: form.email, inviteCode: form.inviteCode })
        : await joinTeam({ ...payload, inviteCode: form.inviteCode });
    }

    const { data, error, reason } = response;

    if (reason === "duplicate-email") {
      setStatus("duplicate");
      setErrorMsg(friendlyError(reason));
      return;
    }

    if (error) {
      setStatus("error");
      setErrorMsg(
        isSupabaseConfigured
          ? friendlyError(reason, "Something went wrong — please try again in a moment.")
          : "Registration isn't connected yet (missing Supabase environment variables)."
      );
      return;
    }

    setResult(data);
    setStatus("success");
  };

  const activeMode = MODES.find((m) => m.id === mode);

  return (
    <section
      id="register"
      className="relative lg:min-h-[100dvh] flex flex-col justify-center py-10 md:py-24 lg:py-32 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 w-full">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportReveal}>
          <div
            className="surface-card chip relative p-6 sm:p-8 md:p-14 grid lg:grid-cols-[1.1fr,0.9fr] gap-8 lg:gap-14 items-start overflow-hidden"
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
                Free to attend, open to all students — no prior quantum computing experience
                required. Teams of {EVENT_INFO.teamSize} for the hackathon, or go solo with Qiskit
                Quest.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>5</div>
                  <div className="text-[12px] mt-1" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>hackathon days</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{EVENT_INFO.teamSize}</div>
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
              {/* Mode switcher: Individual / Create a Team / Join a Team */}
              {status !== "success" && (
                <div
                  className="flex gap-1.5 p-1 mb-5 rounded-xl border"
                  style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--surface) 60%, transparent)" }}
                >
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const isActive = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => switchMode(m.id)}
                        className="relative flex-1 flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg text-[11px] font-medium transition-colors duration-200"
                        style={{
                          color: isActive ? "var(--bg)" : "var(--text-mid)",
                          background: isActive ? "var(--blue)" : "transparent",
                        }}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.8} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}

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

                    {mode === "individual" && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                        We've saved your spot for {EVENT_INFO.dateRangeShort}. Details land in your
                        inbox at {form.email} closer to the date.
                      </p>
                    )}

                    {mode === "create" && result && (
                      <>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                          Team <strong>{result.team_name}</strong> is created — you're the leader.
                          Share this invite code with up to 3 teammates so they can join.
                        </p>
                        <div
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border"
                          style={{ borderColor: "var(--line-bright)", background: "color-mix(in srgb, var(--cyan) 6%, transparent)" }}
                        >
                          <span
                            className="text-lg font-semibold tracking-[0.2em]"
                            style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)" }}
                          >
                            {result.invite_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyInvite(result.invite_code)}
                            className="btn-ghost chip-sm px-3 py-1.5 text-[12px] inline-flex items-center gap-1.5 flex-shrink-0"
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied" : "Copy code"}
                          </button>
                        </div>
                        <span className="text-[12px]" style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                          Share this code — teammates enter it under "Join a Team".
                        </span>
                      </>
                    )}

                    {mode === "join" && result && (
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-mid)" }}>
                        You've joined <strong>{result.team_name}</strong> ({result.member_count}/4
                        members). Details land in your inbox at {form.email} closer to the date.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-ghost chip-sm mt-2 px-4 py-2 text-[12px] inline-flex items-center gap-1.5"
                    >
                      Register another
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key={mode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3.5"
                    noValidate
                  >
                    <p className="text-[13px] -mt-1 mb-0.5" style={{ color: "var(--text-dim)" }}>
                      {activeMode.blurb}
                    </p>

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

                    {mode === "create" && (
                      <>
                        <div>
                          <label htmlFor="teamName" className="sr-only">
                            Team name
                          </label>
                          <input
                            id="teamName"
                            type="text"
                            required
                            placeholder="Team name"
                            value={form.teamName}
                            onChange={update("teamName")}
                            className={inputClasses}
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label htmlFor="track" className="sr-only">
                            Track
                          </label>
                          <select
                            id="track"
                            value={form.track}
                            onChange={update("track")}
                            className={inputClasses + " appearance-none"}
                          >
                            <option value="">Track (optional — can decide later)</option>
                            {VERTICALS.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {mode === "join" && (
                      <div>
                        <label htmlFor="inviteCode" className="sr-only">
                          Invite code
                        </label>
                        <input
                          id="inviteCode"
                          type="text"
                          required
                          placeholder="Invite code (e.g. A1B2C3)"
                          value={form.inviteCode}
                          onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value.toUpperCase() }))}
                          className={inputClasses + " uppercase tracking-[0.15em]"}
                          autoComplete="off"
                        />
                      </div>
                    )}

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
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {mode === "create" ? "Creating team…" : mode === "join" ? "Joining…" : "Registering…"}
                        </>
                      ) : (
                        <>
                          {mode === "create" ? "Create Team" : mode === "join" ? "Join Team" : "Register Now"}
                          <ArrowRight className="w-4 h-4" />
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
