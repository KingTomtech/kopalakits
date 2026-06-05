import { useEffect, useState, useCallback } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { RSS_FEEDS, fetchFeed } from '../lib/rss.js';
import { NEWS_CATEGORIES } from '../lib/orgs.js';

function relativeTime(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function ItemCard({ item }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden border transition hover:-translate-y-0.5 hover:shadow-lg kk-rise"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {item.image && (
        <div
          className="aspect-[16/9] bg-gray-200"
          style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
          <span>{item.source}</span>
          {item.pubDate && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Clock size={10} /> {relativeTime(item.pubDate)}</span>
            </>
          )}
        </div>
        <h3 className="font-bold text-sm leading-snug line-clamp-3" style={{ color: 'var(--text)' }}>{item.title}</h3>
        {item.description && (
          <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
        )}
        <div className="mt-3 text-[10px] font-bold inline-flex items-center gap-1" style={{ color: 'var(--brand-deep)' }}>
          Read full story <ExternalLink size={10} />
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="aspect-[16/9] kk-skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 rounded kk-skeleton" />
        <div className="h-4 w-3/4 rounded kk-skeleton" />
        <div className="h-3 w-full rounded kk-skeleton" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(RSS_FEEDS.map((f) => fetchFeed(f.id)));
      setFeeds(results.filter(Boolean));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  // Heuristic: classify items by source/topic words
  const classify = (item) => {
    const s = (item.title + ' ' + (item.description || '')).toLowerCase();
    if (filter === 'all') return true;
    if (filter === 'zambia') return /zambia|chipolopolo|copper queens|zsl|zusa|faz|kopala|kitwe|ndola|lusaka/.test(s);
    if (filter === 'africa') return /africa|afcon|cosafa|egypt|nigeria|ghana|kenya|south africa|senegal|morocco|ivory/.test(s);
    if (filter === 'kit-launches') return /kit|jersey|launch|reveal|drop|nike|adidas|puma/.test(s);
    if (filter === 'world') return !/zambia|africa|afcon|cosafa/.test(s);
    return true;
  };

  const allItems = feeds.flatMap((f) => (f?.items || []).map((i) => ({ ...i, _source: f.id })))
    .filter(classify)
    .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <section
        className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--surface) 100%)' }}
      >
        <div className="flex items-start gap-3 mb-2">
          <Newspaper size={28} style={{ color: 'var(--brand-deep)' }} />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Soccer news
          </h1>
        </div>
        <p className="max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Live football news from BBC Sport and ESPN FC. Cached for 30 minutes.
          Filter by region, league, or kit launches.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {NEWS_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition"
              style={{
                backgroundColor: filter === c.id ? 'var(--brand)' : 'transparent',
                borderColor: filter === c.id ? 'var(--brand)' : 'var(--border)',
                color: filter === c.id ? '#FFFFFF' : 'var(--text)',
              }}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : allItems.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
        >
          <div className="text-5xl mb-3">📰</div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>No stories in this filter</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Try a different category or hit refresh — feeds update every few minutes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allItems.map((item, i) => <ItemCard key={(item.link || '') + i} item={item} />)}
        </div>
      )}

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-faint)' }}>
        News items link to original sources (BBC Sport, ESPN). We don't host the content.
      </p>
    </div>
  );
}
