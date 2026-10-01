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
  subheadline:
    "A week-long hybrid quantum festival: online Oct 9–15 with an intro seminar and a 5-day hackathon, then an in-person finale on Oct 16 with poster presentations and awards.",
};

// External destinations used in more than one place.
export const LINKS = {
  quantica: "https://quanticaw.vercel.app/",
};

export const NAV_LINKS = [
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
  desc: "Prefer to go solo? Work through IBM's self-paced, auto-graded modules at your own speed, all week. Complete a set path and earn a certificate — no team, no competition, no pressure.",
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
      "A hands-on intro to Qiskit, including a run on a real IBM quantum computer, led by Prof. Bhavna Bose — followed by the hackathon briefing for all three tracks.",
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
      "Teams build on their chosen track; solo participants work through Qiskit Quest's self-paced modules at their own pace.",
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
    location: "IIIT-Delhi Campus, 2:00 – 6:00 PM",
    title: "Grand Finale",
    detail:
      "Research poster session open to the wider student and researcher community, finalist presentations from all three tracks, and the closing awards.",
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
    q: "What is Qiskit Fall Fest?",
    a: "IBM's annual worldwide series of student-run quantum computing events, held every October and November. This edition's theme is \"A decade of quantum on the cloud,\" and it's open to any student — from first-years with no quantum background to researchers.",
  },
  {
    q: "Is the fest online or offline?",
    a: "Both. Oct 9–15 runs online: the opening seminar, the 5-day hackathon window, and a judges-only day. The Oct 16 grand finale — poster session, finalist presentations, and awards — is in person on campus, 2–6 PM.",
  },
  {
    q: "Do I need prior quantum computing knowledge?",
    a: "No. The fest is for absolute beginners and researchers alike. Each hackathon track opens with a ready-made tutorial, and if you'd rather not join a team, Qiskit Quest's self-paced, auto-graded modules build up the fundamentals at your own speed.",
  },
  {
    q: "Who can participate, and in what team size?",
    a: "Any student — beginner to researcher. We're planning for about 60–70 participants, in teams of 2 to 4 for the hackathon. If you'd rather work solo, Qiskit Quest doesn't require a team.",
  },
  {
    q: "What are the hackathon tracks?",
    a: "Quantum Chemistry, Quantum Optimization, and Quantum Simulation. Each track has a tutorial to start and a challenge with three difficulty levels, so beginners and advanced students can both take part in the same track.",
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
    a: "Yes — open to any student or researcher at the university with quantum work to show, not just hackathon participants. Abstracts are due Monday, Oct 5, and posters are presented Oct 16, with both a judged prize and a people's-choice prize.",
  },
  {
    q: "Is there a registration fee?",
    a: "No, the fest is completely free. All tools are free to use, and IBM provides free access to real quantum computers.",
  },
  {
    q: "Are there prizes?",
    a: "Yes — per-track hackathon winners, best poster, and people's choice. Prize amounts are still being finalized.",
  },
  {
    q: "Will certificates be provided?",
    a: "Everyone who completes a full Qiskit Quest path earns a certificate. There's no competition or prize for Qiskit Quest — it's purely for learning.",
  },
  {
    q: "Can I join or create a team if I already registered as an individual?",
    a: "Yes! If you initially registered as a solo participant but found teammates later, you can update your status. Simply log back into the portal to either join an existing team using their unique invite code or create a brand-new team of your own.",
  },
  {
    q: "What is the required team size?",
    a: "You can participate solo, or form a team of 2 to 4 members.",
  },
  {
    q: "How do I invite members to my team?",
    a: "When you choose \"Create a Team,\" the portal will generate a unique invite code. Share this code with your teammates so they can enter it under the \"Join a Team\" section during their own registration.",
  },
];
