import useMagneticCursor from "../hooks/useMagneticCursor";

/**
 * Thin wrappers that attach the magnetic-pull hook to a real
 * <button>/<a>, and mark it with data-magnetic so <CustomCursor />
 * also knows to enlarge its ring nearby. Use these anywhere a CTA
 * should feel magnetic instead of re-wiring the hook per component.
 */
export function MagneticButton({ className, children, ...rest }) {
  const ref = useMagneticCursor();
  return (
    <button ref={ref} data-magnetic className={className} {...rest}>
      {children}
    </button>
  );
}

export function MagneticAnchor({ className, children, ...rest }) {
  const ref = useMagneticCursor();
  return (
    <a ref={ref} data-magnetic className={className} {...rest}>
      {children}
    </a>
  );
}
