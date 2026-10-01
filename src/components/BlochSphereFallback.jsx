/**
 * Pure CSS/SVG stand-in for the interactive 3D Bloch sphere. Used as the
 * <Suspense> fallback while the three.js chunk loads, and as the
 * permanent visual for prefers-reduced-motion or WebGL-less browsers —
 * so nobody ever sees a blank hero.
 */
export default function BlochSphereFallback({ animate = true }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none [container-type:size]"
      aria-hidden="true"
    >
      {/* Sized from the container (not the viewport) so the rings stay a
          true circle inside whatever box the hero gives us — the 300px
          phone square as much as the full-bleed desktop backdrop. */}
      <div
        className="relative w-[min(90cqw,90cqh,780px)] h-[min(90cqw,90cqh,780px)] opacity-70"
        style={{ perspective: "1200px" }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid var(--line-bright)",
            animation: animate ? "spin-slow 34s linear infinite" : "none",
          }}
        />
        <div
          className="absolute inset-[8%] rounded-full"
          style={{
            border: "1px dashed color-mix(in srgb, var(--cyan) 35%, transparent)",
            animation: animate ? "spin-reverse 26s linear infinite" : "none",
          }}
        />
        <div
          className="absolute inset-[16%] rounded-full"
          style={{
            border: "1px solid var(--line-bright)",
            animation: animate ? "spin-slow 20s linear infinite" : "none",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "var(--cyan)", boxShadow: "0 0 40px 14px color-mix(in srgb, var(--cyan) 55%, transparent)" }}
        />
        <div className="absolute inset-0" style={{ animation: animate ? "spin-slow 24s linear infinite" : "none" }}>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
            style={{ background: "var(--blue-bright)", boxShadow: "0 0 20px 6px color-mix(in srgb, var(--blue-bright) 70%, transparent)" }}
          />
        </div>
        <div className="absolute inset-0" style={{ animation: animate ? "spin-reverse 16s linear infinite" : "none" }}>
          <div
            className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--text)", boxShadow: "0 0 16px 5px color-mix(in srgb, var(--text) 60%, transparent)" }}
          />
        </div>
      </div>
    </div>
  );
}
