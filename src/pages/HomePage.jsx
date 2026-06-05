import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Truck, MessageCircle, ShieldCheck, Sparkles, Flame, Clock } from 'lucide-react';
import ProductGrid from '../components/ProductGrid.jsx';
import { useWishlist } from '../hooks/useWishlist.js';
import { getLeagueTable } from '../lib/api.js';
import { ZUSA, FAZ } from '../lib/orgs.js';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="aspect-[3/4] kk-skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-12 rounded kk-skeleton" />
        <div className="h-3.5 w-3/4 rounded kk-skeleton" />
        <div className="h-2.5 w-full rounded kk-skeleton" />
      </div>
    </div>
  );
}

function CategoryHero({ icon, label, count, href, accent }) {
  return (
    <a
      href={href}
      className="group flex flex-col items-start gap-1 p-3 rounded-2xl border transition-all hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: accent + '22', color: accent }}
      >
        {icon}
      </div>
      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{label}</div>
      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{count} kits</div>
    </a>
  );
}

function FeaturePill({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 p-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
      >
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
    </div>
  );
}

export default function HomePage({ products, loading, loadError, reload, onAddToCart, showToast }) {
  const wishlist = useWishlist();
  const [standings, setStandings] = useState([]);

  // Featured: 4 newest (newArrival) + 4 most expensive non-featured, shuffled.
  const featured = useMemo(() => {
    if (!products.length) return [];
    const newOnes = products.filter((p) => p.newArrival);
    const rest = products.filter((p) => !p.newArrival);
    return [...newOnes, ...rest].slice(0, 8);
  }, [products]);

  const byCategory = useMemo(() => {
    const map = { Local: 0, International: 0, National: 0, Retro: 0 };
    for (const p of products) {
      if (map[p.category] !== undefined) map[p.category]++;
    }
    return map;
  }, [products]);

  // Live standings — top of Premier League, fetched from the public sports API.
  useEffect(() => {
    let alive = true;
    getLeagueTable('4328').then((table) => {
      if (alive) setStandings((table || []).slice(0, 5));
    });
    return () => { alive = false; };
  }, []);

  const handleAdd = (product) => {
    onAddToCart(product);
    // The QuickAddModal opens, user picks size+qty, then add() fires.
  };

  return (
    <div className="kk-fade">
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-elevated) 60%, var(--surface) 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 kk-fade"
              style={{ backgroundColor: 'var(--brand)', color: '#FFFFFF' }}
            >
              <Sparkles size={12} /> Kitwe, Zambia
            </span>
            <h1
              className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tighter kk-rise"
              style={{ color: 'var(--text)' }}
            >
              Premium football jerseys,{' '}
              <span style={{ color: 'var(--brand-deep)' }}>delivered to your door.</span>
            </h1>
            <p className="mt-4 text-base md:text-lg max-w-md" style={{ color: 'var(--text-muted)' }}>
              From Mufulira Wanderers to Manchester United. Local Zambian teams, international
              clubs, national sides and retro classics — all in one place, ordered in a tap via WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold transition hover:brightness-110 shadow-lg"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                Shop the catalog <ArrowRight size={18} />
              </a>
              <a
                href={`https://wa.me/260770713619`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <MessageCircle size={18} /> Chat with us
              </a>
            </div>
            <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: 'var(--text-faint)' }}>
              <span className="flex items-center gap-1"><Truck size={12} /> Same-day in Kitwe</span>
              <span className="flex items-center gap-1"><ShieldCheck size={12} /> Verified authentic</span>
            </div>
          </div>
          <div className="relative h-[280px] md:h-[400px] kk-rise">
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', border: '1px solid' }}
            >
              {loading ? (
                <div className="w-full h-full kk-skeleton" />
              ) : (
                <img
                  src={(products.find((p) => p.newArrival) || products[0])?.image}
                  alt="Featured jersey"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.onerror = null; }}
                />
              )}
            </div>
            <div
              className="absolute -bottom-4 -left-4 rounded-2xl shadow-xl p-3 max-w-[200px] kk-fade"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', border: '1px solid' }}
            >
              <div className="flex items-center gap-2">
                <Flame size={16} style={{ color: 'var(--brand-deep)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>New arrivals</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {byCategory.Retro || 0} retro classics just landed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — quick tile grid */}
      <section className="max-w-5xl mx-auto px-4 pt-8">
        <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          Shop by category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <CategoryHero icon="⚽" label="Local" count={byCategory.Local} href="/shop?category=Local" accent="#198A00" />
          <CategoryHero icon="🌍" label="International" count={byCategory.International} href="/shop?category=International" accent="#1F4E96" />
          <CategoryHero icon="🏴" label="National" count={byCategory.National} href="/shop?category=National" accent="#C5364A" />
          <CategoryHero icon="🏆" label="Retro" count={byCategory.Retro} href="/shop?category=Retro" accent="#D99404" />
        </div>
      </section>

      {/* WHY US */}
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div
          className="rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-2 p-4"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', border: '1px solid' }}
        >
          <FeaturePill icon={<Truck size={18} />} title="Copperbelt delivery" subtitle="Same-day in Kitwe, next-day elsewhere" />
          <FeaturePill icon={<MessageCircle size={18} />} title="Order via WhatsApp" subtitle="One tap to checkout, no forms" />
          <FeaturePill icon={<ShieldCheck size={18} />} title="Authentic only" subtitle="Sourced from official suppliers" />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Featured kits
          </h2>
          <a href="/shop" className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--brand-deep)' }}>
            View all <ArrowRight size={14} />
          </a>
        </div>
        {loadError && !loading ? (
          <div className="text-center py-10">
            <p style={{ color: 'var(--danger)' }} className="font-medium">{loadError}</p>
            <button
              onClick={reload}
              className="mt-3 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <ProductGrid
            products={featured}
            onAdd={handleAdd}
            onToggleWishlist={(id) => {
              const wasIn = wishlist.has(id);
              wishlist.toggle(id);
              showToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ♥');
            }}
            wishlist={wishlist.wishlist}
          />
        )}
      </section>

      {/* LIVE FOOTBALL — pulled from TheSportsDB public API */}
      {standings.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              <span className="inline-flex items-center gap-2">
                <Clock size={18} style={{ color: 'var(--brand-deep)' }} />
                Premier League
              </span>
            </h2>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Live standings · cached 6h</span>
          </div>
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <tr style={{ color: 'var(--text-faint)' }}>
                  <th className="text-left px-4 py-2 font-bold uppercase text-xs">#</th>
                  <th className="text-left px-4 py-2 font-bold uppercase text-xs">Team</th>
                  <th className="text-right px-4 py-2 font-bold uppercase text-xs">P</th>
                  <th className="text-right px-4 py-2 font-bold uppercase text-xs hidden sm:table-cell">W</th>
                  <th className="text-right px-4 py-2 font-bold uppercase text-xs hidden sm:table-cell">D</th>
                  <th className="text-right px-4 py-2 font-bold uppercase text-xs hidden sm:table-cell">L</th>
                  <th className="text-right px-4 py-2 font-bold uppercase text-xs">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr key={row.teamid} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2 font-bold" style={{ color: 'var(--text)' }}>{row.rank || row.intRank}</td>
                    <td className="px-4 py-2 font-medium" style={{ color: 'var(--text)' }}>{row.name}</td>
                    <td className="px-4 py-2 text-right" style={{ color: 'var(--text-muted)' }}>{row.played}</td>
                    <td className="px-4 py-2 text-right hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{row.win}</td>
                    <td className="px-4 py-2 text-right hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{row.draw}</td>
                    <td className="px-4 py-2 text-right hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{row.loss}</td>
                    <td className="px-4 py-2 text-right font-black" style={{ color: 'var(--brand-deep)' }}>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* COMMUNITY HUB — Zambian football + media */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          The Zambian football world
        </h2>
        <p className="text-sm mt-1 max-w-xl" style={{ color: 'var(--text-muted)' }}>
          University games, the FAZ leagues, the teams you see in the shop — and the
          social channels where the fans live.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <a
            href="/faz"
            className="rounded-2xl p-4 border transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-2" style={{ backgroundColor: FAZ.accentColor }}>⚽</div>
            <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>FAZ</div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Football Association of Zambia</div>
          </a>
          <a
            href="/zusa"
            className="rounded-2xl p-4 border transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-2" style={{ backgroundColor: ZUSA.accentColor }}>🎓</div>
            <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>ZUSA</div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Zambia University Sports</div>
          </a>
          <a
            href="/news"
            className="rounded-2xl p-4 border transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-2" style={{ backgroundColor: 'var(--text)' }}>📰</div>
            <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>News</div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>BBC Sport + ESPN FC</div>
          </a>
          <a
            href="/media"
            className="rounded-2xl p-4 border transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-2" style={{ background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)' }}>📷</div>
            <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>Media</div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>YouTube · IG · TikTok</div>
          </a>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-4">
        <div
          className="rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
          style={{ backgroundColor: 'var(--brand-deep)', color: '#FFFFFF' }}
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Can't find the kit you want?
            </h3>
            <p className="mt-1 opacity-90">
              Message us on WhatsApp — we source special requests across Zambia and the region.
            </p>
          </div>
          <a
            href={`https://wa.me/260770713619?text=${encodeURIComponent("Hi Kopala Kits! I'm looking for a specific jersey. Can you help?")}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition hover:brightness-110"
            style={{ backgroundColor: '#FFFFFF', color: 'var(--brand-deep)' }}
          >
            <MessageCircle size={18} /> Ask on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
