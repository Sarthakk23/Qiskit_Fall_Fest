import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
import SplashScreen from "./components/SplashScreen";
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

  // One-time entry splash. Locks page scroll while it's up so visitors
  // can't scroll the (already-mounted) site underneath before the fade
  // finishes. <SplashScreen> itself only decides *when* the hold ends
  // (onHoldComplete); actually removing it from the tree happens here,
  // through <AnimatePresence>, so its `exit` variant (scale up, backdrop
  // blur relaxing to zero, opacity to zero) gets to play out instead of
  // the component just disappearing.
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.body.style.overflow = showSplash ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSplash]);

  return (
    <ThemeProvider>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onHoldComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
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
