import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Plus, MessageCircle, ArrowLeft, Share2, Truck, ShieldCheck, Clock } from 'lucide-react';
import { IMAGE_FALLBACK, SIZES, PHONE_FALLBACK } from '../constants.js';
import { getTeamLastEvents, getTeamInfo, TEAM_IDS } from '../lib/api.js';
import { useWishlist } from '../hooks/useWishlist.js';
import ProductGrid from '../components/ProductGrid.jsx';

function EventRow({ ev }) {
  const date = new Date(ev.dateEvent || ev.strTimestamp);
  return (
    <li
      className="flex items-center gap-3 py-2 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <span className="text-xs tabular-nums w-12 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
        {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
      </span>
      <span className="flex-1 text-sm truncate" style={{ color: 'var(--text)' }}>
        {ev.strEvent}
      </span>
      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {ev.intHomeScore ?? '-'}–{ev.intAwayScore ?? '-'}
      </span>
    </li>
  );
}

export default function ProductPage({ products, loading, onAddToCart, showToast }) {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === String(id));
  const wishlist = useWishlist();
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState(null);

  // Live data from the public sports API
  useEffect(() => {
    if (!product) return;
    const teamId = TEAM_IDS[product.name];
    if (!teamId) return;
    let alive = true;
    Promise.all([getTeamLastEvents(teamId), getTeamInfo(teamId)]).then(([ev, ti]) => {
      if (!alive) return;
      setEvents((ev || []).slice(0, 5));
      setTeam(ti);
    });
    return () => { alive = false; };
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 kk-fade">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] rounded-3xl kk-skeleton" />
          <div className="space-y-3">
            <div className="h-8 w-1/3 rounded kk-skeleton" />
            <div className="h-12 w-3/4 rounded kk-skeleton" />
            <div className="h-24 w-full rounded kk-skeleton" />
            <div className="h-12 w-1/2 rounded kk-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center kk-fade">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Jersey not found</h1>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          The jersey you're looking for might have been removed.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-2xl font-bold text-white"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const inWishlist = wishlist.has(product.id);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch (e) { void e; }
    } else {
      try { await navigator.clipboard.writeText(url); showToast('Link copied to clipboard'); } catch (e) { void e; }
    }
  };

  const openWhatsApp = () => {
    const msg = `Hi Kopala Kits! I'd like to order the ${product.name} (K${product.price}). Please confirm availability.`;
    window.open(`https://wa.me/${PHONE_FALLBACK}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 kk-fade">
      <Link
        to="/shop"
        className="inline-flex items-center gap-1 text-sm font-bold mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="rounded-3xl overflow-hidden aspect-[3/4] relative"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <img
            src={product.image || product.img}
            alt={product.name}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_FALLBACK; }}
            className="w-full h-full object-cover"
          />
          {product.soldOut && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              SOLD OUT
            </span>
          )}
          {product.newArrival && (
            <span className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg">
              NEW
            </span>
          )}
        </div>

        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--brand-deep)' }}
          >
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1" style={{ color: 'var(--text)' }}>
            {product.name}
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-muted)' }}>
            {product.desc}
          </p>

          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-4xl font-black" style={{ color: 'var(--brand-deep)' }}>K{product.price}</span>
            <span className="text-sm" style={{ color: 'var(--text-faint)' }}>ZMW</span>
          </div>

          <div
            className="grid grid-cols-2 gap-2 mt-6 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <div className="flex items-center gap-2"><Truck size={14} style={{ color: 'var(--brand-deep)' }} /> Same-day in Kitwe</div>
            <div className="flex items-center gap-2"><ShieldCheck size={14} style={{ color: 'var(--brand-deep)' }} /> Authentic</div>
            <div className="flex items-center gap-2"><Clock size={14} style={{ color: 'var(--brand-deep)' }} /> In stock</div>
            <div className="flex items-center gap-2"><MessageCircle size={14} style={{ color: 'var(--brand-deep)' }} /> WhatsApp order</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.soldOut}
              className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-base hover:brightness-110 transition shadow-lg"
              style={{
                backgroundColor: product.soldOut ? 'var(--border)' : 'var(--brand)',
                color: product.soldOut ? 'var(--text-faint)' : '#FFFFFF',
                cursor: product.soldOut ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus size={20} /> {product.soldOut ? 'Sold out' : 'Add to cart'}
            </button>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold transition"
              style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
            <button
              onClick={() => {
                wishlist.toggle(product.id);
                showToast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist ♥');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold transition border-2"
              style={{
                borderColor: inWishlist ? '#C5364A' : 'var(--border)',
                color: inWishlist ? '#C5364A' : 'var(--text)',
              }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-bold transition border-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>

          <div
            className="mt-8 rounded-2xl p-4 text-sm"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="font-bold mb-2" style={{ color: 'var(--text)' }}>Available sizes</div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-lg text-xs font-bold border-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
              Size is selected at checkout on WhatsApp. Don't see your size? Message us.
            </p>
          </div>
        </div>
      </div>

      {/* Live data from TheSportsDB */}
      {(team || events.length > 0) && (
        <section className="mt-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Team data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 mt-3">
            {team && (
              <div
                className="rounded-2xl p-4 flex flex-col items-center text-center"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                {team.strTeamBadge && (
                  <img src={team.strTeamBadge} alt={team.strTeam} className="w-20 h-20 object-contain mb-2" />
                )}
                <div className="font-bold" style={{ color: 'var(--text)' }}>{team.strTeam}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{team.strLeague}</div>
                {team.strStadium && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>📍 {team.strStadium}</div>
                )}
              </div>
            )}
            {events.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="font-bold mb-2" style={{ color: 'var(--text)' }}>Last 5 matches</div>
                <ul className="space-y-0">
                  {events.map((ev) => <EventRow key={ev.idEvent} ev={ev} />)}
                </ul>
                <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
                  Powered by TheSportsDB · cached 6h
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            You might also like
          </h2>
          <div className="mt-4">
            <ProductGrid
              products={related}
              onAdd={onAddToCart}
              onToggleWishlist={(rid) => {
                const wasIn = wishlist.has(rid);
                wishlist.toggle(rid);
                showToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ♥');
              }}
              wishlist={wishlist.wishlist}
            />
          </div>
        </section>
      )}
    </div>
  );
}
