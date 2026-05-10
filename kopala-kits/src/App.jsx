import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MapPin, MessageCircle, ShoppingCart, Moon, Sun, X, Heart } from 'lucide-react';

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

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  desc: string;
  image: string;
}

interface CartItem extends Product {
  size: string;
  quantity: number;
  cartId: number;
}

const products: Product[] = [
  { id: 1, name: "Man United 25/26 Home", price: 450, category: "International", desc: "Theatre of Dreams edition", image: "https://picsum.photos/id/1015/600/600" },
  { id: 2, name: "Arsenal 25/26 Home", price: 450, category: "International", desc: "Gothic-inspired red & white", image: "https://picsum.photos/id/102/600/600" },
  { id: 3, name: "Chipolopolo Home 2026", price: 420, category: "Local", desc: "Zambia National Team", image: "https://picsum.photos/id/1060/600/600" },
  { id: 4, name: "Real Madrid 25/26 Home", price: 450, category: "International", desc: "Bernabéu White", image: "https://picsum.photos/id/1074/600/600" },
  { id: 5, name: "Power Dynamos Home 25/26", price: 400, category: "Local", desc: "Aba Yellow official replica", image: "https://picsum.photos/id/201/600/600" },
  { id: 6, name: "Chelsea 25/26 Home", price: 450, category: "International", desc: "The Blues", image: "https://picsum.photos/id/133/600/600" },
  { id: 7, name: "ZESCO United Home 25/26", price: 400, category: "Local", desc: "Electricity Boys", image: "https://picsum.photos/id/180/600/600" },
  { id: 8, name: "Liverpool 25/26 Home", price: 450, category: "International", desc: "You'll Never Walk Alone", image: "https://picsum.photos/id/201/600/600" },
  { id: 9, name: "Nkana FC Home 25/26", price: 380, category: "Local", desc: "Kalampa Red Army", image: "https://picsum.photos/id/251/600/600" },
];

export default function KopalaKits() {
  const [filter, setFilter] = useState<'All' | 'International' | 'Local'>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [priceRange, setPriceRange] = useState([300, 500]);

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Load saved data
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedDark = localStorage.getItem('darkMode');
    if (savedDark) setDarkMode(JSON.parse(savedDark));
  }, []);

  // Close cart with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleWishlist = (id: number) => {
    const newList = wishlist.includes(id)
      ? wishlist.filter(i => i !== id)
      : [...wishlist, id];
    setWishlist(newList);
    localStorage.setItem('wishlist', JSON.stringify(newList));
  };

  const filteredProducts = useMemo(() => {
    let result = filter === 'All' ? products : products.filter(p => p.category === filter);
    return result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  }, [filter, priceRange]);

  const addToCart = useCallback((product: Product) => {
    const size = selectedSizes[product.id] || 'M';
    const qty = quantities[product.id] || 1;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.size === size);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prev, {
        ...product,
        size,
        quantity: qty,
        cartId: Date.now() + Math.floor(Math.random() * 10000)
      }];
    });

    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  }, [selectedSizes, quantities]);

  const removeFromCart = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: number, newQty: number) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQty } : item
    ));
  };

  const sendSingleItemToWhatsApp = (product: Product) => {
    const size = selectedSizes[product.id] || 'M';
    const qty = quantities[product.id] || 1;
    const phone = "260776885851";

    const msg = `Hi Kopala Kits!\n\nI would like to buy:\n• ${product.name}\n• Size: ${size}\n• Quantity: ${qty}\n• Price per unit: K${product.price}\nTotal: K${product.price * qty}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
        <nav className="sticky top-0 z-50 border-b px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--soft-cream)' }}>
          <h1 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* HERO + FILTERS */}
        <header className="text-white px-6 py-12 text-center" style={{ backgroundColor: 'var(--dusty-olive)' }}>
          <h2 className="text-4xl md:text-5xl font-bold">25/26 Season Kits</h2>
          <p className="mt-3 opacity-90">Premium Quality • Copperbelt Delivery</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['All', 'International', 'Local'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat as 'All' | 'International' | 'Local')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${filter === cat ? 'bg-white text-black shadow' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="mt-6 max-w-md mx-auto px-4">
            <p className="text-sm mb-2">Price Range: K{priceRange[0]} – K{priceRange[1]}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="range"
                min="300"
                max="500"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full accent-[var(--dusty-olive)]"
              />
              <input
                type="range"
                min="300"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[var(--dusty-olive)]"
              />
            </div>
          </div>
        </header>

        {/* PRODUCT GRID */}
        <main className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const size = selectedSizes[product.id] || 'M';
            const qty = quantities[product.id] || 1;
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div key={product.id} className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[var(--khaki-light)]">
                <div className="relative h-64 bg-gradient-to-br from-amber-50 to-stone-100 dark:from-zinc-800 flex items-center justify-center p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-52 h-52 object-contain transition-transform duration-500 hover:scale-110"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-white"
                  >
                    <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"} />
                  </button>
                </div>

                <div className="p-5">
                  <span className="uppercase text-xs font-bold text-[var(--khaki-dark)]">{product.category}</span>
                  <h3 className="font-bold text-lg mt-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.desc}</p>
                  <p className="font-black text-2xl mt-3" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</p>

                  {/* Size Selector */}
                  <div className="mt-4">
                    <p className="text-xs mb-2 font-medium">SIZE</p>
                    <div className="flex gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: s }))}
                          className={`w-9 h-9 rounded-xl text-sm border transition-all ${size === s ? 'bg-[var(--dusty-olive)] text-white' : 'hover:border-gray-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 mt-5">
                    <span className="text-sm font-medium">Qty</span>
                    <div className="flex border rounded-2xl">
                      <button onClick={() => setQuantities(p => ({ ...p, [product.id]: Math.max(1, (p[product.id] || 1) - 1) }))} className="px-3 py-1">-</button>
                      <span className="px-5 py-1 font-semibold">{qty}</span>
                      <button onClick={() => setQuantities(p => ({ ...p, [product.id]: (p[product.id] || 1) + 1 }))} className="px-3 py-1">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => addToCart(product)}
                      className="py-3.5 rounded-2xl border-2 border-[var(--dusty-olive)] font-bold hover:bg-[var(--dusty-olive)] hover:text-white transition"
                    >
                      ADD TO CART
                    </button>
                    <button
                      onClick={() => sendSingleItemToWhatsApp(product)}
                      className="py-3.5 rounded-2xl text-white font-bold"
                      style={{ backgroundColor: 'var(--primary-btn)' }}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* CART DRAWER */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
            
            <div className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Cart ({totalItems})</h2>
                <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 mt-20">Your cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.cartId} className="flex gap-4 border-b pb-6">
                      <img src={item.image} alt={item.name} loading="lazy" className="w-20 h-20 object-contain" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                        <p className="font-bold">K{item.price}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)} aria-label="Decrease quantity">-</button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)} aria-label="Increase quantity">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-sm">Remove</button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t">
                  <div className="flex justify-between text-xl font-bold mb-6">
                    <span>Total</span>
                    <span>K{totalPrice}</span>
                  </div>
                  <button
                    onClick={() => { sendCartToWhatsApp(); setIsCartOpen(false); }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 transition"
                    style={{ backgroundColor: 'var(--primary-btn)' }}
                  >
                    <MessageCircle size={24} /> ORDER VIA WHATSAPP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="p-8 text-center text-sm border-t" style={{ backgroundColor: 'var(--champagne-light)' }}>
          © 2026 Kopala Kits • Built for the Copperbelt
        </footer>
      </div>
    </>
  );
}
