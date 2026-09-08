import { useCallback } from "react";
import CustomCursor from "./components/CustomCursor";
import QuantumBackground from "./components/QuantumBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Schedule from "./components/Schedule";
import Speakers from "./components/Speakers";
import Registration from "./components/Registration";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import { ThemeProvider } from "./lib/ThemeContext";
import { REGISTER_FORM_URL } from "./data/siteData";

export default function App() {
  const handleRegister = useCallback(() => {
    window.open(REGISTER_FORM_URL, "_blank", "noopener,noreferrer");
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
      <Schedule />
      <Speakers />
      <Registration />
      <Faq />
      <Footer onRegister={handleRegister} />
    </ThemeProvider>
  );
}
