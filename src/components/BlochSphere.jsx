import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import BlochSphereFallback from "./BlochSphereFallback";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useIsLowPower } from "../hooks/useMediaQuery";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// Basis states placed on the sphere the way a physics textbook draws them:
// +Y = |0>, -Y = |1>, and the equator carries the four superposition states.
const BASIS_STATES = [
  { label: "|0⟩", theta: 0, phi: 0 },
  { label: "|1⟩", theta: Math.PI, phi: 0 },
  { label: "|+⟩", theta: Math.PI / 2, phi: 0 },
  { label: "|−⟩", theta: Math.PI / 2, phi: Math.PI },
  { label: "|+i⟩", theta: Math.PI / 2, phi: Math.PI / 2 },
  { label: "|−i⟩", theta: Math.PI / 2, phi: -Math.PI / 2 },
];

// Small floating quantum-math snippets that drift around the sphere.
// Positions are spherical (radius/theta/phi) so they sit in a shell
// around the sphere rather than clipping through it.
const MATH_SNIPPETS = [
  { text: "|ψ⟩ = α|0⟩ + β|1⟩", theta: 1.1, phi: 0.6, r: 4.4, size: "text-[13px] md:text-[15px]" },
  { text: "σx", theta: 2.0, phi: 2.4, r: 4.1, size: "text-[16px] md:text-[19px]" },
  { text: "σy", theta: 1.4, phi: -2.1, r: 4.3, size: "text-[16px] md:text-[19px]" },
  { text: "σz", theta: 0.5, phi: -1.0, r: 4.0, size: "text-[16px] md:text-[19px]" },
  { text: "H = 1/√2 [[1, 1], [1, −1]]", theta: 2.3, phi: 0.2, r: 4.6, size: "text-[12px] md:text-[14px]" },
  { text: "⟨ψ|ψ⟩ = 1", theta: 0.9, phi: 2.9, r: 4.2, size: "text-[13px] md:text-[15px]" },
  { text: "U(θ, φ, λ)", theta: 1.9, phi: -0.4, r: 4.5, size: "text-[13px] md:text-[15px]" },
  { text: "|+⟩ = 1/√2 (|0⟩ + |1⟩)", theta: 2.6, phi: 1.7, r: 4.4, size: "text-[12px] md:text-[14px]" },
];

function sphericalToVec(theta, phi, r) {
  const y = r * Math.cos(theta);
  const x = r * Math.sin(theta) * Math.cos(phi);
  const z = r * Math.sin(theta) * Math.sin(phi);
  return [x, y, z];
}

/** Glowing node: a bright core plus a soft additive-blended halo, so
 * basis states and axis tips read as lit up without needing a
 * postprocessing bloom pass. */
function GlowNode({ position, color, size = 0.05, haloScale = 3.2, haloOpacity = 0.35 }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh scale={haloScale}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={haloOpacity}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Plain wrapper group for the sphere's contents. Rotation/orbit is
 * driven entirely by <OrbitControls autoRotate /> on the camera below,
 * so nothing here fights the user's manual drag-to-orbit input. */
function Rig({ children }) {
  return <group>{children}</group>;
}

/** The glowing "current state" vector, slowly precessing around the sphere. */
function StateVector({ color }) {
  const lineRef = useRef();
  const tipRef = useRef();
  const haloRef = useRef();
  const t = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    t.current += delta;
    const theta = Math.PI / 3 + Math.sin(t.current * 0.15) * 0.4;
    const phi = t.current * 0.22;
    const [x, y, z] = sphericalToVec(theta, phi, 2.02);
    if (tipRef.current) tipRef.current.position.set(x, y, z);
    if (haloRef.current) haloRef.current.position.set(x, y, z);
    const pos = lineRef.current?.geometry?.attributes?.position;
    if (pos) {
      pos.setXYZ(1, x, y, z);
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 2.02, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.95} toneMapped={false} />
      </line>
      <mesh ref={tipRef}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={haloRef} scale={3.4}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** A single drifting quantum-math label: slowly orbits its spherical
 * anchor point, bobs on a slow sine, and fades in/out on a lazy cycle
 * so the field around the sphere never looks static. */
function FloatingFormula({ snippet, index, color, dim }) {
  const groupRef = useRef();
  const spanRef = useRef();
  const seed = useRef(index * 1.7 + Math.random() * 2);
  const baseOpacity = dim ? 0.42 : 0.7;

  useFrame((_, delta) => {
    seed.current += delta;
    const t = seed.current;

    // Slow orbit + bob around the anchor point, so the formula drifts
    // and rotates through the space around the sphere.
    const driftedPhi = snippet.phi + t * 0.045;
    const driftedTheta = snippet.theta + Math.sin(t * 0.12) * 0.08;
    const [x, y, z] = sphericalToVec(driftedTheta, driftedPhi, snippet.r);
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }

    // Lazy fade in/out cycle, offset per-snippet so labels don't pulse in
    // sync — written straight to the DOM node so this never triggers a
    // React re-render.
    if (spanRef.current) {
      const fade = 0.3 + (Math.sin(t * 0.25 + index * 3.3) * 0.5 + 0.5) * 0.5;
      spanRef.current.style.opacity = String(fade * baseOpacity);
    }
  });

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={9} style={{ pointerEvents: "none" }}>
        <span
          ref={spanRef}
          className={`font-mono whitespace-nowrap select-none ${snippet.size}`}
          style={{
            color,
            opacity: baseOpacity,
            textShadow: `0 0 10px ${color}66, 0 0 22px ${color}33`,
            letterSpacing: "0.01em",
          }}
        >
          {snippet.text}
        </span>
      </Html>
    </group>
  );
}

function AxisLabel({ position, label, color }) {
  return (
    <Html position={position} center distanceFactor={9} style={{ pointerEvents: "none" }}>
      <span
        className="font-mono text-[13px] md:text-[15px] font-semibold select-none"
        style={{ color, textShadow: `0 0 10px ${color}88, 0 0 20px ${color}44` }}
      >
        {label}
      </span>
    </Html>
  );
}

function Scene({ dark, lowPower }) {
  const cyan = dark ? "#22d3ee" : "#0891b2";
  const violet = dark ? "#a78bfa" : "#7c3aed";
  const blue = dark ? "#60a5fa" : "#2563eb";
  const magenta = dark ? "#e879f9" : "#c026d3";
  const wireColor = dark ? "#60a5fa" : "#2563eb";
  const coreColor = dark ? "#0b1330" : "#eef1fb";
  const labelColor = dark ? "rgba(232,239,255,0.95)" : "rgba(15,23,42,0.9)";
  const mathColor = dark ? cyan : blue;

  return (
    <>
      <ambientLight intensity={dark ? 0.6 : 1.05} />
      <pointLight position={[6, 4, 6]} intensity={dark ? 2.4 : 1.4} color={cyan} />
      <pointLight position={[-6, -3, -5]} intensity={dark ? 1.8 : 0.85} color={violet} />
      <pointLight position={[0, 6, -4]} intensity={dark ? 1.3 : 0.6} color={blue} />

      {!lowPower && (
        <Stars radius={90} depth={50} count={2200} factor={2.2} saturation={0} fade speed={0.35} />
      )}

      <Rig>
        {/* Geodesic wireframe grid — the "glassy" quantum-mesh look */}
        <mesh rotation={[0.5, 0.3, 0]}>
          <icosahedronGeometry args={[2.34, lowPower ? 1 : 2]} />
          <meshBasicMaterial color={wireColor} wireframe transparent opacity={dark ? 0.32 : 0.4} />
        </mesh>

        {/* Glassy core with a high-tech inner glow */}
        <mesh>
          <sphereGeometry args={[2.16, lowPower ? 24 : 48, lowPower ? 24 : 48]} />
          {lowPower ? (
            <meshStandardMaterial color={coreColor} transparent opacity={0.16} roughness={0.5} />
          ) : (
            <meshPhysicalMaterial
              color={coreColor}
              transmission={0.9}
              thickness={1.5}
              roughness={0.05}
              ior={1.3}
              transparent
              opacity={0.46}
              clearcoat={1}
              clearcoatRoughness={0.1}
              iridescence={0.65}
              iridescenceIOR={1.3}
              emissive={blue}
              emissiveIntensity={0.07}
            />
          )}
        </mesh>
        {!lowPower && (
          <mesh>
            <sphereGeometry args={[2.18, 32, 32]} />
            <meshBasicMaterial
              color={cyan}
              transparent
              opacity={0.08}
              toneMapped={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Three orthogonal great circles = the X, Y, Z axes, brightened
            and color-coded so all three read clearly at once. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.3, 0.011, 8, 96]} />
          <meshBasicMaterial color={cyan} transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.3, 0.01, 8, 96]} />
          <meshBasicMaterial color={magenta} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.3, 0.01, 8, 96]} />
          <meshBasicMaterial color={blue} transparent opacity={0.55} toneMapped={false} />
        </mesh>

        {/* Bright glowing end-nodes + text labels marking the +/- X, Y, Z axis tips */}
        {!lowPower && (
          <>
            <GlowNode position={sphericalToVec(0, 0, 2.3)} color={cyan} size={0.05} />
            <GlowNode position={sphericalToVec(Math.PI, 0, 2.3)} color={cyan} size={0.05} />
            <GlowNode position={[2.3, 0, 0]} color={blue} size={0.05} />
            <GlowNode position={[-2.3, 0, 0]} color={blue} size={0.05} />
            <GlowNode position={[0, 0, 2.3]} color={magenta} size={0.05} />
            <GlowNode position={[0, 0, -2.3]} color={magenta} size={0.05} />

            <AxisLabel position={[2.7, 0, 0]} label="X" color={blue} />
            <AxisLabel position={sphericalToVec(0, 0, 2.7)} label="Y" color={cyan} />
            <AxisLabel position={[0, 0, 2.7]} label="Z" color={magenta} />
          </>
        )}

        <StateVector color={cyan} />

        {BASIS_STATES.map((s) => {
          const nodePos = sphericalToVec(s.theta, s.phi, 2.16);
          const labelPos = sphericalToVec(s.theta, s.phi, 2.7);
          return (
            <group key={s.label}>
              <GlowNode position={nodePos} color="#ffffff" size={0.05} haloScale={2.8} haloOpacity={0.32} />
              {!lowPower && (
                <Html position={labelPos} center distanceFactor={9} style={{ pointerEvents: "none" }}>
                  <span
                    className="font-mono text-[10px] md:text-[11px] tracking-wide whitespace-nowrap font-medium"
                    style={{ color: labelColor, textShadow: `0 0 10px ${cyan}66` }}
                  >
                    {s.label}
                  </span>
                </Html>
              )}
            </group>
          );
        })}

        {/* Floating quantum math drifting in a shell around the sphere */}
        {!lowPower &&
          MATH_SNIPPETS.map((snippet, i) => (
            <FloatingFormula key={snippet.text} snippet={snippet} index={i} color={mathColor} dim={dark} />
          ))}
      </Rig>
    </>
  );
}

/**
 * Giant interactive Bloch sphere for the hero background.
 *
 * - Camera sits at an isometric-style angle so all three orthogonal
 *   axes are visible simultaneously in a balanced 3D view.
 * - Fully mouse/touch orbitable via OrbitControls (drag to orbit/tilt,
 *   gentle auto-rotate while idle); zoom is disabled so scrolling the
 *   page never fights the sphere.
 * - Degrades gracefully: reduced-motion and non-WebGL browsers get a
 *   static/CSS fallback instead; small screens / coarse pointers get a
 *   lighter scene (fewer segments, no transmission material, no stars,
 *   no floating math, no OrbitControls drag — auto-rotate only).
 * - Pauses its render loop entirely while scrolled off-screen.
 */
export default function BlochSphere({ dark = true }) {
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = useIsLowPower();
  const [webglOK, setWebglOK] = useState(true);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    setWebglOK(supportsWebGL());
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showFallback = reducedMotion || !webglOK;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {showFallback ? (
        <BlochSphereFallback animate={!reducedMotion} />
      ) : (
        <Canvas
          dpr={lowPower ? 1 : [1, 2]}
          gl={{ antialias: !lowPower, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
          camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
          frameloop={visible ? "always" : "never"}
          style={{ background: "transparent" }}
        >
          <Scene dark={dark} lowPower={lowPower} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={!lowPower}
            autoRotate={visible}
            autoRotateSpeed={0.8}
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.6}
            minDistance={5}
            maxDistance={9}
            makeDefault
          />
        </Canvas>
      )}
    </div>
  );
}
