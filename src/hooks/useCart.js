import { useEffect, useState, useCallback, useMemo } from 'react';
import { CART_KEY } from '../constants.js';

const newCartId = () => Date.now() + Math.random();

/**
 * Cart state persisted to localStorage. Provides line-level operations
 * and a memoised count/total for the header badge.
 */
export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { void e; return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { void e;}
  }, [cart]);

  const add = useCallback((line) => {
    setCart((prev) => {
      const existing = prev.findIndex((it) => it.id === line.id && it.size === line.size);
      if (existing !== -1) {
        const next = [...prev];
        next[existing] = { ...next[existing], quantity: next[existing].quantity + line.quantity };
        return next;
      }
      return [...prev, { ...line, cartId: newCartId() }];
    });
  }, []);

  const remove = useCallback((cartId) => {
    setCart((prev) => prev.filter((it) => it.cartId !== cartId));
  }, []);

  const updateQty = useCallback((cartId, delta) => {
    setCart((prev) =>
      prev.flatMap((it) => {
        if (it.cartId !== cartId) return [it];
        const q = it.quantity + delta;
        if (q <= 0) return [];
        return [{ ...it, quantity: q }];
      })
    );
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((s, it) => s + it.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((s, it) => s + it.price * it.quantity, 0), [cart]);

  return { cart, add, remove, updateQty, clear, count, total };
}
