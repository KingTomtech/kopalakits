/**
 * Brand icons for social platforms. Lucide-react doesn't ship brand marks
 * (they're considered trademarks). We draw simple, monochrome SVG icons
 * that match the brand color.
 */
export function YouTubeIcon({ size = 24, color = '#FF0000' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42a2.5 2.5 0 0 0-1.76 1.77C2 8.77 2 12 2 12s0 3.23.42 4.81a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.23 22 12 22 12s0-3.23-.42-4.81z" fill={color}/>
      <path d="M10 15l5.2-3L10 9v6z" fill="#FFFFFF"/>
    </svg>
  );
}

export function InstagramIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f58529" />
          <stop offset="0.5" stopColor="#dd2a7b" />
          <stop offset="1" stopColor="#8134af" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="#FFFFFF" />
    </svg>
  );
}

export function FacebookIcon({ size = 24, color = '#1877F2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill={color} />
      <path d="M15.5 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H12.5v7h-3v-7H7v-3h2.5V9a3.5 3.5 0 0 1 3.5-3.5h3v2.5z" fill="#FFFFFF" />
    </svg>
  );
}

export function TikTokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.6 7.7a5.4 5.4 0 0 1-3.3-1.1V15a4.7 4.7 0 1 1-4.7-4.7c.3 0 .5 0 .8.1v2.5a2.3 2.3 0 1 0 1.6 2.1V4h2.4a3.1 3.1 0 0 0 3.2 3v.7z" fill="#000" stroke="#25F4EE" strokeWidth="0.5" />
    </svg>
  );
}
