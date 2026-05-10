import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, ShoppingCart, MapPin, MessageCircle, Info, 
  Instagram, Facebook, Twitter, Trophy, Users, Newspaper,
  ChevronRight, Minus, Plus, Trash2, ExternalLink
} from 'lucide-react';

// Product Database
const products = [
  {
    id: 1,
    name: "Man United 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop",
    desc: "Premium quality Red Devils home kit."
  },
  {
    id: 2,
    name: "Arsenal 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=600&fit=crop",
    desc: "The Gunners classic red and white."
  },
  {
    id: 3,
    name: "Chipolopolo Home 2026",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&h=600&fit=crop",
    desc: "Official Zambia National Team Jersey."
  },
  {
    id: 4,
    name: "Real Madrid 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&h=600&fit=crop",
    desc: "Hala Madrid! The iconic white kit."
  },
  {
    id: 5,
    name: "Power Dynamos Home",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=600&fit=crop",
    desc: "Aba Yellow official replica."
  },
  {
    id: 6,
    name: "Zesco United Away",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
    desc: "Team Yanga official away kit."
  },
  {
    id: 7,
    name: "Nkana FC Home",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=600&fit=crop",
    desc: "Kalampa official home jersey."
  },
  {
    id: 8,
    name: "Liverpool 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=600&fit=crop",
    desc: "You will never walk alone - The Reds."
  }
];

// Zambian Football Teams Data
const zambianTeams = [
  { name: "Chipolopolo", founded: 1929, stadium: "National Heroes Stadium", city: "Lusaka", achievements: "AFCON 2012 Champions" },
  { name: "Power Dynamos", founded: 1971, stadium: "Arthur Davies Stadium", city: "Kitwe", achievements: "16x League Champions" },
  { name: "Nkana FC", founded: 1935, stadium: "Nkana Stadium", city: "Kitwe", achievements: "13x League Champions" },
  { name: "Zesco United", founded: 1974, stadium: "Levy Mwanawasa Stadium", city: "Ndola", achievements: "8x League Champions" },
  { name: "Green Buffaloes", founded: 1974, stadium: "Edwin Imboela Stadium", city: "Lusaka", achievements: "6x League Champions" },
  { name: "Red Arrows", founded: 1996, stadium: "Nkoloma Stadium", city: "Lusaka", achievements: "2x League Champions" }
];

// Copperbelt Towns Data
const copperbeltTowns = [
  { name: "Kitwe", population: "522,000", known: "Mining Hub, Home of Nkana & Power Dynamos" },
  { name: "Ndola", population: "475,000", known: "Provincial Capital, Zesco United" },
  { name: "Luanshya", population: "156,000", known: "Roan Antelope Mine, Birth of Kopala Kits" },
  { name: "Mufulira", population: "162,000", known: "Mufulira Wanderers FC" },
  { name: "Chingola", population: "185,000", known: "Nchanga Rangers FC" },
  { name: "Kalulushi", population: "98,000", known: "Chibuluma Mines" }
];

// Football News (Mock API Data)
const footballNews = [
  {
    id: 1,
    title: "Chipolopolo Qualifies for AFCON 2027",
    summary: "Zambia secures qualification with a 2-1 victory over neighboring Zimbabwe in a thrilling match.",
    date: "2026-05-08",
    source: "FAZ"
  },
  {
    id: 2,
    title: "Power Dynamos Sign New Striker",
    summary: "Aba Yellow bolsters attack with acquisition of promising forward from DR Congo.",
    date: "2026-05-07",
    source: "Super Sport"
  },
  {
    id: 3,
    title: "Nkana FC Wins Copperbelt Derby",
    summary: "Kalampa defeats rivals Power Dynamos 3-2 in front of packed stadium in Kitwe.",
    date: "2026-05-05",
    source: "Times of Zambia"
  },
  {
    id: 4,
    title: "Youth Academy Opens in Ndola",
    summary: "New state-of-the-art football academy to train next generation of Zambian stars.",
    date: "2026-05-03",
    source: "Daily Mail"
  }
];

// Cart Context
const CartContext = React.createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// Header Component
function Header({ onMenuOpen, onCartOpen }) {
  const { cartCount } = React.useContext(CartContext);

  return (
    <nav className="sticky top-0 z-50 border-b px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <button 
          onClick={onMenuOpen}
          className="p-2 rounded-lg transition hover:opacity-80"
          style={{ backgroundColor: 'var(--khaki-700)' }}
          aria-label="Open menu"
        >
          <Menu size={20} style={{ color: 'var(--olive-300)' }} />
        </button>

        <Link to="/" className="text-xl font-black tracking-tighter" style={{ color: 'var(--olive-400)' }}>
          KOPALA KITS
        </Link>

        <button 
          onClick={onCartOpen}
          className="p-2 rounded-lg transition hover:opacity-80 relative"
          style={{ backgroundColor: 'var(--khaki-700)' }}
          aria-label="Open cart"
        >
          <ShoppingCart size={20} style={{ color: 'var(--olive-300)' }} />
          {cartCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: 'var(--olive-500)', color: 'var(--champagne-900)' }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

// Menu Drawer
function MenuDrawer({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Shop', icon: ShoppingCart },
    { path: '/zambian-football', label: 'Zambian Football', icon: Trophy },
    { path: '/copperbelt', label: 'The Copperbelt', icon: MapPin },
    { path: '/news', label: 'Football News', icon: Newspaper },
    { path: '/about', label: 'About Us', icon: Info }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div 
        className="relative w-72 h-full shadow-xl overflow-y-auto"
        style={{ backgroundColor: 'var(--champagne-800)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--khaki-700)' }}>
          <span className="font-black" style={{ color: 'var(--olive-400)' }}>MENU</span>
          <button onClick={onClose} className="p-1" aria-label="Close menu">
            <X size={24} style={{ color: 'var(--olive-300)' }} />
          </button>
        </div>

        <div className="p-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition"
              style={{ 
                backgroundColor: location.pathname === item.path ? 'var(--olive-500)' : 'transparent',
                color: location.pathname === item.path ? 'var(--champagne-900)' : 'var(--olive-200)'
              }}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
              <ChevronRight size={16} className="ml-auto opacity-50" />
            </Link>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--khaki-700)' }}>
          <p className="text-xs mb-3 font-semibold" style={{ color: 'var(--olive-400)' }}>Follow Us</p>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
              <Instagram size={18} style={{ color: 'var(--olive-300)' }} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
              <Facebook size={18} style={{ color: 'var(--olive-300)' }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
              <Twitter size={18} style={{ color: 'var(--olive-300)' }} />
            </a>
          </div>
          <div className="mt-4 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'var(--khaki-600)', color: 'var(--olive-300)' }}>
            <MapPin size={12} /> CBU K-BLOCK, KITWE
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Drawer
function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQty, cartTotal } = React.useContext(CartContext);

  const sendWhatsAppOrder = () => {
    const phone = "260XXXXXXXXX";
    const items = cart.map(item => `${item.name} x${item.qty}`).join(', ');
    const msg = `Hi Kopala Kits! I want to order: ${items}. Total: K${cartTotal}. I'm at CBU K-Block.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div 
        className="relative w-80 h-full shadow-xl flex flex-col"
        style={{ backgroundColor: 'var(--champagne-800)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--khaki-700)' }}>
          <span className="font-black" style={{ color: 'var(--olive-400)' }}>YOUR CART</span>
          <button onClick={onClose} className="p-1" aria-label="Close cart">
            <X size={24} style={{ color: 'var(--olive-300)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--olive-400)' }}>Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--champagne-700)' }}>
                <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm" style={{ color: 'var(--olive-200)' }}>{item.name}</h4>
                  <p className="text-sm font-bold" style={{ color: 'var(--olive-500)' }}>K{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded" style={{ backgroundColor: 'var(--khaki-600)' }}>
                      <Minus size={14} style={{ color: 'var(--olive-300)' }} />
                    </button>
                    <span className="text-sm font-bold" style={{ color: 'var(--olive-200)' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded" style={{ backgroundColor: 'var(--khaki-600)' }}>
                      <Plus size={14} style={{ color: 'var(--olive-300)' }} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 rounded ml-auto" style={{ backgroundColor: 'var(--champagne-400)' }}>
                      <Trash2 size={14} style={{ color: 'var(--olive-200)' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--khaki-700)' }}>
            <div className="flex justify-between mb-4">
              <span className="font-bold" style={{ color: 'var(--olive-200)' }}>Total:</span>
              <span className="font-black text-xl" style={{ color: 'var(--olive-500)' }}>K{cartTotal}</span>
            </div>
            <button 
              onClick={sendWhatsAppOrder}
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition hover:opacity-90"
              style={{ backgroundColor: 'var(--olive-500)', color: 'var(--champagne-900)' }}
            >
              <MessageCircle size={18} /> ORDER VIA WHATSAPP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// News Widget (Floating)
function NewsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [latestNews] = useState(footballNews[0]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div 
          className="mb-3 w-72 rounded-xl shadow-lg border overflow-hidden"
          style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-600)' }}
        >
          <div className="p-3 border-b" style={{ borderColor: 'var(--khaki-700)', backgroundColor: 'var(--olive-500)' }}>
            <h4 className="font-bold text-sm" style={{ color: 'var(--champagne-900)' }}>Latest News</h4>
          </div>
          <div className="p-3">
            <p className="font-bold text-sm mb-1" style={{ color: 'var(--olive-200)' }}>{latestNews.title}</p>
            <p className="text-xs mb-2" style={{ color: 'var(--olive-400)' }}>{latestNews.summary}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px]" style={{ color: 'var(--khaki-400)' }}>{latestNews.source} - {latestNews.date}</span>
              <Link to="/news" onClick={() => setIsOpen(false)} className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--olive-500)' }}>
                More <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full shadow-lg transition hover:scale-105"
        style={{ backgroundColor: 'var(--olive-500)' }}
        aria-label="Toggle news widget"
      >
        <Newspaper size={22} style={{ color: 'var(--champagne-900)' }} />
      </button>
    </div>
  );
}

// Home Page (Shop)
function HomePage() {
  const [filter, setFilter] = useState('All');
  const { addToCart } = React.useContext(CartContext);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <>
      <header className="px-6 py-12 text-center" style={{ backgroundColor: 'var(--olive-500)', color: 'var(--champagne-900)' }}>
        <h2 className="text-3xl font-bold mb-2">Copperbelt&apos;s Finest Kits</h2>
        <p className="opacity-90 mb-6">Local & International jerseys delivered to your doorstep.</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {['All', 'International', 'Local'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition"
              style={{ 
                backgroundColor: filter === cat ? 'var(--champagne-800)' : 'rgba(255,255,255,0.2)',
                color: filter === cat ? 'var(--olive-400)' : 'var(--champagne-900)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="rounded-xl shadow-sm border overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}
          >
            <img 
              src={product.img} 
              alt={product.name} 
              className="h-48 w-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=600&fit=crop'; }}
            />
            <div className="p-3 flex-grow">
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--champagne-300)' }}>{product.category}</span>
              <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--olive-200)' }}>{product.name}</h3>
              <p className="font-black mt-1" style={{ color: 'var(--olive-500)' }}>K{product.price}</p>
            </div>
            <button 
              onClick={() => addToCart(product)}
              className="py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition hover:opacity-90 mx-3 mb-3"
              style={{ backgroundColor: 'var(--olive-500)', color: 'var(--champagne-900)' }}
            >
              <ShoppingCart size={14} /> ADD TO CART
            </button>
          </div>
        ))}
      </main>
    </>
  );
}

// Zambian Football Page
function ZambianFootballPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--olive-500)' }} />
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--olive-300)' }}>Zambian Football</h1>
        <p style={{ color: 'var(--olive-400)' }}>Celebrating the beautiful game in the land of copper</p>
      </header>

      <section className="mb-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--olive-300)' }}>
          <Trophy size={20} style={{ color: 'var(--olive-500)' }} /> AFCON 2012 Glory
        </h2>
        <p className="leading-relaxed mb-4" style={{ color: 'var(--olive-200)' }}>
          The Chipolopolo&apos;s historic victory at the 2012 Africa Cup of Nations in Gabon remains one of Africa&apos;s 
          greatest football stories. Led by Herve Renard and captain Christopher Katongo, Zambia defeated 
          Ivory Coast on penalties in the final, held near the site of the 1993 Gabon air disaster.
        </p>
        <p className="text-sm italic" style={{ color: 'var(--champagne-300)' }}>
          &quot;We won for the heroes of 1993&quot; - The nation united in victory and remembrance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--olive-300)' }}>Top Zambian Clubs</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {zambianTeams.map(team => (
            <div 
              key={team.name}
              className="p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}
            >
              <h3 className="font-bold text-lg" style={{ color: 'var(--olive-300)' }}>{team.name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-xs uppercase" style={{ color: 'var(--khaki-400)' }}>Founded</span>
                  <p style={{ color: 'var(--olive-200)' }}>{team.founded}</p>
                </div>
                <div>
                  <span className="text-xs uppercase" style={{ color: 'var(--khaki-400)' }}>City</span>
                  <p style={{ color: 'var(--olive-200)' }}>{team.city}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs uppercase" style={{ color: 'var(--khaki-400)' }}>Stadium</span>
                  <p style={{ color: 'var(--olive-200)' }}>{team.stadium}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs uppercase" style={{ color: 'var(--khaki-400)' }}>Notable</span>
                  <p className="font-semibold" style={{ color: 'var(--olive-500)' }}>{team.achievements}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--olive-300)' }}>Zambian Legends</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {['Kalusha Bwalya', 'Christopher Katongo', 'Godfrey Chitalu', 'Rainford Kalaba'].map(legend => (
            <div key={legend} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
              <Users size={24} className="mx-auto mb-2" style={{ color: 'var(--olive-500)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--olive-200)' }}>{legend}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Copperbelt Page
function CopperbeltPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <MapPin size={48} className="mx-auto mb-4" style={{ color: 'var(--olive-500)' }} />
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--olive-300)' }}>The Copperbelt</h1>
        <p style={{ color: 'var(--olive-400)' }}>Heart of Zambian mining and football culture</p>
      </header>

      <section className="mb-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--olive-300)' }}>About the Region</h2>
        <p className="leading-relaxed" style={{ color: 'var(--olive-200)' }}>
          The Copperbelt Province is the industrial heartland of Zambia, built on one of the world&apos;s largest 
          copper deposits. Beyond mining, it&apos;s a hotbed of Zambian football culture, producing legendary 
          players and hosting intense local derbies. The region&apos;s passionate fans are known throughout Africa.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--olive-300)' }}>Major Towns</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {copperbeltTowns.map(town => (
            <div 
              key={town.name}
              className="p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}
            >
              <h3 className="font-bold text-lg" style={{ color: 'var(--olive-300)' }}>{town.name}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--olive-400)' }}>Pop: {town.population}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--olive-200)' }}>{town.known}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--olive-500)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--champagne-900)' }}>Visit Us!</h2>
        <p className="leading-relaxed" style={{ color: 'var(--champagne-800)' }}>
          Kopala Kits is proudly located at <strong>CBU K-Block</strong> in Kitwe. Stop by to see our full 
          collection and experience the Copperbelt&apos;s football passion firsthand!
        </p>
      </section>
    </div>
  );
}

// News Page
function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <Newspaper size={48} className="mx-auto mb-4" style={{ color: 'var(--olive-500)' }} />
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--olive-300)' }}>Football News</h1>
        <p style={{ color: 'var(--olive-400)' }}>Latest from Zambian and African football</p>
      </header>

      <div className="space-y-4">
        {footballNews.map(news => (
          <article 
            key={news.id}
            className="p-5 rounded-xl border"
            style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ backgroundColor: 'var(--olive-500)', color: 'var(--champagne-900)' }}>
                {news.source}
              </span>
              <span className="text-xs" style={{ color: 'var(--khaki-400)' }}>{news.date}</span>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--olive-200)' }}>{news.title}</h2>
            <p style={{ color: 'var(--olive-400)' }}>{news.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-8">
        <Info size={48} className="mx-auto mb-4" style={{ color: 'var(--olive-500)' }} />
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--olive-300)' }}>About Kopala Kits</h1>
        <p style={{ color: 'var(--olive-400)' }}>Your trusted jersey source in the Copperbelt</p>
      </header>

      <section className="mb-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--olive-300)' }}>Our Story</h2>
        <p className="leading-relaxed mb-4" style={{ color: 'var(--olive-200)' }}>
          Kopala Kits originated in <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong> in Kitwe. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants.
        </p>
        <p className="font-bold italic" style={{ color: 'var(--champagne-300)' }}>
          Coming Soon: Professional Soccer Boots & Balls!
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl border text-center" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
          <h3 className="font-bold mb-2" style={{ color: 'var(--olive-300)' }}>Location</h3>
          <MapPin size={24} className="mx-auto mb-2" style={{ color: 'var(--olive-500)' }} />
          <p style={{ color: 'var(--olive-200)' }}>CBU K-Block, Kitwe<br />Copperbelt Province, Zambia</p>
        </div>
        <div className="p-5 rounded-xl border text-center" style={{ backgroundColor: 'var(--champagne-800)', borderColor: 'var(--khaki-700)' }}>
          <h3 className="font-bold mb-2" style={{ color: 'var(--olive-300)' }}>Contact</h3>
          <MessageCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--olive-500)' }} />
          <p style={{ color: 'var(--olive-200)' }}>WhatsApp: +260 XXX XXX XXX<br />Order anytime!</p>
        </div>
      </section>

      <section className="p-6 rounded-2xl text-center" style={{ backgroundColor: 'var(--olive-500)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--champagne-900)' }}>Follow Us</h2>
        <div className="flex justify-center gap-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg" style={{ backgroundColor: 'var(--champagne-800)' }}>
            <Instagram size={24} style={{ color: 'var(--olive-500)' }} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg" style={{ backgroundColor: 'var(--champagne-800)' }}>
            <Facebook size={24} style={{ color: 'var(--olive-500)' }} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg" style={{ backgroundColor: 'var(--champagne-800)' }}>
            <Twitter size={24} style={{ color: 'var(--olive-500)' }} />
          </a>
        </div>
      </section>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="mt-8 p-8 text-center border-t" style={{ borderColor: 'var(--khaki-700)' }}>
      <div className="flex justify-center gap-4 mb-4">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
          <Instagram size={18} style={{ color: 'var(--olive-400)' }} />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
          <Facebook size={18} style={{ color: 'var(--olive-400)' }} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg" style={{ backgroundColor: 'var(--khaki-700)' }}>
          <Twitter size={18} style={{ color: 'var(--olive-400)' }} />
        </a>
      </div>
      <p className="text-xs" style={{ color: 'var(--khaki-400)' }}>&copy; 2026 Kopala Kits. Built for the Copperbelt.</p>
    </footer>
  );
}

// Main App
export default function KopalaKits() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--champagne-900)', color: 'var(--olive-100)' }}>
          <Header onMenuOpen={() => setMenuOpen(true)} onCartOpen={() => setCartOpen(true)} />
          <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          <NewsWidget />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/zambian-football" element={<ZambianFootballPage />} />
            <Route path="/copperbelt" element={<CopperbeltPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
          
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
