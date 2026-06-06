import { useRef, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, MessageCircle } from 'lucide-react';
import { IMAGE_FALLBACK } from '../constants.js';

export default function CartDrawer({ isOpen, onClose, cart, phone }) {
  const drawerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const container = drawerRef.current;
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

  const sendToWhatsApp = () => {
    const items = cart.cart.map(
      (it) => `- ${it.name} (Size: ${it.size}, Qty: ${it.quantity}) - K${it.price * it.quantity}`
    ).join(' | ');
    const msg = `Hi Kopala Kits! I'd like to order the following jerseys: ${items}. Total: K${cart.total}. I'm in Kitwe — please confirm availability and delivery details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm kk-fade" />
      <aside
        ref={drawerRef}
        className="relative w-full max-w-md h-full flex flex-col shadow-2xl kk-rise"
        style={{ backgroundColor: 'var(--bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>
            Your Cart ({cart.count})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5"
            aria-label="Close cart"
          >
            <X size={20} style={{ color: 'var(--text)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.cart.length === 0 ? (
            <div className="text-center py-12 md:py-20" style={{ color: 'var(--text-faint)' }}>
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>Your cart is empty</p>
              <p className="text-sm mt-1">Browse our kits and add your favourites.</p>
            </div>
          ) : (
            cart.cart.map((item) => (
              <div
                key={item.cartId}
                className="flex gap-3 p-3 rounded-2xl border kk-rise"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <img
                  src={item.image || item.img}
                  alt={item.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_FALLBACK; }}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Size: {item.size}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand-deep)' }}>
                    K{item.price * item.quantity}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => cart.updateQty(item.cartId, -1)}
                      aria-label={item.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                      className="w-7 h-7 rounded-lg border-2 flex items-center justify-center hover:opacity-80 transition"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      {item.quantity === 1 ? <X size={12} /> : <Minus size={12} />}
                    </button>
                    <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--text)' }}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => cart.updateQty(item.cartId, +1)}
                      aria-label="Increase quantity"
                      className="w-7 h-7 rounded-lg border-2 flex items-center justify-center hover:opacity-80 transition"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => cart.remove(item.cartId)}
                  aria-label="Remove from cart"
                  className="p-1.5 rounded-xl self-start transition hover:text-[var(--danger)]"
                  style={{ color: 'var(--text-faint)' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.cart.length > 0 && (
          <div className="p-5 border-t space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
            <div className="flex justify-between items-baseline">
              <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Total</span>
              <span className="text-2xl font-black" style={{ color: 'var(--brand-deep)' }}>K{cart.total}</span>
            </div>
            <button
              type="button"
              onClick={() => { sendToWhatsApp(); onClose(); }}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 hover:brightness-110 transition shadow-lg"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={22} /> ORDER VIA WHATSAPP
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
              We'll confirm your order and delivery details via WhatsApp
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
