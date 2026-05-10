import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

const products = [
  { id: 1, name: "Mufulira Wanderers 2025/26 Home Jersey", price: 520, category: "Local", desc: "Green and white stripes home kit of Mighty Mufulira Wanderers.", image: "https://images.unsplash.com/photo-1622473596135-7b2c3c5b5a5e?w=800" },
  { id: 2, name: "Kabwe Warriors 2024/25 Home Jersey", price: 480, category: "Local", desc: "Sky blue and white home jersey.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" },
  { id: 3, name: "Nkana FC 2024/25 Home Jersey", price: 500, category: "Local", desc: "Classic orange/red and white home jersey.", image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800" },
  { id: 4, name: "Power Dynamos 2025/26 Home Jersey", price: 490, category: "Local", desc: "Iconic yellow Aba Yellow home kit.", image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800" },

  { id: 5, name: "Manchester United 2025/26 Home Jersey", price: 650, category: "International", desc: "Classic red home jersey.", image: "https://images.unsplash.com/photo-1610296669223-3a1d4c8c7f8c?w=800" },
  { id: 6, name: "Liverpool FC 2025/26 Home Jersey", price: 750, category: "International", desc: "Iconic red home kit.", image: "https://images.unsplash.com/photo-1553778735-8c8d8e1b7c6f?w=800" },
  { id: 7, name: "Arsenal 2025/26 Home Jersey", price: 700, category: "International", desc: "Red and white home jersey.", image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800" },
  { id: 8, name: "Real Madrid 2025/26 Home Jersey", price: 800, category: "International", desc: "All-white home jersey.", image: "https://images.unsplash.com/photo-1612810808-4e4f4e4e4e?w=800" },
  { id: 9, name: "Barcelona 2025/26 Home Jersey", price: 780, category: "International", desc: "Blaugrana striped home kit.", image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800" },

  { id: 13, name: "Zambia National Team 2025/26 Home Jersey", price: 600, category: "National", desc: "Chipolopolo green home jersey.", image: "https://images.unsplash.com/photo-1553778735-8c8d8e1b7c6f?w=800" },
  { id: 14, name: "England National Team 2025/26 Home Jersey", price: 700, category: "National", desc: "Three Lions classic white home kit.", image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=800" },
  { id: 15, name: "Argentina National Team 2025/26 Home Jersey", price: 760, category: "National", desc: "La Albiceleste blue and white stripes.", image: "https://images.unsplash.com/photo-1612810808-4e4f4e4e4e?w=800" },
];

export default function KopalaKits() {
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

  // Load saved data
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
    const newList = wishlist.includes(id)
      ? wishlist.filter(i => i !== id)
      : [...wishlist, id];
    setWishlist(newList);
    localStorage.setItem('wishlist', JSON.stringify(newList));
  };

  const filteredProducts = useMemo(() => {
    let result = filter === 'All' 
      ? products 
      : products.filter(p => p.category === filter);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.desc.toLowerCase().includes(q)
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
      const existing = prev.findIndex(item => 
        item.id === quickAddProduct.id && item.size === selectedSize
      );
      
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing].quantity += selectedQty;
        return updated;
      }
      
      return [...prev, {
        ...quickAddProduct,
        size: selectedSize,
        quantity: selectedQty,
        cartId: Date.now() + Math.floor(Math.random() * 10000)
      }];
    });

    setQuickAddProduct(null);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQty } : item
    ));
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
        
        {/* NAVIGATION */}
        <nav className="sticky top-0 z-50 border-b px-4 py-4 flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--soft-cream)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-3 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10">
              <Menu size={26} />
            </button>
            <h1 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10">
              <Search size={24} />
            </button>
            <button className="p-3 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10">
              <User size={24} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-3">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* SLIDING MENU */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[300] flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
            <div className="relative w-80 h-full bg-white dark:bg-zinc-900 shadow-2xl p-8">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)}><X size={28} /></button>
              </div>
              <div className="space-y-6 text-lg">
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">Home</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">Shop All Kits</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">Local Teams</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">International Clubs</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">National Teams</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">Wishlist</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">About Us</a>
                <a href="#" className="block py-3 hover:text-[var(--dusty-olive)] font-medium">Contact</a>
              </div>
            </div>
          </div>
        )}

        {/* HERO + CATEGORY FILTERS + SEARCH */}
        <header className="text-white px-6 py-16 text-center" style={{ backgroundColor: 'var(--dusty-olive)' }}>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">25/26 Season Kits</h2>
          <p className="mt-4 text-lg opacity-90">Premium Quality • Copperbelt Delivery</p>

          {/* Search Bar */}
          <div className="mt-10 max-w-lg mx-auto px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jerseys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl py-4 pl-12 pr-6 text-white placeholder:text-white/70 focus:outline-none focus:border-white"
              />
              <Search className="absolute left-5 top-4 text-white/70" size={24} />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {['All', 'Local', 'International', 'National'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-3xl text-sm font-semibold transition-all ${filter === cat 
                  ? 'bg-white text-black shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* PRODUCT GRID */}
        <main className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[var(--khaki-light)] relative">
              <div className="relative h-72 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-zinc-800 flex items-center justify-center p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-56 h-56 object-contain transition-transform duration-700 group-hover:scale-110"
                />
                
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-5 right-5 p-3 bg-white rounded-2xl shadow-md hover:bg-white transition"
                >
                  <Heart size={20} className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"} />
                </button>

                <button
                  onClick={() => openQuickAdd(product)}
                  className="absolute bottom-6 right-6 w-14 h-14 bg-[var(--dusty-olive)] text-white rounded-2xl flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <Plus size={28} />
                </button>
              </div>

              <div className="p-6">
                <span className="uppercase text-xs tracking-widest font-bold text-[var(--khaki-dark)]">{product.category}</span>
                <h3 className="font-bold text-lg mt-2 line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{product.desc}</p>
                
                <div className="mt-5 flex items-end justify-between">
                  <p className="font-black text-4xl" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </main>

        {/* QUICK ADD MODAL */}
        {quickAddProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-8 shadow-2xl">
              <h3 className="font-bold text-2xl mb-6">{quickAddProduct.name}</h3>
              
              <div className="mb-8">
                <p className="text-sm mb-3 font-medium">Select Size</p>
                <div className="grid grid-cols-5 gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-4 rounded-2xl border text-sm font-semibold transition-all ${selectedSize === s 
                        ? 'bg-[var(--dusty-olive)] text-white border-[var(--dusty-olive)]' 
                        : 'hover:border-gray-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm mb-3 font-medium">Quantity</p>
                <div className="flex items-center justify-center gap-8">
                  <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="w-14 h-14 text-4xl hover:bg-gray-100 rounded-2xl transition">-</button>
                  <span className="text-5xl font-bold w-20 text-center">{selectedQty}</span>
                  <button onClick={() => setSelectedQty(selectedQty + 1)} className="w-14 h-14 text-4xl hover:bg-gray-100 rounded-2xl transition">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setQuickAddProduct(null)} className="py-4 rounded-2xl border font-semibold hover:bg-gray-100">Cancel</button>
                <button onClick={addToCart} className="py-4 rounded-2xl bg-[var(--dusty-olive)] text-white font-bold hover:brightness-110">Add to Cart</button>
              </div>
            </div>
          </div>
        )}

        {/* CART DRAWER - Fully Fixed */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
            
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                        <p className="font-bold">K{item.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100">-</button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm self-start mt-1">Remove</button>
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

                  <button
                    onClick={() => { sendCartToWhatsApp(); setIsCartOpen(false); }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition"
                    style={{ backgroundColor: 'var(--primary-btn)' }}
                  >
                    💬 ORDER VIA WHATSAPP
                  </button>

                  <button
                    onClick={() => { alert("Mobile Money Checkout - Coming Soon!"); setIsCartOpen(false); }}
                    className="w-full py-4 rounded-2xl border-2 border-[var(--dusty-olive)] font-bold hover:bg-[var(--dusty-olive)] hover:text-white transition"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="p-10 text-center text-sm border-t" style={{ backgroundColor: 'var(--champagne-light)' }}>
          © 2026 Kopala Kits • Built for the Copperbelt
        </footer>
      </div>
    </>
  );
}
