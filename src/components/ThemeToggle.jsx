import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9, rotate: -20 }}
      className={
        "relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden " +
        "border border-black/10 dark:border-white/15 " +
        "bg-white/60 dark:bg-white/5 backdrop-blur-sm " +
        "text-slate-700 dark:text-slate-200 " +
        "transition-colors duration-300 hover:border-cyan-400/60 " +
        className
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ y: 12, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.6} style={{ color: "var(--cyan)" }} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: 12, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.6} style={{ color: "#f5a524" }} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
