import { useEffect, useMemo, useState, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx';
import { CATEGORIES } from '../constants.js';
import { useWishlist } from '../hooks/useWishlist.js';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low → high' },
  { id: 'price-desc', label: 'Price: high → low' },
  { id: 'name-asc', label: 'Name: A → Z' },
];

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

export default function ShopPage({ products, loading, loadError, reload, onAddToCart, showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';
  const [filter, setFilter] = useState(CATEGORIES.includes(initialCat) ? initialCat : 'All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const drawerRef = useRef(null);
  const wishlist = useWishlist();

  useEffect(() => {
    if (!showFilters) return;
    const container = drawerRef.current;
    if (!container) return;
    const firstFocusable = container.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setShowFilters(false); }
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
  }, [showFilters]);

  // Sync filter → URL
  useEffect(() => {
    if (filter === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', filter);
    }
    setSearchParams(searchParams, { replace: true });
  }, [filter, searchParams, setSearchParams]);

  // Scroll to top on filter/search change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filter, query]);

  const filtered = useMemo(() => {
    let r = filter === 'All' ? products : products.filter((p) => p.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      r = r.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'featured': (a, b) => Number(!!b.newArrival) - Number(!!a.newArrival),
    };
    return [...r].sort(sorters[sort] || sorters.featured);
  }, [filter, query, sort, products]);

  const handleAdd = (product) => onAddToCart(product);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 kk-fade">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            {filter === 'All' ? 'All kits' : filter}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${products.length} jerseys`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                Search
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jersey name…"
                  aria-label="Search jerseys"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                Category
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-between transition"
                    style={{
                      backgroundColor: filter === cat ? 'var(--brand)' : 'transparent',
                      color: filter === cat ? '#FFFFFF' : 'var(--text)',
                    }}
                  >
                    {cat}
                    {filter === cat && cat !== 'All' && (
                      <span className="text-[10px] font-bold opacity-80">●</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                Sort
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 text-base md:text-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
              >
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div
              className="rounded-2xl p-3 text-xs"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              <div className="font-bold mb-1" style={{ color: 'var(--text)' }}>Tip</div>
              Search by team name, year, or sponsor. Press <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--border)' }}>Esc</kbd> to clear.
            </div>
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div
            className="fixed inset-0 z-50 flex"
            onClick={() => setShowFilters(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm kk-fade" />
            <div
              ref={drawerRef}
              className="relative ml-auto w-[85%] max-w-sm h-full p-5 overflow-y-auto kk-rise"
              style={{ backgroundColor: 'var(--bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span id="filter-drawer-title" className="font-black text-lg" style={{ color: 'var(--text)' }}>Filters</span>
                <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters">
                  <X size={20} style={{ color: 'var(--text)' }} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                    Search
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Jersey name…"
                    aria-label="Search jerseys"
                    className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                    Category
                  </div>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => { setFilter(cat); setShowFilters(false); }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold"
                        style={{
                          backgroundColor: filter === cat ? 'var(--brand)' : 'transparent',
                          color: filter === cat ? '#FFFFFF' : 'var(--text)',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
                    Sort
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                  >
                    {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div>
          {loadError && !loading ? (
            <div className="text-center py-12">
              <p className="font-medium" style={{ color: 'var(--danger)' }}>{loadError}</p>
              <button
                type="button"
                onClick={reload}
                className="mt-3 px-4 py-2 rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl border-2 border-dashed"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="text-5xl mb-3">⚽</div>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>No jerseys found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Try a different search or category.
              </p>
              <button
                type="button"
                onClick={() => { setFilter('All'); setQuery(''); }}
                className="mt-4 px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: 'var(--brand)', color: '#FFFFFF' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ProductGrid
              products={filtered}
              onAdd={handleAdd}
              onToggleWishlist={(id) => {
                const wasIn = wishlist.has(id);
                wishlist.toggle(id);
                showToast(wasIn ? 'Removed from wishlist' : 'Added to wishlist ♥');
              }}
              wishlist={wishlist.wishlist}
            />
          )}
        </div>
      </div>
    </div>
  );
}
