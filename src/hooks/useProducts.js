import { useEffect, useState, useCallback } from 'react';
import { STORAGE_KEY, BANNER_KEY } from '../constants.js';

const FALLBACK_BANNER = { text: '', active: false };

/**
 * Loads /api/products with a localStorage fallback for offline. Also loads
 * the announcement banner. The banner can be dismissed per session (resets
 * on reload by design — banners should reappear each visit).
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [banner, setBanner] = useState(null);
  const [, setBannerDismissed] = useState(false);

  const loadProducts = useCallback(async (signal) => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/products', { signal });
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) {
        setProducts(data);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { void e;}
      }
    } catch (e) { void e;
      if (signal?.aborted) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setProducts(JSON.parse(stored));
      } catch (e) { void e;}
      try {
        const res = await fetch('/products.json', { signal });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setProducts(data);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { void e;}
        }
      } catch (e) { void e;
        if (signal?.aborted) return;
        setLoadError('Could not load products. Please check your connection.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const loadBanner = useCallback(async (signal) => {
    try {
      const res = await fetch('/api/banner', { signal });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setBanner(data || FALLBACK_BANNER);
        try { localStorage.setItem(BANNER_KEY, JSON.stringify(data)); } catch (e) { void e;}
        return;
      }
    } catch (e) { void e;}
    if (signal?.aborted) return;
    try {
      const stored = localStorage.getItem(BANNER_KEY);
      if (stored) setBanner(JSON.parse(stored));
    } catch (e) { void e;}
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts(controller.signal);
    loadBanner(controller.signal);
    return () => controller.abort();
    const handler = () => {
      try {
        const fresh = localStorage.getItem(STORAGE_KEY);
        if (fresh) setProducts(JSON.parse(fresh));
      } catch (e) { void e;}
      loadBanner();
    };
    window.addEventListener('storage', handler);
    window.addEventListener('kopala_products_updated', handler);
    window.addEventListener('kopala_banner_updated', loadBanner);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('kopala_products_updated', handler);
      window.removeEventListener('kopala_banner_updated', loadBanner);
    };
  }, [loadProducts, loadBanner]);

  const dismissBanner = useCallback(() => setBannerDismissed(true), []);

  return { products, loading, loadError, reload: loadProducts, banner, dismissBanner };
}
