import { Heart, Plus } from 'lucide-react';
import { IMAGE_FALLBACK } from '../constants.js';

export default function ProductCard({ product, onAdd, onToggleWishlist, inWishlist }) {
  return (
    <a
      href={`/product/${product.id}`}
      className="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <img
          src={product.image || product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_FALLBACK; }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.soldOut && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            SOLD OUT
          </span>
        )}
        {product.newArrival && (
          <span className="absolute top-2 right-2 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-lg">
            NEW
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product.id); }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition"
          style={{
            backgroundColor: inWishlist ? '#C5364A' : 'rgba(255,255,255,0.92)',
            color: inWishlist ? '#FFFFFF' : 'var(--text-faint)',
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-3">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-deep)' }}>
          {product.category}
        </span>
        <h3 className="font-bold text-sm leading-tight mt-0.5 line-clamp-2" style={{ color: 'var(--text)' }}>
          {product.name}
        </h3>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{product.desc}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-black" style={{ color: 'var(--brand-deep)' }}>K{product.price}</span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd?.(product); }}
            disabled={product.soldOut}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition shadow-md"
            style={{
              backgroundColor: product.soldOut ? 'var(--border)' : 'var(--brand)',
              color: product.soldOut ? 'var(--text-faint)' : '#FFFFFF',
              cursor: product.soldOut ? 'not-allowed' : 'pointer',
              opacity: product.soldOut ? 0.6 : 1,
            }}
            aria-label={product.soldOut ? 'Sold out' : `Quick add ${product.name}`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </a>
  );
}
