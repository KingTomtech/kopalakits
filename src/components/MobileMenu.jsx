import { X, Moon, Sun, ChevronRight } from 'lucide-react';
import Logo from './Logo.jsx';
import { CATEGORIES } from '../constants.js';

export default function MobileMenu({ isOpen, onClose, darkMode, onToggleDark }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm kk-fade" />
      <aside
        className="relative w-[82%] max-w-sm h-full flex flex-col shadow-2xl kk-rise"
        style={{ backgroundColor: 'var(--bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Logo size={32} variant="wordmark" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5"
            aria-label="Close menu"
          >
            <X size={20} style={{ color: 'var(--text)' }} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <a href="/" className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Home <ChevronRight size={16} />
          </a>
          <a href="/shop" className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Shop <ChevronRight size={16} />
          </a>
          <a href="/about" className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            About <ChevronRight size={16} />
          </a>
          <a href="/contact" className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Contact <ChevronRight size={16} />
          </a>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Categories
          </div>
          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
            <a
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-black/5"
              style={{ color: 'var(--text-muted)' }}
            >
              {cat}
              <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
            </a>
          ))}
        </nav>

        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onToggleDark}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5"
            style={{ color: 'var(--text)' }}
          >
            <span className="flex items-center gap-3">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>tap to switch</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
