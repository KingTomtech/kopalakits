import { useState, useRef, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { SIZES, IMAGE_FALLBACK } from '../constants.js';

export default function QuickAddModal({ product, onClose, onAdd }) {
  const modalRef = useRef(null);
  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!product) return;
    const container = modalRef.current;
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
  }, [product, onClose]);

  if (!product) return null;

  const add = () => {
    onAdd({ ...product, size, quantity: qty });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Add ${product.name} to cart`}
    >
      <div
        ref={modalRef}
        className="rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl kk-rise"
        style={{ backgroundColor: 'var(--bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={product.image || product.img}
            alt={product.name}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_FALLBACK; }}
            className="w-full h-56 object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              {product.category}
            </span>
            <h3 className="font-bold text-lg mt-0.5" style={{ color: 'var(--text)' }}>{product.name}</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{product.desc}</p>
          </div>

          <div>
            <span className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Size</span>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  className="w-10 h-10 rounded-xl text-sm font-bold border-2 transition"
                  style={{
                    backgroundColor: size === s ? 'var(--brand)' : 'transparent',
                    borderColor: size === s ? 'var(--brand)' : 'var(--border)',
                    color: size === s ? 'var(--bg)' : 'var(--text)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--text)' }}>{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={add}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 transition shadow-lg"
            style={{ backgroundColor: 'var(--brand)', color: 'var(--bg)' }}
          >
            <ShoppingCart size={20} /> Add K{product.price * qty} to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
