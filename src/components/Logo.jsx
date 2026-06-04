/**
 * Kopala Kits — the brand mark.
 *
 * A shield silhouette with a "K" carved out of negative space. The shield
 * evokes a football crest; the K is the brand initial. Designed to read at
 * 16px (favicon) and at 120px (hero).
 *
 * Props:
 *   size: pixel size (default 36)
 *   variant: 'mark' (shield only), 'wordmark' (mark + KOPALA KITS text),
 *            'stacked' (mark above text)
 *   color: 'olive' (default), 'cream', 'white'
 */
export default function Logo({ size = 36, variant = 'mark', color = 'olive' }) {
  const palette = {
    olive: { primary: 'var(--dusty-olive)', accent: 'var(--dusty-olive-dark)', text: 'var(--dusty-olive-dark)' },
    cream: { primary: 'var(--champagne-mist)', accent: 'var(--khaki-dark)', text: 'var(--champagne-mist)' },
    white: { primary: '#FFFFFF', accent: '#FFFFFF', text: '#FFFFFF' },
  }[color] || {};

  // The shield mark. The K is cut out via mask so the background shows through.
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Kopala Kits"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="kkShield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.primary} />
          <stop offset="1" stopColor={palette.accent} />
        </linearGradient>
      </defs>
      {/* Shield outline */}
      <path
        d="M32 2 L60 12 L60 32 Q60 50 32 62 Q4 50 4 32 L4 12 Z"
        fill="url(#kkShield)"
      />
      {/* Inner panel — slightly darker, creates depth */}
      <path
        d="M32 6 L56 15 L56 32 Q56 47 32 58 Q8 47 8 32 L8 15 Z"
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      {/* The K — built from a vertical bar and two diagonal arms */}
      {/* Vertical bar */}
      <rect x="22" y="16" width="6" height="32" fill="rgba(255,255,255,0.96)" rx="1" />
      {/* Upper diagonal */}
      <path
        d="M28 32 L42 16 L46 16 L32 32 Z"
        fill="rgba(255,255,255,0.96)"
      />
      {/* Lower diagonal */}
      <path
        d="M28 32 L42 48 L46 48 L32 32 Z"
        fill="rgba(255,255,255,0.96)"
      />
      {/* A small star/ball dot for personality */}
      <circle cx="32" cy="10" r="1.6" fill="rgba(255,255,255,0.7)" />
    </svg>
  );

  if (variant === 'mark') {
    return mark;
  }

  // Wordmark + mark, side by side
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.28,
        color: palette.text,
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
          color: palette.text,
        }}
      >
        KOPALA KITS
      </span>
    </span>
  );
}
