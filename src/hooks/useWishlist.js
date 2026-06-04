import { useEffect, useState, useCallback } from 'react';
import { WISHLIST_KEY } from '../constants.js';

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { void e; return []; }  /* swallow parse errors */
  });

  useEffect(() => {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); } catch (e) { void e;}
  }, [wishlist]);

  const toggle = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const has = useCallback((id) => wishlist.includes(id), [wishlist]);

  return { wishlist, toggle, has };
}
