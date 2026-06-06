import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Moon, Sun, ChevronRight } from 'lucide-react';
import Logo from './Logo.jsx';
import { CATEGORIES } from '../constants.js';

export default function MobileMenu({ isOpen, onClose, darkMode, onToggleDark }) {
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const container = menuRef.current;
    if (!container) return;
    const firstFocusable = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); }
      if (e.key === 'Tab') {
        const focusables = Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
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
        ref={menuRef}
        className="relative w-[82%] max-w-sm h-full flex flex-col shadow-2xl kk-rise rounded-r-2xl"
        style={{ backgroundColor: 'var(--bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Logo size={32} variant="wordmark" />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5"
            aria-label="Close menu"
          >
            <X size={20} style={{ color: 'var(--text)' }} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link to="/" onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Home <ChevronRight size={16} />
          </Link>
          <Link to="/shop" onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Shop <ChevronRight size={16} />
          </Link>
          <Link to="/about" onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            About <ChevronRight size={16} />
          </Link>
          <Link to="/contact" onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm hover:bg-black/5" style={{ color: 'var(--text)' }}>
            Contact <ChevronRight size={16} />
          </Link>

          <div className="pt-4 pb-2 px-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Categories
          </div>
          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-black/5"
              style={{ color: 'var(--text-muted)' }}
            >
              {cat}
              <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
            </Link>
          ))}
        </nav>

        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
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
