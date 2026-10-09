import { FlaskConical, TrendingUp, Waves } from "lucide-react";

// Single source of truth for the fest's dates, organizers, and format —
// pulled into Hero, Footer, and Registration so the logistics never
// drift out of sync across the page. Facts below are taken directly
// from the official Qiskit Fall Fest 2026 proposal.
export const EVENT_INFO = {
  title: "Qiskit Fall Fest 2026",
  theme: "A decade of quantum on the cloud",
  dateStart: "Oct 9",
  dateEnd: "Oct 16",
  dateRange: "October 9 – October 16",
  dateRangeShort: "Oct 9 – 16, 2026",
  organizers: ["Quantica", "CQT", "IBM"],
  organizersLine: "Quantica, CQT, and IBM",
  venue: "IIIT-Delhi Campus + Online",
  participants: "60–70",
  teamSize: "2–4",
  prizePool: "₹35,000",
  subheadline:
    "A week-long hybrid quantum festival: online Oct 9–15 with an intro seminar and a 5-day hackathon, then an in-person finale on Oct 16 with research poster presentations, finalist presentations, and awards.",
};

// Prize structure from the proposal's budget: three track winners plus
// best poster = ₹35,000. A people's-choice prize is also planned for the
// poster session (amount not specified in the proposal).
export const PRIZES = [
  { label: "Track winner", sub: "Quantum Chemistry", amount: "₹10,000" },
  { label: "Track winner", sub: "Quantum Optimization", amount: "₹10,000" },
  { label: "Track winner", sub: "Quantum Simulation", amount: "₹10,000" },
  { label: "Best Poster", sub: "Research poster session", amount: "₹5,000" },
];

// Participant perks surfaced in About and the schedule.
export const PERKS = {
  refreshments: "Snacks and refreshments at the Oct 9 seminar and the Oct 16 grand finale.",
  goodies: "Goodies for participants, handed out across the fest.",
  certificates: "Everyone who completes a set Qiskit Quest path earns a certificate.",
};

// External destinations used in more than one place.
export const LINKS = {
  quantica: "https://quanticaw.vercel.app/",
  discord: "https://discord.gg/28X9nTNEw",
  teamForm: "https://forms.gle/XA3q4gd81WRTVtxr5",
};

// Registrations are closed. The site now serves registered participants.
export const REGISTRATION_CLOSED_MESSAGE =
  "Registrations are now closed. Thank you for the overwhelming response!";

// Team matching form deadline: Saturday 10 Oct 2026, 12:00 noon IST.
// <Participants/> swaps the form link for a "closed" message after this.
export const TEAM_FORM_DEADLINE = "2026-10-10T12:00:00+05:30";
export const TEAM_FORM_DEADLINE_LABEL = "Saturday, 10 Oct, 12:00 noon IST";

// Shown at the bottom of the "For Participants" section. Update it
// whenever that section changes.
export const PARTICIPANTS_LAST_UPDATED = "9 October 2026";

// Contact email is not confirmed yet. Keep the placeholder visible until
// the official address is supplied.
// TODO: replace with the official Quantica email.
export const CONTACT_EMAIL_PLACEHOLDER = "quantica@iiitd.ac.in";

// Venue for the 16 Oct finale is not confirmed yet.
// TODO: replace with the venue once announced.
export const FINALE_VENUE_PLACEHOLDER = "[TO BE ANNOUNCED]";
  
export const ORGANISED_BY =
  "Organised by Quantica IIITD, the Quantum Computing Society of IIIT Delhi, and the student body of CQT.";

// Compact schedule for registered participants (all times IST).
export const PARTICIPANT_SCHEDULE = [
  {
    date: "Fri, 9 Oct",
    time: "2:00 – 4:00 PM",
    mode: "Online",
    title: "Quantum and Qiskit 101 Seminar and hackathon briefing",
  },
  {
    date: "Sat, 10 Oct",
    time: "10:00 AM",
    mode: "Online",
    title: "Hackathon kickoff, challenges and tutorials released",
  },
  {
    date: "11 – 14 Oct",
    time: "Submissions close at midnight on 14 Oct",
    mode: "Online",
    title: "Hackathon and Qiskit Quest continue",
  },
  {
    date: "Thu, 15 Oct",
    time: "",
    mode: "",
    title: "Judging and selection of finalists",
  },
  {
    date: "Fri, 16 Oct",
    time: "2:00 – 6:00 PM",
    mode: "In person at IIIT Delhi",
    title: "Research poster session, finalist presentations and awards",
    venue: true,
  },
];

export const GETTING_STARTED = [
  "Join the Discord server",
  "Create a free IBM Quantum account to run programs on real quantum hardware",
  "Keep a laptop with a stable internet connection ready",
  "Form a team of 2 to 4 (or work solo in Qiskit Quest)",
];

export const NAV_LINKS = [
  { id: "participants", label: "For Participants" },
  { id: "about", label: "About" },
  { id: "skills", label: "Tracks" },
  { id: "speakers", label: "Speakers" },
  { id: "schedule", label: "Schedule" },
  { id: "faq", label: "FAQ" },
];

// The three hackathon tracks teams choose from. Each opens with a
// ready-made tutorial, then a challenge at three difficulty levels, so
// beginners and advanced students can both compete in the same track.
export const VERTICALS = [
  {
    id: "chemistry",
    icon: FlaskConical,
    title: "Quantum Chemistry",
    tagline: "From Bonds to Qubits",
    desc: "Compute how a molecule's energy changes as its bond stretches — then do it again using fewer quantum resources.",
  },
  {
    id: "optimization",
    icon: TrendingUp,
    title: "Quantum Optimization",
    tagline: "Smarter Choices at Scale",
    desc: "Choose the best set of stocks with a quantum optimization algorithm, then scale the problem up.",
  },
  {
    id: "simulation",
    icon: Waves,
    title: "Quantum Simulation",
    tagline: "Dynamics Under Noise",
    desc: "Simulate how a chain of tiny magnets evolves over time, then correct for noise on real hardware.",
  },
];

// The beginner-friendly, non-competitive path that runs alongside the
// hackathon all week, for students who'd rather work solo than in a team.
export const QISKIT_QUEST = {
  title: "Qiskit Quest",
  desc: "Prefer to go solo? Work through IBM's self-paced, auto-graded modules at your own speed, all week. Everyone who completes a set path earns a certificate — no team, no competition, no prize, no pressure.",
};

// Full 8-day event arc, taken directly from the proposal's programme
// table: an online opening seminar, an online hackathon window, a
// judges-only day, and an in-person finale.
export const SCHEDULE = [
  {
    day: "Day 1",
    date: "Oct 9",
    mode: "Online",
    location: "2:00 – 4:00 PM",
    title: "Quantum & Qiskit 101 Seminar",
    detail:
      "A hands-on intro to Qiskit, including a run on a real IBM quantum computer, led by Prof. Bhavna Bose — followed by the hackathon briefing for all three tracks. Refreshments are provided.",
  },
  {
    day: "Day 2",
    date: "Oct 10",
    mode: "Online",
    location: "10:00 AM kickoff",
    title: "Hackathon Starts",
    detail:
      "Challenges are released across all three tracks (Quantum Chemistry, Quantum Optimization, Quantum Simulation), along with the tutorials each track builds on.",
  },
  {
    day: "Day 3",
    date: "Oct 11",
    mode: "Online",
    location: "Virtual",
    title: "Hackathon + Qiskit Quest",
    detail:
      "Teams build on their chosen track; solo participants work through Qiskit Quest's self-paced modules at their own pace.",
  },
  {
    day: "Day 4",
    date: "Oct 12",
    mode: "Online",
    location: "Virtual",
    title: "Hackathon + Qiskit Quest",
    detail:
      "Teams build on their chosen track; solo participants work through Qiskit Quest's self-paced modules at their own pace. Poster abstracts are due today (Mon, Oct 12) for the Oct 16 session.",
  },
  {
    day: "Day 5",
    date: "Oct 13",
    mode: "Online",
    location: "Virtual",
    title: "Hackathon + Qiskit Quest",
    detail:
      "Teams build on their chosen track; solo participants work through Qiskit Quest's self-paced modules at their own pace.",
  },
  {
    day: "Day 6",
    date: "Oct 14",
    mode: "Online",
    location: "Virtual",
    title: "Final Build Day — Submissions Due",
    detail:
      "The last day of building. Hackathon submissions close at midnight — get your write-up and notebook in before the deadline.",
  },
  {
    day: "Day 7",
    date: "Oct 15",
    mode: "Online",
    location: "Judges only",
    title: "Judging",
    detail:
      "Faculty judges score every submission against a single 100-point rubric — technical depth, validation, hardware awareness, analysis, and presentation — and pick the top 3 teams per track to present live.",
  },
  {
    day: "Day 8",
    date: "Oct 16",
    mode: "Offline",
    location: "IIIT-Delhi, 2:00 – 6:00 PM",
    title: "Grand Finale",
    detail:
      "Research poster session open to any student or researcher with quantum or quantum-adjacent work, live presentations from the top 3 teams in each track, and the closing awards — including the ₹35,000 prize pool. Refreshments are provided. Venue: [TO BE ANNOUNCED].",
  },
];

// Speaker cards. An entry with a `name` renders as a full, featured
// card (session, mode, socials); entries without one render as the
// "Speaker to be announced" placeholders.
//
// Social hrefs that still contain "..." are treated as placeholders by
// <Speakers/>: the icon shows dimmed and isn't clickable. Replace the
// URL with the real profile and it goes live automatically.
export const SPEAKERS = [
  {
    name: "Prof. Bhavna Bose",
    fullName: "Bhavna Bose Gupta",
    initials: "BB",
    role: "Assistant Professor, Dept. of Information Technology",
    org: "SVKM's NMIMS MPSTME, Mumbai",
    community: "Faculty Coordinator, MPSTME Quantumania",
    mode: "Virtual",
    modeNote: "Qiskit 101 Seminar & Hackathon Briefing",
    sessionDate: "October 9",
    session: "Qiskit 101 Seminar & Hackathon Briefing",
    researchFocus:
      "Ph.D. Researcher in Quantum Computing — Quantum Machine Learning (QML), NISQ hardware noise effects, and post-quantum cryptography.",
    summary:
      "Ph.D. researcher in Quantum Computing working across Quantum Machine Learning, NISQ-era hardware noise, and post-quantum cryptography — bringing both deep research and hands-on Qiskit fluency to the fest's opening keynote.",
    topics: ["Quantum Machine Learning", "NISQ Hardware Noise", "Post-Quantum Cryptography", "Qiskit SDK"],
    badges: [
      "IBM Qiskit Advocate (Advanced)",
      "Certified IBM Developer — Quantum Computing",
      "MoE Innovation Ambassador",
      "Life Member ISTE · CSI & IEEE Member",
    ],
    photo: "bhavna-bose",
    socials: [
      { type: "linkedin", label: "Prof. Bhavna Bose on LinkedIn", href: "https://linkedin.com/in/..." },
      { type: "x", label: "Prof. Bhavna Bose on X", href: "https://x.com/..." },
    ],
  },
  { role: "IBM Quantum Researcher", org: "IBM Quantum", focus: "Error correction & fault tolerance", initials: "IQ" },
  { role: "IBM Qiskit Advocate", org: "IBM Quantum", focus: "Open-source Qiskit tooling", initials: "QA" },
  { role: "IBM Systems Engineer", org: "IBM Quantum", focus: "Hardware access & job orchestration", initials: "SE" },
  { role: "Faculty Mentor", org: "CQT, IIIT-Delhi", focus: "Quantum information theory", initials: "FM" },
];

export const FAQS = [
  {
    q: "Is it free?",
    a: "Yes. All tools are free, and IBM provides free access to real quantum hardware.",
  },
  {
    q: "Do I need quantum experience?",
    a: "No. Each hackathon track opens with a ready-made tutorial, and Qiskit Quest's self-paced modules build up the basics.",
  },
  {
    q: "What if I did not get the emails?",
    a: "Check your spam folder first, then message us on Discord.",
  },
  {
    q: "How do I change my registered email?",
    a: "Message us on Discord or reply to the email.",
  },
  {
    // TODO: confirm the certificate policy for hackathon participation
    // (not just Qiskit Quest) before adding anything about it here.
    q: "Will I get a certificate?",
    a: "Yes, for completing the Qiskit Quest path.",
  },
  {
    q: "What is Qiskit Fall Fest?",
    a: "IBM's annual worldwide series of student-run quantum events. This edition's theme is \"A decade of quantum on the cloud.\"",
  },
  {
    q: "Is the fest online or offline?",
    a: "Both. Oct 9–15 runs online: the opening seminar, the hackathon window, and judging. The Oct 16 finale (poster session, finalist presentations, and awards) is in person at IIIT Delhi, 2–6 PM. Joining links for online sessions are shared on Discord and by email.",
  },
  {
    q: "What are the hackathon tracks?",
    a: "Quantum Chemistry, Quantum Optimization, and Quantum Simulation. Each track has a tutorial to start and a challenge with three difficulty levels, so beginners and advanced students can both take part.",
  },
  {
    q: "What team size can I have?",
    a: "Teams of 2 to 4 for the hackathon. You can also work solo in Qiskit Quest, which does not need a team.",
  },
  {
    q: "Will I get access to real IBM quantum hardware?",
    a: "Yes. The Oct 9 seminar includes a run on a real IBM quantum computer, and the Quantum Simulation track's challenge involves correcting for noise on real hardware.",
  },
  {
    q: "How is the hackathon judged?",
    a: "Faculty judges score every submission on one 100-point rubric covering technical depth, validation, hardware awareness, analysis, and presentation. The top 3 teams per track present live at the Oct 16 finale.",
  },
  {
    q: "Is there a poster session?",
    a: "Yes. It is open to any student or researcher at the university with quantum work to show. Abstracts were due Monday, Oct 12. Posters are presented on Oct 16, with a judged prize and a people's choice prize.",
  },
  {
    q: "Are there prizes?",
    a: "Yes. The total prize pool is ₹35,000: ₹10,000 for the winner of each of the three hackathon tracks and ₹5,000 for the best poster. The poster session also has a people's choice prize. Qiskit Quest is non-competitive and has no prize.",
  },
  {
    q: "Will there be refreshments and goodies?",
    a: "Yes. Snacks and refreshments are provided at the Oct 9 seminar and the Oct 16 finale, and participants receive goodies as part of the fest.",
  },
];
