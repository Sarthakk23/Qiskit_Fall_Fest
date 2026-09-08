import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion, useFinePointer } from "../hooks/useMediaQuery";

/**
 * Glowing dot + trailing ring cursor. The ring magnetically enlarges
 * over any element carrying `data-magnetic`. Disabled entirely on
 * touch devices and when the user prefers reduced motion.
 */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const [active, setActive] = useState(false);
  const [magnetic, setMagnetic] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 });
  const ringY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    document.body.classList.toggle("has-custom-cursor", enabled);
    if (!enabled) return;

    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const handleDown = () => setActive(true);
    const handleUp = () => setActive(false);
    const handleOver = (e) => setMagnetic(!!e.target.closest("[data-magnetic]"));

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("mouseover", handleOver);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("mouseover", handleOver);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className={`cursor-dot ${active ? "cursor-dot--active" : ""}`} style={{ x, y }} />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: magnetic ? 2.2 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </>
  );
}
