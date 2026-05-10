import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Moon, Sun, X, Heart, Plus, Menu, Search, User } from 'lucide-react';

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
`;

const products = [ /* ... same products array as before ... */ ];

export default function KopalaKits() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark) {
      const isDark = JSON.parse(savedDark);
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleWishlist = (id) => {
    const newList = wishlist.includes(id) ? wishlist.filter(i => i !== id) : [...wishlist, id];
    setWishlist(newList);
    localStorage.setItem('wishlist', JSON.stringify(newList));
  };

  const filteredProducts = useMemo(() => {
    let result = filter === 'All' ? products : products.filter(p => p.category === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, searchQuery]);

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
      return [...prev, { ...quickAddProduct, size: selectedSize, quantity: selectedQty, cartId: Date.now() }];
    });
    setQuickAddProduct(null);
  };

  const removeFromCart = (cartId) => setCart(prev => prev.filter(item => item.cartId !== cartId));
  const updateCartQuantity = (cartId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQty } : item));
  };

  const sendCartToWhatsApp = () => {
    const phone = "260776885851";
    let msg = "Hi Kopala Kits!\n\nI would like to order:\n\n";
    cart.forEach(item => {
      msg += `• ${item.name} - Size ${item.size} × ${item.quantity} - K${item.price * item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    msg += `\nTotal: K${total}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <style>{styleVars}</style>
      <div className="min-h-screen font-sans transition-colors" style={{ backgroundColor: 'var(--champagne-light)', color: 'var(--charcoal-accent)' }}>
        
        {/* NAVIGATION - Mobile Optimized */}
        <nav className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--soft-cream)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10">
              <Menu size={26} />
            </button>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h1>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <button className="p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10">
              <Search size={24} />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10">
              <User size={24} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* SLIDING MENU, HERO, QUICK ADD MODAL remain the same as previous version */}

        {/* HERO + SEARCH */}
        <header className="text-white px-5 py-12 md:py-16 text-center" style={{ backgroundColor: 'var(--dusty-olive)' }}>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">25/26 Season Kits</h2>
          <p className="mt-3 text-base md:text-lg opacity-90">Premium Quality • Copperbelt Delivery</p>

          <div className="mt-8 max-w-lg mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jerseys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl py-4 pl-12 pr-6 text-white placeholder:text-white/70 focus:outline-none"
              />
              <Search className="absolute left-5 top-4.5 text-white/70" size={22} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8">
            {['All', 'Local', 'International', 'National'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 md:px-8 md:py-3 rounded-3xl text-sm font-semibold transition-all ${filter === cat ? 'bg-white text-black shadow-lg' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* PRODUCT GRID - Mobile Optimized */}
        <main className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-[var(--khaki-light)] flex flex-col">
              <div className="relative h-56 md:h-72 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-zinc-800 flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-44 h-44 md:w-56 md:h-56 object-contain transition-transform duration-700 group-hover:scale-110"
                />
                
                <button onClick={() => toggleWishlist(product.id)} className="absolute top-4 right-4 p-2.5 bg-white rounded-2xl shadow hover:bg-white">
                  <Heart size={20} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"} />
                </button>

                <button onClick={() => openQuickAdd(product)} className="absolute bottom-4 right-4 w-12 h-12 md:w-14 md:h-14 bg-[var(--dusty-olive)] text-white rounded-2xl flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                  <Plus size={26} />
                </button>
              </div>

              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <span className="uppercase text-xs tracking-widest font-bold text-[var(--khaki-dark)]">{product.category}</span>
                <h3 className="font-bold text-base md:text-lg mt-2 line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 flex-1">{product.desc}</p>
                
                <div className="mt-4">
                  <p className="font-black text-3xl md:text-4xl" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* CART DRAWER */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
              {/* Cart Header & Content (same as before) */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Cart ({totalItems})</h2>
                <button onClick={() => setIsCartOpen(false)}><X size={28} /></button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-20">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex gap-4 border-b pb-6 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                        <p className="font-bold">K{item.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center">-</button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm self-start">Remove</button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t space-y-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>K{totalPrice}</span>
                  </div>

                  <button onClick={() => { sendCartToWhatsApp(); setIsCartOpen(false); }} className="w-full py-4 rounded-2xl text-white font-bold text-lg" style={{ backgroundColor: 'var(--primary-btn)' }}>
                    💬 ORDER VIA WHATSAPP
                  </button>

                  <button 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
                    className="w-full py-4 rounded-2xl border-2 border-[var(--dusty-olive)] font-bold hover:bg-[var(--dusty-olive)] hover:text-white transition"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHECKOUT MODAL */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl">
              <div className="text-6xl mb-6">🛠️</div>
              <h3 className="text-2xl font-bold mb-3">Checkout Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Mobile Money integration is being finalized. For now, please use WhatsApp ordering.</p>
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="w-full py-4 bg-[var(--dusty-olive)] text-white font-bold rounded-2xl hover:brightness-110"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="p-8 md:p-10 text-center text-sm border-t" style={{ backgroundColor: 'var(--champagne-light)' }}>
          © 2026 Kopala Kits • Built for the Copperbelt
        </footer>
      </div>
    </>
  );
}
