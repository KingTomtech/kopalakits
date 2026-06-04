import { X } from 'lucide-react';

export default function AnnouncementBar({ banner, onDismiss }) {
  if (!banner || !banner.active || !banner.text) return null;
  return (
    <div
      className="relative z-30 text-center text-sm font-semibold py-2.5 px-8"
      style={{ backgroundColor: 'var(--brand)', color: '#FFFFFF' }}
    >
      <span>{banner.text}</span>
      <button
        onClick={onDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X size={16} />
      </button>
    </div>
  );
}
