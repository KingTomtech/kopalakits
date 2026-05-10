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

const products = [
  // === ZAMBIAN LOCAL CLUBS (Super League) ===
  { id: 1, name: "Power Dynamos Home 25/26", price: 400, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Aba Yellow official replica – Umbro kit with Copperbelt Energy sponsor", image: "https://www.footballkitarchive.com/power-dynamos-2025-26-home-kit.jpg" },
  
  { id: 2, name: "ZESCO United Home 25/26", price: 400, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Electricity Boys – Orange & Green with Access Bank sponsor", image: "https://www.footballkitarchive.com/zesco-united-2025-26-home-kit.jpg" },
  
  { id: 3, name: "Nkana FC Home 25/26", price: 380, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Kalampa Red Army – 13-time champions, traditional red", image: "https://www.footballkitarchive.com/nkana-2025-26-home-kit.jpg" },
  
  { id: 4, name: "Red Arrows Home 25/26", price: 390, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Airmen – Red & White Scimitar kit, precision and speed", image: "https://www.footballkitarchive.com/red-arrows-fc-2025-26-home-kit.jpg" },
  
  { id: 5, name: "Green Buffaloes Home 25/26", price: 390, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Army-sponsored – Kappa green & white Celtic-style design", image: "https://www.footballkitarchive.com/green-buffaloes-2025-26-home-kit.jpg" },
  
  { id: 6, name: "Mufulira Wanderers Home 25/26", price: 360, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Mighty Wanderers – Greenstripes green & white stripes", image: "https://www.footballkitarchive.com/mufulira-wanderers-2025-26-home-kit.jpg" },
  
  { id: 7, name: "Kabwe Warriors Home 25/26", price: 370, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Railway side – The Magnificent Warriors", image: "https://www.footballkitarchive.com/kabwe-warriors-2025-26-home-kit.jpg" },
  
  { id: 8, name: "Nchanga Rangers Home 25/26", price: 370, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Chingola-based – Bravo brand yellow & blue", image: "https://www.footballkitarchive.com/nchanga-rangers-fc-2025-26-home-kit.jpg" },
  
  { id: 9, name: "Zanaco FC Home 25/26", price: 380, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Bankers – Umbro red & black stripes", image: "https://www.footballkitarchive.com/zanaco-fc-2025-26-home-kit.jpg" },
  
  { id: 10, name: "Forest Rangers Home 25/26", price: 360, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Ndola's green machine – Rangers official kit", image: "https://www.footballkitarchive.com/forest-rangers-2025-26-home-kit.jpg" },
  
  { id: 11, name: "Kafue Celtic Home 25/26", price: 350, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Rising Phoenix – new super league team", image: "https://www.footballkitarchive.com/kafue-celtic-2025-26-home-kit.jpg" },
  
  { id: 12, name: "FC Leopards Home 25/26", price: 360, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Prison Leopards – Admiral white & green graphic design", image: "https://www.footballkitarchive.com/fc-leopards-2025-26-home-kit.jpg" },
  
  { id: 13, name: "Atletico Lusaka Home 25/26", price: 340, category: "Local", country: "Zambia", league: "Zambia National League", desc: "Eye Sport white & orange – rising club", image: "https://www.footballkitarchive.com/atletico-lusaka-2025-26-home-kit.jpg" },
  
  { id: 14, name: "Indeni FC Home 25/26", price: 350, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Oil Men – Indeni Petroleum sponsored", image: "https://www.footballkitarchive.com/indeni-fc-2025-26-home-kit.jpg" },
  
  { id: 15, name: "NAPSA Stars Home 25/26", price: 350, category: "Local", country: "Zambia", league: "Zambia Super League", desc: "Jet Stars – National Pension Scheme Authority backed", image: "https://www.footballkitarchive.com/napsa-stars-2025-26-home-kit.jpg" },

  // === INTERNATIONAL CLUBS - PREMIER LEAGUE ===
  { id: 16, name: "Man United Home 25/26", price: 450, category: "International", country: "England", league: "Premier League", desc: "Theatre of Dreams – Adidas red with white logos & black accents", image: "https://www.footballkitarchive.com/manchester-united-2025-26-home-kit.jpg" },
  
  { id: 17, name: "Arsenal Home 25/26", price: 450, category: "International", country: "England", league: "Premier League", desc: "Gothic-inspired red & white – Adidas with Gothic A print", image: "https://www.footballkitarchive.com/arsenal-2025-26-home-kit.jpg" },
  
  { id: 18, name: "Liverpool Home 25/26", price: 450, category: "International", country: "England", league: "Premier League", desc: "You'll Never Walk Alone – Adidas red traditional", image: "https://www.footballkitarchive.com/liverpool-2025-26-home-kit.jpg" },
  
  { id: 19, name: "Chelsea Home 25/26", price: 450, category: "International", country: "England", league: "Premier League", desc: "The Blues – Nike blue with white & red detailing", image: "https://www.footballkitarchive.com/chelsea-fc-2025-26-home-kit.jpg" },
  
  { id: 20, name: "Man City Home 25/26", price: 450, category: "International", country: "England", league: "Premier League", desc: "Citizens – Puma sky blue with iconic sash design", image: "https://www.footballkitarchive.com/manchester-city-2025-26-home-kit.jpg" },
  
  { id: 21, name: "Tottenham Home 25/26", price: 440, category: "International", country: "England", league: "Premier League", desc: "Spurs – Nike white with navy abstract sleeves", image: "https://www.footballkitarchive.com/tottenham-hotspur-2025-26-home-kit.jpg" },
  
  { id: 22, name: "Newcastle Home 25/26", price: 430, category: "International", country: "England", league: "Premier League", desc: "Magpies – St James' Park black & white stripes", image: "https://www.footballkitarchive.com/newcastle-united-2025-26-home-kit.jpg" },

  // === LA LIGA ===
  { id: 23, name: "Real Madrid Home 25/26", price: 450, category: "International", country: "Spain", league: "La Liga", desc: "Bernabéu White – Adidas with yellow accents & grayscale texture", image: "https://www.footballkitarchive.com/real-madrid-2025-26-home-kit.jpg" },
  
  { id: 24, name: "Barcelona Home 25/26", price: 460, category: "International", country: "Spain", league: "La Liga", desc: "Més que un club – Nike Blaugrana stripes", image: "https://www.footballkitarchive.com/barcelona-2025-26-home-kit.jpg" },
  
  { id: 25, name: "Atletico Madrid Home 25/26", price: 430, category: "International", country: "Spain", league: "La Liga", desc: "Los Rojiblancos – Nike red & white stripes traditional", image: "https://www.footballkitarchive.com/atletico-madrid-2025-26-home-kit.jpg" },

  // === BUNDESLIGA ===
  { id: 26, name: "Bayern Munich Home 25/26", price: 450, category: "International", country: "Germany", league: "Bundesliga", desc: "Mia San Mia – Adidas red with white accents", image: "https://www.footballkitarchive.com/bayern-munich-2025-26-home-kit.jpg" },
  
  { id: 27, name: "Borussia Dortmund Home 25/26", price: 430, category: "International", country: "Germany", league: "Bundesliga", desc: "Die Schwarzgelben – Puma yellow wall, inspired by 1993-94", image: "https://www.footballkitarchive.com/borussia-dortmund-2025-26-home-kit.jpg" },
  
  { id: 28, name: "RB Leipzig Home 25/26", price: 420, category: "International", country: "Germany", league: "Bundesliga", desc: "Die Roten Bullen – Puma red & white modern", image: "https://www.footballkitarchive.com/rb-leipzig-2025-26-home-kit.jpg" },

  // === SERIE A ===
  { id: 29, name: "Inter Milan Home 25/26", price: 440, category: "International", country: "Italy", league: "Serie A", desc: "Nerazzurri – Nike black & blue wave effect stripes", image: "https://www.footballkitarchive.com/inter-milan-2025-26-home-kit.jpg" },
  
  { id: 30, name: "AC Milan Home 25/26", price: 440, category: "International", country: "Italy", league: "Serie A", desc: "Rossoneri – Puma devilish red & black stripes", image: "https://www.footballkitarchive.com/ac-milan-2025-26-home-kit.jpg" },
  
  { id: 31, name: "Juventus Home 25/26", price: 440, category: "International", country: "Italy", league: "Serie A", desc: "Bianconeri – Adidas black & white stripes", image: "https://www.footballkitarchive.com/juventus-2025-26-home-kit.jpg" },
  
  { id: 32, name: "Napoli Home 25/26", price: 430, category: "International", country: "Italy", league: "Serie A", desc: "Partenopei – EA7 sky blue with embossed N stripes", image: "https://www.footballkitarchive.com/ssc-napoli-2025-26-home-kit.jpg" },

  // === LIGUE 1 ===
  { id: 33, name: "PSG Home 25/26", price: 460, category: "International", country: "France", league: "Ligue 1", desc: "Ici c'est Paris – Nike midnight navy Hechter design", image: "https://www.footballkitarchive.com/paris-saint-germain-2025-26-home-kit.jpg" },
  
  { id: 34, name: "Marseille Home 25/26", price: 420, category: "International", country: "France", league: "Ligue 1", desc: "Les Phocéens – Puma white & sky blue", image: "https://www.footballkitarchive.com/olympique-marseille-2025-26-home-kit.jpg" },
  
  { id: 35, name: "Lyon Home 25/26", price: 420, category: "International", country: "France", league: "Ligue 1", desc: "Les Gones – Adidas white inspired by Lugdunum heritage", image: "https://www.footballkitarchive.com/olympique-lyonnais-2025-26-home-kit.jpg" },

  // === EREDIVISIE ===
  { id: 36, name: "Ajax Home 25/26", price: 430, category: "International", country: "Netherlands", league: "Eredivisie", desc: "De Godenzonen – Adidas iconic red & white", image: "https://www.footballkitarchive.com/ajax-2025-26-home-kit.jpg" },

  // === NATIONAL TEAMS - WORLD CUP 2026 ===
  { id: 37, name: "Zambia Home 2026", price: 420, category: "National", country: "Zambia", league: "National Team", desc: "Chipolopolo – AFCON champions edition orange", image: "https://www.footballkitarchive.com/zambia-2026-home-kit.jpg" },
  
  { id: 38, name: "Brazil Home 2026", price: 480, category: "National", country: "Brazil", league: "National Team", desc: "Seleção – Nike yellow canary with blue & green", image: "https://www.footballkitarchive.com/brazil-2026-home-kit.jpg" },
  
  { id: 39, name: "Argentina Home 2026", price: 480, category: "National", country: "Argentina", league: "National Team", desc: "La Albiceleste – Adidas white & sky blue gradient stripes", image: "https://www.footballkitarchive.com/argentina-2026-home-kit.jpg" },
  
  { id: 40, name: "France Home 2026", price: 470, category: "National", country: "France", league: "National Team", desc: "Les Bleus – Nike navy blue elegant with gold", image: "https://www.footballkitarchive.com/france-2026-home-kit.jpg" },
  
  { id: 41, name: "England Home 2026", price: 470, category: "National", country: "England", league: "National Team", desc: "Three Lions – Nike white with navy piping & gold star", image: "https://www.footballkitarchive.com/england-2026-home-kit.jpg" },
  
  { id: 42, name: "Spain Home 2026", price: 470, category: "National", country: "Spain", league: "National Team", desc: "La Roja – Adidas red with navy sleeves & yellow stripes", image: "https://www.footballkitarchive.com/spain-2026-home-kit.jpg" },
  
  { id: 43, name: "Germany Home 2026", price: 470, category: "National", country: "Germany", league: "National Team", desc: "Die Mannschaft – Adidas white tribute to 1990 & 2014", image: "https://www.footballkitarchive.com/germany-2026-home-kit.jpg" },
  
  { id: 44, name: "Netherlands Home 2026", price: 460, category: "National", country: "Netherlands", league: "National Team", desc: "Oranje – Nike vibrant orange with modern textures", image: "https://www.footballkitarchive.com/netherlands-2026-home-kit.jpg" },
  
  { id: 45, name: "Portugal Home 2026", price: 450, category: "National", country: "Portugal", league: "National Team", desc: "Selecção – Nike red CR7 era continues", image: "https://www.footballkitarchive.com/portugal-2026-home-kit.jpg" },
  
  { id: 46, name: "Italy Home 2026", price: 460, category: "National", country: "Italy", league: "National Team", desc: "Azzurri – Adidas blue & gold tribute to 2006", image: "https://www.footballkitarchive.com/italy-2026-home-kit.jpg" },
  
  { id: 47, name: "Morocco Home 2026", price: 440, category: "National", country: "Morocco", league: "National Team", desc: "Atlas Lions – Puma red with green accents", image: "https://www.footballkitarchive.com/morocco-2026-home-kit.jpg" },
  
  { id: 48, name: "Senegal Home 2026", price: 440, category: "National", country: "Senegal", league: "National Team", desc: "Lions of Teranga – Puma deep green with yellow", image: "https://www.footballkitarchive.com/senegal-2026-home-kit.jpg" },
  
  { id: 49, name: "Egypt Home 2026", price: 440, category: "National", country: "Egypt", league: "National Team", desc: "Pharaohs – Puma red with black geometric pattern", image: "https://www.footballkitarchive.com/egypt-2026-home-kit.jpg" },
  
  { id: 50, name: "Nigeria Home 2026", price: 450, category: "National", country: "Nigeria", league: "National Team", desc: "Super Eagles – Nike vibrant green patterns", image: "https://www.footballkitarchive.com/nigeria-2026-home-kit.jpg" },
  
  { id: 51, name: "Belgium Home 2026", price: 450, category: "National", country: "Belgium", league: "National Team", desc: "Red Devils – Adidas red with black & yellow", image: "https://www.footballkitarchive.com/belgium-2026-home-kit.jpg" },
  
  { id: 52, name: "Algeria Home 2026", price: 430, category: "National", country: "Algeria", league: "National Team", desc: "Fennecs – green & white World Cup qualifiers", image: "https://www.footballkitarchive.com/algeria-2026-home-kit.jpg" },
  
  { id: 53, name: "Tunisia Home 2026", price: 430, category: "National", country: "Tunisia", league: "National Team", desc: "Eagles of Carthage – red & white", image: "https://www.footballkitarchive.com/tunisia-2026-home-kit.jpg" },
  
  { id: 54, name: "South Africa Home 2026", price: 430, category: "National", country: "South Africa", league: "National Team", desc: "Bafana Bafana – yellow & green", image: "https://www.footballkitarchive.com/south-africa-2026-home-kit.jpg" },
  
  { id: 55, name: "Cameroon Home 2026", price: 430, category: "National", country: "Cameroon", league: "National Team", desc: "Indomitable Lions – green, red, yellow", image: "https://www.footballkitarchive.com/cameroon-2026-home-kit.jpg" },
  
  { id: 56, name: "Ghana Home 2026", price: 430, category: "National", country: "Ghana", league: "National Team", desc: "Black Stars – white with black star", image: "https://www.footballkitarchive.com/ghana-2026-home-kit.jpg" },
  
  { id: 57, name: "Côte d'Ivoire Home 2026", price: 430, category: "National", country: "Côte d'Ivoire", league: "National Team", desc: "Elephants – orange classic", image: "https://www.footballkitarchive.com/cote-d-ivoire-2026-home-kit.jpg" }
];
export default function KopalaKits() {
  const [filter, setFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [priceRange, setPriceRange] = useState([300, 500]);

  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});

  // Load saved data
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedDark = localStorage.getItem('darkMode');
    if (savedDark) setDarkMode(JSON.parse(savedDark));
  }, []);

  // Close cart with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
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

  const toggleWishlist = (id) => {
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

  const addToCart = useCallback((product) => {
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

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQty } : item
    ));
  };

  const sendSingleItemToWhatsApp = (product) => {
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
                onClick={() => setFilter(cat)}
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
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}>-</button>
                          <span className="font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}>+</button>
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
