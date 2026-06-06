import { useNavigate } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { IMAGE_FALLBACK } from '../constants.js';

export default function ProductCard({ product, onAdd, onToggleWishlist, inWishlist }) {
  const navigate = useNavigate();
  return (
    <article
      className="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image || product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_FALLBACK; }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.soldOut && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            SOLD OUT
          </span>
        )}
        {product.newArrival && (
          <span
            className="absolute top-2 right-2 text-black text-[10px] font-bold px-2 py-1 rounded-lg"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            NEW
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition hover:scale-110"
          style={{
            backgroundColor: inWishlist ? 'var(--danger)' : 'var(--surface)',
            color: inWishlist ? '#FFFFFF' : 'var(--text-faint)',
            border: inWishlist ? 'none' : '1px solid var(--border)',
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-3" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
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
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd?.(product); }}
            disabled={product.soldOut}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition shadow-md hover:brightness-110"
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
    </article>
  );
}
