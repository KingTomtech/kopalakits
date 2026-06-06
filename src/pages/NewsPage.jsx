import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Clock, AlertCircle, Play } from 'lucide-react';
import { RSS_FEEDS, fetchFeed, classify, getFeedHealth } from '../lib/rss.js';

// News categories for filtering
const NEWS_CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'zambia', label: 'Zambia' },
  { id: 'africa', label: 'Africa' },
  { id: 'world', label: 'Rest of World' },
  { id: 'kit-launches', label: 'Kit Launches' },
];

function relativeTime(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

function ItemCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"%3E%3C/rect%3E%3Cpath d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"%3E%3C/path%3E%3C/svg%3E';

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl overflow-hidden border transition hover:-translate-y-0.5 hover:shadow-lg kk-rise group"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {/* Image with proper error handling, lazy loading, and video overlay */}
      {item.image && !imageError && (
        <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 kk-skeleton" />
          )}
          <img
            src={item.image}
            alt={`Image for ${item.title}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {item.video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play size={16} className="text-[var(--danger)] ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
        </div>
      )}
      {(!item.image || imageError) && (
        <div
          className={`aspect-[16/9] flex items-center justify-center relative ${item.video ? 'bg-[var(--danger)]/10' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}
          role="img"
          aria-label={`Placeholder for ${item.title}`}
        >
          {item.video ? (
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[var(--danger)]/15 flex items-center justify-center">
                <Play size={16} className="text-[var(--danger)] ml-0.5" fill="currentColor" />
              </div>
              <span className="text-[10px] font-bold text-[var(--danger)]">VIDEO</span>
            </div>
          ) : (
            <img
              src={defaultImage}
              alt=""
              className="w-12 h-12 opacity-30"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      )}
      <div className="p-4">
        <div
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-2 flex-wrap"
          style={{ color: 'var(--text-faint)' }}
        >
          <span>{item.source}</span>
          {item.video && (
            <span className="px-1.5 py-0.5 rounded bg-[var(--danger)]/15 text-[var(--danger)]">VIDEO</span>
          )}
          {item.pubDate && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={10} aria-hidden="true" /> {relativeTime(item.pubDate)}
              </span>
            </>
          )}
        </div>
        <h3
          className="font-bold text-sm leading-snug line-clamp-3 group-hover:text-brand transition-colors"
          style={{ color: 'var(--text)' }}
        >
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {item.description}
          </p>
        )}
        <div
          className="mt-3 text-[10px] font-bold inline-flex items-center gap-1"
          style={{ color: 'var(--brand-deep)' }}
        >
          {item.video ? (
            <>
              <Play size={10} aria-hidden="true" fill="currentColor" /> Watch
            </>
          ) : (
            <>
              Read full story <ExternalLink size={10} aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden border animate-pulse"
      style={{ borderColor: 'var(--border)' }}
      aria-hidden="true"
    >
      <div className="aspect-[16/9] kk-skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 rounded kk-skeleton" />
        <div className="h-4 w-3/4 rounded kk-skeleton" />
        <div className="h-3 w-full rounded kk-skeleton" />
        <div className="h-3 w-2/3 rounded kk-skeleton" />
      </div>
    </div>
  );
}

function FeedStatusIndicator() {
  const [health, setHealth] = useState({});
  
  useEffect(() => {
    // Update health status periodically
    const updateHealth = () => setHealth(getFeedHealth());
    updateHealth();
    const interval = setInterval(updateHealth, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  const degradedCount = Object.values(health).filter(h => h.status === 'degraded').length;
  
  if (degradedCount === 0) return null;
  
  return (
    <div className="mt-3 text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
      <AlertCircle size={12} />
      <span>{degradedCount} feed(s) temporarily unavailable - retrying automatically</span>
    </div>
  );
}

export default function NewsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const isMountedRef = useRef(true);
  const lastRefreshRef = useRef(0);
  const MIN_REFRESH_MS = 15000; // 15 seconds minimum between refreshes
  const LOAD_MORE_INCREMENT = 12;

  const targetFeedIds = useMemo(() => {
    if (filter === 'zambia')       return RSS_FEEDS.filter((f) => f.tags?.includes('zambia')).map((f) => f.id);
    if (filter === 'africa')       return RSS_FEEDS.filter((f) => f.tags?.includes('africa')).map((f) => f.id);
    if (filter === 'kit-launches') return RSS_FEEDS.filter((f) => f.tags?.includes('kit-launches')).map((f) => f.id);
    return RSS_FEEDS.map((f) => f.id);
  }, [filter]);

  const loadFeeds = useCallback(async (feedIds, forceRefresh = false) => {
    try {
      const results = await Promise.all(
        feedIds.map((id) => fetchFeed(id, { force: forceRefresh }))
      );
      return results.filter(Boolean);
    } catch (error) {
      console.error('Failed loading target feeds:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    async function initLoad() {
      setLoading(true);
      const data = await loadFeeds(targetFeedIds, false);
      if (isMountedRef.current) {
        setFeeds((prev) => {
          const lookup = new Map(data.map((f) => [f.id, f]));
          const unchanged = prev.filter((f) => !lookup.has(f.id));
          return [...unchanged, ...data];
        });
        setLoading(false);
        setVisibleCount(12); // Reset visible count on filter change
      }
    }

    initLoad();
    return () => { isMountedRef.current = false; };
  }, [targetFeedIds, loadFeeds]);

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < MIN_REFRESH_MS) {
      console.log('Refresh too soon, skipping');
      return;
    }
    lastRefreshRef.current = now;
    
    if (refreshing || loading) return;
    
    setRefreshing(true);
    try {
      const data = await loadFeeds(targetFeedIds, true); // Force refresh
      if (isMountedRef.current) {
        setFeeds((prev) => {
          const lookup = new Map(data.map((f) => [f.id, f]));
          const unchanged = prev.filter((f) => !lookup.has(f.id));
          return [...unchanged, ...data];
        });
        setVisibleCount(12); // Reset visible count on refresh
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [targetFeedIds, loadFeeds, refreshing, loading]);

  const allItems = useMemo(() => {
    return feeds
      .flatMap((f) => (f?.items || []).map((i) => ({ ...i, _source: f.id })))
      .filter((item) => classify(item, filter))
      .filter((item, i, arr) => arr.findIndex((x) => x.link === item.link) === i)
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
  }, [feeds, filter]);

  const visibleItems = useMemo(() => {
    return allItems.slice(0, visibleCount);
  }, [allItems, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, allItems.length));
  }, [allItems.length]);

  const hasMore = visibleCount < allItems.length;

  // Infinite scroll with Intersection Observer (with fallback)
  const loadMoreRef = useRef(null);
  useEffect(() => {
    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback for older browsers - just show a button
      return;
    }
    
    if (!hasMore || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  const handleKeyDown = (e, categoryId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFilter(categoryId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <section
        className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--surface) 100%)' }}
      >
        <div className="flex items-start gap-3 mb-2">
          <Newspaper size={28} style={{ color: 'var(--brand-deep)' }} aria-hidden="true" />
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Soccer news
          </h1>
        </div>
        <p className="max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Live football news from local and global feeds. Cached for 30 minutes.
          Filter by region, league, or kit launches.
        </p>
        <div className="flex flex-wrap gap-2 mt-4" role="tablist" aria-label="News filters">
          {NEWS_CATEGORIES.map((c) => (
            <button
              key={c.id}
              id={`tab-${c.id}`}
              role="tab"
              aria-selected={filter === c.id}
              aria-controls={`panel-${c.id}`}
              onClick={() => setFilter(c.id)}
              onKeyDown={(e) => handleKeyDown(e, c.id)}
              tabIndex={filter === c.id ? 0 : -1}
              className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
              style={{
                backgroundColor: filter === c.id ? 'var(--brand)' : 'transparent',
                borderColor:     filter === c.id ? 'var(--brand)' : 'var(--border)',
                color:           filter === c.id ? '#FFFFFF'      : 'var(--text)',
              }}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            aria-label={refreshing ? 'Refreshing news…' : 'Refresh news'}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </div>
        <FeedStatusIndicator />
      </section>

      {loading ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Loading news stories…"
          aria-busy="true"
          role="status"
        >
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : visibleItems.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
          role="status"
          aria-live="polite"
        >
          <div className="text-5xl mb-3" aria-hidden="true">📰</div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>
            No stories in this filter
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Try a different category or hit refresh — feeds update every few minutes.
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            role="tabpanel"
            id={`panel-${filter}`}
            aria-labelledby={`tab-${filter}`}
          >
            {visibleItems.map((item) => <ItemCard key={item.link} item={item} />)}
          </div>
          
          {hasMore && (
            <div ref={loadMoreRef} className="text-center mt-8 py-4">
              <button
                onClick={loadMore}
                className="text-sm px-6 py-2 rounded-full border transition hover:bg-surface"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                aria-label="Load more stories"
              >
                Load more ({visibleCount} of {allItems.length})
              </button>
            </div>
          )}
          
          {!hasMore && allItems.length > 12 && (
            <p className="text-center text-xs mt-8" style={{ color: 'var(--text-faint)' }}>
              ✨ You've seen all {allItems.length} stories ✨
            </p>
          )}
        </>
      )}

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-faint)' }}>
        News items link to original sources. We don't host the content.
      </p>
    </div>
  );
}
