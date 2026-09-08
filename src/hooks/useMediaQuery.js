import { useEffect, useState } from "react";

function useMatchMedia(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion() {
  return useMatchMedia("(prefers-reduced-motion: reduce)");
}

export function useFinePointer() {
  return useMatchMedia("(hover: hover) and (pointer: fine)");
}

/**
 * True for small screens or coarse/touch pointers — used to gate down
 * expensive visuals (3D scene detail, particle counts, blur layers) so
 * mobile devices don't take a battery/performance hit.
 */
export function useIsLowPower() {
  const smallScreen = useMatchMedia("(max-width: 768px)");
  const coarsePointer = useMatchMedia("(pointer: coarse)");
  return smallScreen || coarsePointer;
}
