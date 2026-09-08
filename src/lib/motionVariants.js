// Shared Framer Motion variants so every section reveals with the
// same easing/timing language instead of ad-hoc numbers per component.

export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

// Re-triggerable scroll reveal: elements fade/slide back out of view
// and animate in again every time they cross the viewport threshold,
// in either scroll direction — not just once on first appearance.
export const viewportReveal = { once: false, amount: 0.2 };
