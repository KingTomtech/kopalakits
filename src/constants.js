/**
 * Shared constants for Kopala Kits.
 * Centralised so App.jsx and AdminDashboard.jsx never drift out of sync.
 */

export const STORAGE_KEY = 'kopala_products_v4';
export const BANNER_KEY = 'kopala_banner';
export const AUTH_TOKEN_KEY = 'kopala_admin_token';
export const WISHLIST_KEY = 'wishlist';
export const DARK_MODE_KEY = 'darkMode';

export const CATEGORIES = ['All', 'Local', 'International', 'Leagues', 'Retro'];
export const ADMIN_CATEGORIES = ['Local', 'International', 'Leagues', 'Retro'];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const PHONE_FALLBACK = '260770713619';
export const DEFAULT_CURRENCY = 'ZMW';

export const CART_KEY = 'kopala_cart';

// Self-hosted SVG fallback shown when a product image fails to load.
// Decoded inline so we never need a network round-trip to render it.
export const IMAGE_FALLBACK = '/jerseys/placeholder.svg';
