import { useEffect, useRef } from "react";

/**
 * useMagneticCursor
 *
 * Attaches a subtle "magnetic" pull to whatever element the returned ref
 * is placed on: as the pointer nears the element it eases toward the
 * cursor, and springs back once the pointer moves away.
 *
 * Fix vs. the previous version: the pull used to be a flat `strength`
 * multiplier applied all the way out to `radius`, so near the edge of
 * the capture zone the translation could still be large — elements
 * would detach far from their original position and overlap their
 * neighbors. This version:
 *   1. Applies an ease-out falloff (pull strength fades to 0 at the
 *      radius edge instead of cutting off abruptly), and
 *   2. Clamps the maximum translation to `maxPull` pixels, so no
 *      element can ever wander further than that from its resting spot
 *      — keeping every magnetic element safely within its own bounds.
 *
 * The element's transform is driven via a `--mx`/`--my` CSS custom
 * property (see `.magnetic-hover` / `[data-magnetic]` in index.css)
 * rather than writing `style.transform` directly, so CSS-driven hover/
 * active states (lift, scale) can layer on top without fighting this
 * hook for control of the `transform` property.
 *
 * @param {number} strength - 0..1, how strongly the element follows the pointer.
 * @param {number} radiusMultiplier - how far out (relative to element size) the pull starts.
 * @param {number} maxPull - hard cap, in pixels, on how far the element may translate.
 * @returns {React.RefObject} attach to the DOM node you want to be magnetic.
 */
export default function useMagneticCursor(strength = 0.35, radiusMultiplier = 0.9, maxPull = 18) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFinePointer || reducedMotion) return;

    let frame = null;

    const setPull = (x, y) => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const handleMove = (e) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const relX = e.clientX - centerX;
        const relY = e.clientY - centerY;
        const distance = Math.hypot(relX, relY);
        const radius = Math.max(rect.width, rect.height) * radiusMultiplier;

        if (distance >= radius || distance === 0) {
          setPull(0, 0);
          return;
        }

        // Ease-out falloff: pull is strongest at the element's center and
        // fades smoothly to zero at the radius edge, instead of a hard cutoff.
        const proximity = 1 - distance / radius; // 0..1
        const falloff = proximity * proximity; // ease-out
        const pullX = relX * strength * falloff;
        const pullY = relY * strength * falloff;

        // Hard clamp so the element can never drift further than maxPull,
        // regardless of how large or fast the pointer movement is.
        const pullDistance = Math.hypot(pullX, pullY);
        if (pullDistance > maxPull) {
          const scale = maxPull / pullDistance;
          setPull(pullX * scale, pullY * scale);
        } else {
          setPull(pullX, pullY);
        }
      });
    };

    const reset = () => setPull(0, 0);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseleave", reset);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", reset);
      if (frame) cancelAnimationFrame(frame);
      reset();
    };
  }, [strength, radiusMultiplier, maxPull]);

  return ref;
}
