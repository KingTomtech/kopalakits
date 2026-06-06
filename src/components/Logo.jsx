/**
 * Kopala Kits — the official brand mark.
 *
 * Uses the official logo PNG (circular KK mark). Props:
 *   size: pixel size (default 36)
 *   variant: 'mark' (logo only), 'wordmark' (logo + KOPALA KITS text)
 *   color: ignored — logo is the official asset
 */
export default function Logo({ size = 36, variant = 'mark' }) {
  const mark = (
    <img
      src="/logo.png"
      alt="Kopala Kits"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: '50%' }}
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
    />
  );

  if (variant === 'mark') {
    return mark;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.28,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {mark}
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: 900,
          fontSize: size * 0.5,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'var(--text)',
        }}
      >
        KOPALA KITS
      </span>
    </span>
  );
}
