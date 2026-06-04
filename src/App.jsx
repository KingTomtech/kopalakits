import { useState, useMemo, useEffect, useCallback } from 'react';
import { ShoppingCart, Moon, Sun, X, Heart, Plus, Menu, Search, MessageCircle, Loader2 } from 'lucide-react';
import { STORAGE_KEY, BANNER_KEY, CATEGORIES, SIZES, WISHLIST_KEY, DARK_MODE_KEY, PHONE_FALLBACK } from './constants.js';

const styleVars = `
  :root {
    --champagne-light: #FDF7F0;
    --champagne-mist: #F5EBE0;
    --soft-cream: #FFFCF8;
    --khaki-beige: #D8C3A5;
    --khaki-light: #EADDC6;
    --khaki-dark: #A68A64;
    --dusty-olive: #5E6B3C;
    --dusty-olive-dark: #3F4A26;
    --charcoal-accent: #2E2C2A;
    --primary-btn: #5E6B3C;
  }
  .dark {
    --champagne-light: #1C1B19;
    --champagne-mist: #2A2825;
    --soft-cream: #252321;
    --khaki-beige: #8C7A5E;
    --khaki-light: #6B5A44;
    --khaki-dark: #D4B88A;
    --dusty-olive: #A8B68A;
    --dusty-olive-dark: #C5D4A8;
    --charcoal-accent: #F5F0E8;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;


export default function KopalaKits({ onAdminAccess }) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedQty, setSelectedQty] = useState(1);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [banner, setBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [phone, setPhone] = useState(PHONE_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        try {
          const res = await fetch('/products.json');
          const data = await res.json();
          setProducts(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          setLoadError('Could not load products. Please check your connection.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBanner = useCallback(async () => {
    try {
      const res = await fetch('/api/banner');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBanner(data);
      localStorage.setItem(BANNER_KEY, JSON.stringify(data));
    } catch {
      const stored = localStorage.getItem(BANNER_KEY);
      if (stored) setBanner(JSON.parse(stored));
    }
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.phone) setPhone(data.phone);
    } catch {
      // keep default
    }
  }, []);

  useEffect(() => {
    // Initial data load + localStorage hydration on mount. The state updates
    // here are async fetch completions, not cascading renders. The
    // react-hooks/set-state-in-effect rule is suppressed for the synchronous
    // localStorage hydration block, which is the standard mount pattern.
    /* eslint-disable react-hooks/set-state-in-effect */
    loadProducts();
    loadBanner();
    loadConfig();

    const savedWishlist = localStorage.getItem(WISHLIST_KEY);
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedDark = localStorage.getItem(DARK_MODE_KEY);
    if (savedDark) {
      const isDark = JSON.parse(savedDark);
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleStorageChange = () => {
      const fresh = localStorage.getItem(STORAGE_KEY);
      if (fresh) setProducts(JSON.parse(fresh));
      loadBanner();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kopala_products_updated', handleStorageChange);
    window.addEventListener('kopala_banner_updated', loadBanner);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kopala_products_updated', handleStorageChange);
      window.removeEventListener('kopala_banner_updated', loadBanner);
    };
  }, [loadProducts, loadBanner, loadConfig]);

  const handleLogoClick = () => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (next >= 5) { setLogoClickCount(0); onAdminAccess(); }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleWishlist = (id) => {
    const newList = wishlist.includes(id) ? wishlist.filter(i => i !== id) : [...wishlist, id];
    setWishlist(newList);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(newList));
  };

  const filteredProducts = useMemo(() => {
    let result = filter === 'All' ? products : products.filter(p => p.category === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, searchQuery, products]);

  const openQuickAdd = (product) => {
    setQuickAddProduct(product);
    setSelectedSize('M');
    setSelectedQty(1);
  };

  const addToCart = () => {
    if (!quickAddProduct) return;
    setCart(prev => {
      const existing = prev.findIndex(item => item.id === quickAddProduct.id && item.size === selectedSize);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].quantity += selectedQty;
        return updated;
      }
      return [...prev, { ...quickAddProduct, size: selectedSize, quantity: selectedQty, cartId: Date.now() + Math.random() }];
    });
    setQuickAddProduct(null);
  };

  const removeFromCart = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));

  const totalPrice = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const sendCartToWhatsApp = () => {
    const items = cart.map(item => `- ${item.name} (Size: ${item.size}, Qty: ${item.quantity}) - K${item.price * item.quantity}`).join(' | ');
    const msg = `Hi Kopala Kits! I'd like to order the following jerseys: ${items}. Total: K${totalPrice}. Please confirm availability and delivery details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent('Hi Kopala Kits! I have a question about your jerseys.')}`, '_blank');
  };

  const sizes = SIZES;

  return (
    <>
      <style>{styleVars}</style>
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--champagne-light)' }}>
        {banner && banner.active && !bannerDismissed && (
          <div className="relative z-50 text-center text-sm font-semibold py-2.5 px-4" style={{ backgroundColor: 'var(--dusty-olive)', color: '#fff' }}>
            {banner.text}
            <button onClick={() => setBannerDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}
        <nav className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ backgroundColor: 'var(--champagne-mist)' }} role="navigation">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={handleLogoClick} className="flex items-center gap-2 group" aria-label="Kopala Kits home">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm" style={{ backgroundColor: 'var(--dusty-olive)' }}>K</div>
              <span className="font-black text-lg tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-2xl hover:bg-black/5 transition" aria-label="Open cart">
                <ShoppingCart size={20} style={{ color: 'var(--charcoal-accent)' }} />
                {cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--dusty-olive)' }}>{cart.length}</span>}
              </button>
              <button onClick={toggleDarkMode} className="p-2.5 rounded-2xl hover:bg-black/5 transition" aria-label="Toggle dark mode">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setIsMenuOpen(true)} className="p-2.5 rounded-2xl hover:bg-black/5 transition md:hidden" aria-label="Open menu">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search jerseys..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 text-sm font-medium focus:outline-none transition"
              style={{ borderColor: 'var(--khaki-beige)', backgroundColor: 'var(--soft-cream)' }}
            />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-2 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm border-2 ${filter === cat ? 'text-white' : 'hover:bg-black/5'}`}
                style={{
                  backgroundColor: filter === cat ? 'var(--dusty-olive)' : 'transparent',
                  borderColor: filter === cat ? 'var(--dusty-olive)' : 'var(--khaki-beige)',
                  color: filter === cat ? '#fff' : 'var(--charcoal-accent)'
                }}
              >
                {cat === 'All' ? 'All Kits' : cat === 'Retro' ? '🏆 Retro' : cat}
              </button>
            ))}
          </div>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--dusty-olive)' }} />
            <p className="text-sm text-gray-500">Loading kits...</p>
          </div>
        )}
        {loadError && !loading && (
          <div className="max-w-4xl mx-auto px-4 py-8 text-center">
            <p className="text-red-500 font-medium">{loadError}</p>
            <button onClick={loadProducts} className="mt-3 px-4 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--dusty-olive)', color: '#fff' }}>Retry</button>
          </div>
        )}
        {!loading && (
          <main className="max-w-4xl mx-auto px-4 py-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-semibold">No jerseys found</p>
                <p className="text-sm">Try a different search or category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <div key={product.id} className="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition bg-white dark:bg-zinc-900" style={{ borderColor: 'var(--khaki-beige)' }}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.image || product.img}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={e => { e.target.src = 'https://via.placeholder.com/400?text=Jersey+Coming+Soon'; }}
                      />
                      {product.soldOut && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">SOLD OUT</span>}
                      {product.newArrival && <span className="absolute top-2 right-2 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-lg">NEW</span>}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${wishlist.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'}`}
                        aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart size={14} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--khaki-dark)' }}>{product.category}</span>
                      <h3 className="font-bold text-sm leading-tight mt-0.5" style={{ color: 'var(--charcoal-accent)' }}>{product.name}</h3>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--khaki-dark)' }}>{product.desc}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-black" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</span>
                        <button
                          onClick={() => openQuickAdd(product)}
                          disabled={product.soldOut}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${product.soldOut ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'text-white hover:brightness-110 shadow-md'}`}
                          style={{ backgroundColor: product.soldOut ? undefined : 'var(--dusty-olive)' }}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}
        {quickAddProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="relative">
                <img src={quickAddProduct.image || quickAddProduct.img} alt={quickAddProduct.name} className="w-full h-56 object-cover" />
                <button onClick={() => setQuickAddProduct(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--khaki-dark)' }}>{quickAddProduct.category}</span>
                  <h3 className="font-bold text-lg mt-0.5" style={{ color: 'var(--charcoal-accent)' }}>{quickAddProduct.name}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--khaki-dark)' }}>{quickAddProduct.desc}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block">Size</span>
                  <div className="flex gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={`w-10 h-10 rounded-xl text-sm font-bold border-2 transition ${selectedSize === s ? 'text-white' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'}`} style={{ backgroundColor: selectedSize === s ? 'var(--dusty-olive)' : undefined, borderColor: selectedSize === s ? 'var(--dusty-olive)' : 'var(--khaki-beige)' }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--khaki-beige)' }}>-</button>
                    <span className="w-8 text-center font-bold text-lg">{selectedQty}</span>
                    <button onClick={() => setSelectedQty(selectedQty + 1)} className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--khaki-beige)' }}>+</button>
                  </div>
                </div>
                <button onClick={addToCart} className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 hover:brightness-110 transition shadow-lg" style={{ backgroundColor: 'var(--dusty-olive)' }}>
                  <ShoppingCart size={20} /> Add K{quickAddProduct.price * selectedQty} to Cart
                </button>
              </div>
            </div>
          </div>
        )}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setIsCartOpen(false)}>
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-black text-lg" style={{ color: 'var(--charcoal-accent)' }}>Your Cart ({cart.length})</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm mt-1">Browse our kits and add your favourites.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex gap-3 p-3 rounded-2xl border bg-gray-50 dark:bg-zinc-800" style={{ borderColor: 'var(--khaki-beige)' }}>
                      <img src={item.image || item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold" style={{ color: 'var(--dusty-olive)' }}>K{item.price * item.quantity}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl self-start transition"><X size={16} /></button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t space-y-3 bg-white dark:bg-zinc-900">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Total</span>
                    <span className="text-2xl font-black" style={{ color: 'var(--dusty-olive)' }}>K{totalPrice}</span>
                  </div>
                  <button onClick={() => { sendCartToWhatsApp(); setIsCartOpen(false); }} className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 hover:brightness-110 transition shadow-lg" style={{ backgroundColor: '#25D366' }}>
                    <MessageCircle size={22} /> ORDER VIA WHATSAPP
                  </button>
                  <p className="text-xs text-center text-gray-400">We'll confirm your order and delivery details via WhatsApp</p>
                </div>
              )}
            </div>
          </div>
        )}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-white dark:bg-zinc-900 w-3/4 max-w-xs h-full p-6 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-xl tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>MENU</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
              </div>
              <nav className="space-y-2 flex-1">
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <button key={cat} onClick={() => { setFilter(cat); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                    {cat === 'Retro' ? '🏆 Retro Classics' : cat + ' Teams'}
                  </button>
                ))}
              </nav>
              <div className="border-t pt-4 space-y-2">
                <button onClick={() => { toggleDarkMode(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}{darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="border-t mt-4" style={{ backgroundColor: 'var(--champagne-mist)' }} role="contentinfo">
          <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-black text-xl tracking-tighter mb-2" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Premium soccer jerseys for every fan. Local, international, national &amp; retro classics — all at the best prices in Kitwe.</p>
              <button onClick={openWhatsApp} className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-bold transition">
                <MessageCircle size={16} /> Chat with Us
              </button>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-gray-500">Browse</h4>
              <ul className="space-y-2 text-sm">
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <li key={cat}>
                    <button onClick={() => { setFilter(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[var(--dusty-olive)] transition font-medium">
                      {cat === 'Retro' ? '🏆 Retro Classics' : cat + ' Teams'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-gray-500">Find Us</h4>
              <address className="not-italic text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                <p>📍 K-Block, Copperbelt University</p>
                <p>Kitwe, Copperbelt Province, Zambia</p>
                <p className="mt-2">📱 <a href={`https://wa.me/${phone}`} className="hover:text-[var(--dusty-olive)] transition font-medium">+{phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}</a></p>
              </address>
              <p className="text-xs text-gray-400 mt-4">Mon–Fri 8am–6pm · Sat 9am–4pm</p>
            </div>
          </div>
          <div className="border-t px-6 py-4 text-center text-xs text-gray-400">
            © 2026 Kopala Kits · Kitwe, Zambia · All prices in Zambian Kwacha (ZMW)
          </div>
        </footer>
        <button onClick={openWhatsApp} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95" style={{ backgroundColor: '#25D366' }} aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
          <MessageCircle size={28} className="text-white" />
        </button>
      </div>
    </>
  );
}
