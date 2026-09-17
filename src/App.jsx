import { useCallback } from "react";
import CustomCursor from "./components/CustomCursor";
import QuantumBackground from "./components/QuantumBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Speakers from "./components/Speakers";
import Schedule from "./components/Schedule";
import Faq from "./components/Faq";
import Registration from "./components/Registration";
import Footer from "./components/Footer";
import { ThemeProvider } from "./lib/ThemeContext";

export default function App() {
  // Every "Register Now" button across the site — Navbar, Hero, Footer —
  // shares this single handler, so the CTA always does one thing:
  // smooth-scroll down to the live, Supabase-backed form in
  // <Registration/>. (This used to open a stale Google Form link that
  // had nothing to do with the actual registration flow.)
  const handleRegister = useCallback(() => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <ThemeProvider>
      <CustomCursor />
      {/* Global quantum-themed backdrop — sits behind every section and
          coexists with the hero's own Bloch sphere, then continues on
          as the page-wide background all the way to the footer. */}
      <QuantumBackground />
      <Navbar onRegister={handleRegister} />
      <Hero onRegister={handleRegister} />
      <About />
      <Skills />
      {/* Speakers before Schedule: build credibility/excitement about
          who's involved before asking visitors to commit to the
          day-by-day logistics — see the note in the chat for the full
          user-flow rationale. */}
      <Speakers />
      <Schedule />
      {/* FAQ right before the ask: resolve last-minute doubts
          immediately before the registration form, instead of after it
          where a hesitant visitor would have to scroll back up. */}
      <Faq />
      <Registration />
      <Footer onRegister={handleRegister} />
    </ThemeProvider>
  );
}
