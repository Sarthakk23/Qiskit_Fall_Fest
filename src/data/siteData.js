import { BrainCircuit, FlaskConical, Boxes, Sparkles } from "lucide-react";

export const REGISTER_FORM_URL = "https://forms.gle/replace-with-your-form-link";

// Single source of truth for the fest's dates, organizers, and format —
// pulled into Hero, Footer, and Registration so the logistics never
// drift out of sync across the page.
export const EVENT_INFO = {
  title: "Qiskit Fall Fest 2026",
  dateStart: "Oct 9",
  dateEnd: "Oct 16",
  dateRange: "October 9 – October 16",
  dateRangeShort: "Oct 9 – 16, 2026",
  organizers: ["Quantica", "CQT", "IBM"],
  organizersLine: "Quantica, CQT, and IBM",
  venue: "IIIT-Delhi Campus + Online",
  subheadline:
    "A week-long hybrid quantum festival featuring a 5-day hackathon, expert industry sessions, and researcher poster presentations.",
};

export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Verticals" },
  { id: "schedule", label: "Schedule" },
  { id: "speakers", label: "Speakers" },
  { id: "faq", label: "FAQ" },
];

// The four hackathon verticals teams choose from during the 5-day build.
export const VERTICALS = [
  {
    id: "qml",
    icon: BrainCircuit,
    title: "Quantum Machine Learning",
    tagline: "QML",
    desc: "Variational classifiers, quantum kernels, and hybrid quantum-classical models — build learning systems that lean on Hilbert space instead of just floating point.",
    big: true,
  },
  {
    id: "chemistry",
    icon: FlaskConical,
    title: "Quantum Chemistry",
    tagline: "Simulation",
    desc: "Molecular ground-state estimation with VQE and beyond — model the systems classical chemistry solvers can't touch.",
  },
  {
    id: "simulations",
    icon: Boxes,
    title: "Quantum Simulations",
    tagline: "Dynamics",
    desc: "Simulate physical systems — spin chains, lattice models, quantum walks — directly on quantum circuits.",
  },
  {
    id: "wildcard",
    icon: Sparkles,
    title: "Wildcard / Open Innovation",
    tagline: "Anything goes",
    desc: "Optimization, cryptography, finance, generative art — if you can frame it as a quantum problem, bring it to the table.",
  },
];

// Full 8-day event arc: an offline opening day, six days of online
// hacking + daily faculty-led sessions, and an offline finale.
export const SCHEDULE = [
  {
    day: "Day 1",
    date: "Oct 9",
    mode: "Offline",
    location: "IIIT-Delhi Campus",
    title: "Opening Kickoff & Poster Day",
    detail:
      "The fest opens with a keynote from a special guest industry expert at IBM, followed by an offline poster presentation session where academic researchers showcase ongoing quantum work to the community.",
  },
  {
    day: "Day 2",
    date: "Oct 10",
    mode: "Online",
    location: "Virtual",
    title: "Hack Begins: Quantum Machine Learning",
    detail:
      "The 5-day hacking period opens. Faculty and researchers at IIIT-Delhi release the first online session, walking through the Quantum Machine Learning vertical — tools, scope, and technical execution.",
  },
  {
    day: "Day 3",
    date: "Oct 11",
    mode: "Online",
    location: "Virtual",
    title: "Vertical Deep-Dive: Quantum Chemistry",
    detail:
      "A dedicated session on the Quantum Chemistry vertical, covering molecular simulation techniques and the Qiskit tooling teams will use to build on the theme.",
  },
  {
    day: "Day 4",
    date: "Oct 12",
    mode: "Online",
    location: "Virtual",
    title: "Vertical Deep-Dive: Quantum Simulations",
    detail:
      "Faculty walk through the Quantum Simulations vertical — modeling physical systems on circuits — with worked examples teams can extend for their own projects.",
  },
  {
    day: "Day 5",
    date: "Oct 13",
    mode: "Online",
    location: "Virtual",
    title: "Vertical Deep-Dive: Wildcard / Open Innovation",
    detail:
      "A session on framing open problems — optimization, finance, cryptography, generative work — as quantum circuits, for teams building in the Wildcard vertical.",
  },
  {
    day: "Day 6",
    date: "Oct 14",
    mode: "Online",
    location: "Virtual",
    title: "Tooling & Hardware Execution",
    detail:
      "A technical session on the Qiskit Runtime, primitives, and submitting jobs to real IBM Quantum hardware — the execution layer every vertical eventually needs.",
  },
  {
    day: "Day 7",
    date: "Oct 15",
    mode: "Online",
    location: "Virtual",
    title: "Build Day & Mentor Office Hours",
    detail:
      "The final push of the hacking period. Mentors from IIIT-Delhi, Quantica, and IBM hold open office hours as teams finish their projects ahead of the finale.",
  },
  {
    day: "Day 8",
    date: "Oct 16",
    mode: "Offline",
    location: "IIIT-Delhi Campus",
    title: "Grand Finale",
    detail:
      "Teams return to campus for offline hackathon presentations and project showcases, live judging across all four verticals, and the closing prize distribution.",
  },
];

export const SPEAKERS = [
  { role: "IBM Quantum Researcher", org: "IBM Quantum", focus: "Error correction & fault tolerance", initials: "IQ" },
  { role: "IBM Qiskit Advocate", org: "IBM Quantum", focus: "Open-source Qiskit tooling", initials: "QA" },
  { role: "IBM Systems Engineer", org: "IBM Quantum", focus: "Hardware access & job orchestration", initials: "SE" },
  { role: "Faculty Mentor", org: "CQT, IIIT-Delhi", focus: "Quantum information theory", initials: "FM" },
];

export const FAQS = [
  {
    q: "What is Qiskit Fall Fest?",
    a: "A global series of student-organized quantum computing events supported by IBM Quantum. This edition is hosted by Quantica and CQT at IIIT-Delhi, in partnership with IBM, running October 9–16.",
  },
  {
    q: "Is the fest online or offline?",
    a: "Both. Day 1 (opening + poster session) and the Day 8 grand finale are offline on the IIIT-Delhi campus. The 5-day hacking period in between runs online, with daily faculty-led sessions.",
  },
  {
    q: "Do I need prior quantum computing knowledge?",
    a: "No. Every participant gets a custom, curated Jupyter Notebook template that builds up foundational quantum computing concepts from scratch, before you touch the hackathon verticals.",
  },
  {
    q: "Who can participate?",
    a: "The fest is built for absolute beginners and advanced academic researchers alike — curiosity about quantum computing is the only prerequisite.",
  },
  {
    q: "What are the hackathon verticals?",
    a: "Quantum Machine Learning, Quantum Chemistry, Quantum Simulations, and a Wildcard / Open Innovation track for anything else you can frame as a quantum problem.",
  },
  {
    q: "Will I get access to real IBM quantum hardware?",
    a: "Yes. During the hacking period, teams can submit jobs to an actual IBM quantum processor as part of the tooling and execution session.",
  },
  {
    q: "Is there a registration fee?",
    a: "No, the fest is completely free to attend.",
  },
  {
    q: "Will certificates be provided?",
    a: "Yes, all participants who complete the fest receive a certificate co-signed by Quantica, CQT, and IBM.",
  },
];
