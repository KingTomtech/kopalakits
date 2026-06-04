/**
 * Generate placeholder jersey SVGs for local Zambian teams we don't have
 * photos for. These are not pixel-perfect replicas — they're stylized
 * shirt silhouettes with the team's colors so the UI is honest about
 * what the user is buying.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'jerseys');
fs.mkdirSync(outDir, { recursive: true });

const kits = {
  'mufulira-wanderers': {
    label: 'MFC',
    primary: '#0a7a3b',
    secondary: '#ffffff',
    pattern: 'vertical-stripes',
  },
  'kabwe-warriors': {
    label: 'KW',
    primary: '#7ec0ee',
    secondary: '#ffffff',
    pattern: 'solid',
  },
  'nkana-fc': {
    label: 'NFC',
    primary: '#c8102e',
    secondary: '#ffffff',
    pattern: 'vertical-stripes',
  },
  'power-dynamos': {
    label: 'PD',
    primary: '#ffd700',
    secondary: '#222222',
    pattern: 'solid',
  },
  'zambia-national': {
    label: 'ZAM',
    primary: '#1a7a3a',
    secondary: '#ff8c00',
    pattern: 'solid',
  },
};

function shirtSVG({ label, primary, secondary, pattern }) {
  // Stylized jersey: shoulders, sleeves, body, collar, sponsor patch.
  // 400x520 viewBox so it fits the 3:4 product card aspect ratio.
  const stripes = pattern === 'vertical-stripes' ? `
    <g clip-path="url(#shirtClip)">
      ${Array.from({ length: 6 }).map((_, i) => `
        <rect x="${i * 70 - 20}" y="0" width="35" height="520" fill="${i % 2 === 0 ? primary : secondary}" />
      `).join('')}
    </g>` : `
    <rect x="0" y="0" width="400" height="520" fill="${primary}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" role="img" aria-label="${label} jersey">
  <defs>
    <clipPath id="shirtClip">
      <path d="M120 60 L160 40 Q200 30 240 40 L280 60 L340 90 L320 170 L290 160 L290 470 Q290 490 270 490 L130 490 Q110 490 110 470 L110 160 L80 170 L60 90 Z" />
    </clipPath>
    <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)" />
      <stop offset="1" stop-color="rgba(0,0,0,0.18)" />
    </linearGradient>
  </defs>
  <rect width="400" height="520" fill="#F9F3E8" />
  ${stripes}
  <path d="M120 60 L160 40 Q200 30 240 40 L280 60 L340 90 L320 170 L290 160 L290 470 Q290 490 270 490 L130 490 Q110 490 110 470 L110 160 L80 170 L60 90 Z"
        fill="url(#shade)" />
  <!-- collar -->
  <path d="M170 40 Q200 60 230 40 L230 60 Q200 80 170 60 Z" fill="rgba(0,0,0,0.18)" stroke="${secondary}" stroke-width="3" />
  <!-- sponsor patch -->
  <rect x="160" y="170" width="80" height="50" rx="6" fill="${secondary}" opacity="0.95" />
  <text x="200" y="202" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif"
        font-weight="800" font-size="22" fill="${primary}">${label}</text>
  <!-- trim on sleeves -->
  <path d="M60 90 L110 110 L110 160 L80 170 Z" fill="${secondary}" opacity="0.6" />
  <path d="M340 90 L290 110 L290 160 L320 170 Z" fill="${secondary}" opacity="0.6" />
</svg>
`;
}

for (const [slug, spec] of Object.entries(kits)) {
  const file = path.join(outDir, `${slug}.svg`);
  fs.writeFileSync(file, shirtSVG(spec));
  console.log('wrote', file);
}
