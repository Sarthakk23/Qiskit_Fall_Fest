import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CustomCursor from "./components/CustomCursor";
import QuantumBackground from "./components/QuantumBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Participants from "./components/Participants";
import About from "./components/About";
import Skills from "./components/Skills";
import Speakers from "./components/Speakers";
import Schedule from "./components/Schedule";
import Faq from "./components/Faq";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SplashScreen from "./components/SplashScreen";
import RegistrationClosed from "./components/RegistrationClosed";
import { ThemeProvider } from "./lib/ThemeContext";

// Registrations are closed. Any link that used to open the sign-up flow
// (/register, #register, or a teammate's old ?join=CODE invite) lands on
// a friendly "Registrations closed" page instead of the old form.
function isOldRegistrationUrl() {
  const { pathname, hash, search } = window.location;
  return (
    /^\/register(\/|$)/i.test(pathname) ||
    /^#register/i.test(hash) ||
    new URLSearchParams(search).has("join")
  );
}

export default function App() {
  const [closedPage, setClosedPage] = useState(isOldRegistrationUrl);

  useEffect(() => {
    const onChange = () => setClosedPage(isOldRegistrationUrl());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  // One-time entry splash. Locks page scroll while it's up so visitors
  // can't scroll the (already-mounted) site underneath before the fade
  // finishes. Skipped on the "Registrations closed" page.
  const [showSplash, setShowSplash] = useState(() => !isOldRegistrationUrl());

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
      <QuantumBackground />
      {closedPage ? (
        <RegistrationClosed />
      ) : (
        <>
          <Navbar />
          <Hero />
          {/* Information for registered participants sits right under the hero. */}
          <Participants />
          <About />
          <Skills />
          <Speakers />
          <Schedule />
          <Faq />
          <Contact />
          <Footer />
        </>
      )}
    </ThemeProvider>
  );
}
