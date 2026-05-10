import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, MapPin, MessageCircle, Info, Trophy, Users, Calendar, ChevronRight, Star } from 'lucide-react';

// Cart Context
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Product Database with K400 pricing - all jerseys uniform price
const products = [
  {
    id: 1,
    name: "Man United 25/26 Home",
    price: 400,
    category: "International",
    desc: "Premium quality Red Devils home kit.",
    color: "#DA291C",
    accent: "#FBE122",
    pattern: "solid"
  },
  {
    id: 2,
    name: "Arsenal 25/26 Home",
    price: 400,
    category: "International",
    desc: "The Gunners classic red and white.",
    color: "#EF0107",
    accent: "#FFFFFF",
    pattern: "sleeves"
  },
  {
    id: 3,
    name: "Chipolopolo Home 2026",
    price: 400,
    category: "Local",
    desc: "Official Zambia National Team Jersey.",
    color: "#00A651",
    accent: "#EF3340",
    pattern: "diagonal"
  },
  {
    id: 4,
    name: "Real Madrid 25/26 Home",
    price: 400,
    category: "International",
    desc: "Hala Madrid! The iconic white kit.",
    color: "#FFFFFF",
    accent: "#00529F",
    pattern: "solid"
  },
  {
    id: 5,
    name: "Power Dynamos Home",
    price: 400,
    category: "Local",
    desc: "Aba Yellow official replica.",
    color: "#FFD700",
    accent: "#000000",
    pattern: "stripes"
  },
  {
    id: 6,
    name: "Chelsea 25/26 Home",
    price: 400,
    category: "International",
    desc: "The Blues classic home jersey.",
    color: "#034694",
    accent: "#FFFFFF",
    pattern: "solid"
  },
  {
    id: 7,
    name: "ZESCO United Home",
    price: 400,
    category: "Local",
    desc: "ZESCO United official replica.",
    color: "#1E90FF",
    accent: "#FFFFFF",
    pattern: "gradient"
  },
  {
    id: 8,
    name: "Liverpool 25/26 Home",
    price: 400,
    category: "International",
    desc: "You'll Never Walk Alone!",
    color: "#C8102E",
    accent: "#00A398",
    pattern: "solid"
  },
  {
    id: 9,
    name: "Nkana FC Home",
    price: 400,
    category: "Local",
    desc: "Kalampa pride - the red devils of Zambia.",
    color: "#B22222",
    accent: "#FFFFFF",
    pattern: "solid"
  },
  {
    id: 10,
    name: "Green Buffaloes Home",
    price: 400,
    category: "Local",
    desc: "The soldiers official replica.",
    color: "#228B22",
    accent: "#FFFFFF",
    pattern: "solid"
  }
];

// Copperbelt Teams Data
const copperbeltTeams = [
  { name: "Power Dynamos", town: "Kitwe", nickname: "Aba Yellow", founded: 1971, stadium: "Arthur Davies Stadium" },
  { name: "Nkana FC", town: "Kitwe", nickname: "Kalampa", founded: 1935, stadium: "Nkana Stadium" },
  { name: "ZESCO United", town: "Ndola", nickname: "Team Ya Ziko", founded: 1974, stadium: "Levy Mwanawasa Stadium" },
  { name: "Buildcon FC", town: "Ndola", nickname: "The Builders", founded: 2008, stadium: "Levy Mwanawasa Stadium" },
  { name: "Konkola Blades", town: "Chililabombwe", nickname: "Blades", founded: 1966, stadium: "Konkola Stadium" },
  { name: "Roan United", town: "Luanshya", nickname: "The Antelopes", founded: 1956, stadium: "Roan Antelope Stadium" },
];

// Jersey SVG component for visual representation
function JerseySVG({ color, accent, pattern }) {
  const getPattern = () => {
    switch(pattern) {
      case 'stripes':
        return (
          <>
            <rect x="30" y="35" width="8" height="45" fill={accent} />
            <rect x="46" y="35" width="8" height="45" fill={accent} />
            <rect x="62" y="35" width="8" height="45" fill={accent} />
          </>
        );
      case 'sleeves':
        return (
          <>
            <path d="M10 25 L25 30 L25 55 L10 50 Z" fill={accent} />
            <path d="M90 25 L75 30 L75 55 L90 50 Z" fill={accent} />
          </>
        );
      case 'diagonal':
        return <path d="M25 80 L75 30 L80 35 L30 85 Z" fill={accent} opacity="0.6" />;
      case 'gradient':
        return (
          <defs>
            <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
          </defs>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {pattern === 'gradient' && getPattern()}
      <path 
        d="M50 15 L25 25 L10 25 L10 50 L25 55 L25 85 L75 85 L75 55 L90 50 L90 25 L75 25 L50 15" 
        fill={pattern === 'gradient' ? `url(#grad-${color})` : color}
        stroke={accent}
        strokeWidth="2"
      />
      <path d="M45 15 L50 20 L55 15" fill="none" stroke={accent} strokeWidth="2" />
      {pattern !== 'gradient' && getPattern()}
    </svg>
  );
}

// Navigation Component
function Navigation({ menuOpen, setMenuOpen, cartCount }) {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Shop' },
    { path: '/teams', label: 'Copperbelt Teams' },
    { path: '/about', label: 'About Us' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b px-4 py-3 shadow-sm" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-beige)' }}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--dusty-olive-dark)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Centered Logo */}
          <Link to="/" className="text-xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>
            KOPALA KITS
          </Link>

          {/* Cart Button */}
          <Link 
            to="/cart" 
            className="p-2 rounded-lg relative transition-colors"
            style={{ color: 'var(--dusty-olive-dark)' }}
            aria-label="View cart"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--dusty-olive)' }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div 
            className="w-72 h-full p-6 shadow-xl"
            style={{ backgroundColor: 'var(--soft-cream)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <h2 className="text-lg font-bold" style={{ color: 'var(--dusty-olive-dark)' }}>Menu</h2>
            </div>
            <div className="space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ 
                    backgroundColor: location.pathname === link.path ? 'var(--champagne-mist)' : 'transparent',
                    color: 'var(--charcoal-accent)'
                  }}
                >
                  <span className="font-medium">{link.label}</span>
                  <ChevronRight size={18} style={{ color: 'var(--khaki-dark)' }} />
                </Link>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: 'var(--champagne-mist)' }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--dusty-olive)' }}>
                <MapPin size={16} /> CBU K-BLOCK, Kitwe
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Home/Shop Page
function ShopPage({ addToCart }) {
  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const sendWhatsApp = (productName) => {
    const phone = "260XXXXXXXXX";
    const msg = `Hi Kopala Kits! I'm at CBU K-Block and I want to buy the ${productName}. Is it available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      {/* Hero Section */}
      <header className="text-white px-6 py-14 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--dusty-olive)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Copperbelt&apos;s Finest Kits</h2>
          <p className="opacity-90 mb-8 text-lg">Local & International jerseys delivered to your doorstep.</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['All', 'International', 'Local'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={{ 
                  backgroundColor: filter === cat ? 'var(--champagne-mist)' : 'rgba(255,255,255,0.15)',
                  color: filter === cat ? 'var(--dusty-olive-dark)' : 'white',
                  boxShadow: filter === cat ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="rounded-2xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}
          >
            <div 
              className="h-48 w-full flex items-center justify-center p-4 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--champagne-light) 0%, var(--champagne-mist) 100%)' }}
            >
              <div className="w-32 h-32 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                <JerseySVG color={product.color} accent={product.accent} pattern={product.pattern} />
              </div>
              <div 
                className="absolute bottom-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: product.color }}
              />
            </div>
            <div className="p-4 flex-grow">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--khaki-dark)' }}>{product.category}</span>
              <h3 className="font-bold text-sm leading-tight mt-1" style={{ color: 'var(--charcoal-accent)' }}>{product.name}</h3>
              <p className="text-xs mt-1.5" style={{ color: 'var(--khaki-dark)' }}>{product.desc}</p>
              <p className="font-black mt-3 text-xl" style={{ color: 'var(--dusty-olive)' }}>K{product.price}</p>
            </div>
            <div className="p-4 pt-0 flex gap-2">
              <button 
                onClick={() => addToCart(product)}
                className="flex-1 py-3 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'var(--dusty-olive)',
                  color: 'var(--champagne-light)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                ADD TO CART
              </button>
              <button 
                onClick={() => sendWhatsApp(product.name)}
                className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  backgroundColor: 'var(--champagne-mist)',
                  color: 'var(--dusty-olive)'
                }}
                aria-label="Order via WhatsApp"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

// Copperbelt Teams Page
function TeamsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: 'var(--champagne-mist)' }}>
          <Trophy size={18} style={{ color: 'var(--dusty-olive)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--dusty-olive)' }}>Copperbelt Pride</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--dusty-olive-dark)' }}>Copperbelt Football Teams</h1>
        <p className="text-sm" style={{ color: 'var(--khaki-dark)' }}>The heart of Zambian football - from Kitwe to Ndola and beyond.</p>
      </header>

      <div className="grid gap-4">
        {copperbeltTeams.map((team, index) => (
          <div 
            key={index}
            className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4"
            style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>
              {team.name.charAt(0)}
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal-accent)' }}>{team.name}</h3>
              <p className="text-sm" style={{ color: 'var(--khaki-dark)' }}>{team.nickname} - {team.town}</p>
              <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--dusty-olive)' }}>
                <span>Est. {team.founded}</span>
                <span>{team.stadium}</span>
              </div>
            </div>
            <Link 
              to="/"
              className="px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              style={{ backgroundColor: 'var(--champagne-mist)', color: 'var(--dusty-olive)' }}
            >
              View Kits
            </Link>
          </div>
        ))}
      </div>

      {/* Zambian Football Facts */}
      <section className="mt-12 p-6 rounded-2xl" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star size={20} /> Did You Know?
        </h2>
        <ul className="space-y-3 text-sm opacity-90">
          <li>The Copperbelt region has produced more Zambian national team players than any other province.</li>
          <li>Nkana FC is one of the oldest football clubs in Zambia, founded in 1935.</li>
          <li>The famous 1993 Zambia national team plane crash included many Copperbelt players.</li>
          <li>Zambia won AFCON 2012, with several key players from Copperbelt clubs.</li>
        </ul>
      </section>
    </div>
  );
}

// About Page
function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--dusty-olive-dark)' }}>About Kopala Kits</h1>
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--khaki-dark)' }}>
          <MapPin size={16} />
          <span>CBU K-Block, Kitwe, Zambia</span>
        </div>
      </header>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--dusty-olive-dark)' }}>
            <Info size={20} style={{ color: 'var(--dusty-olive)' }} /> Our Story
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal-accent)' }}>
            Kopala Kits was born from a passion for football and a love for the Copperbelt. Starting in <strong>Luanshya</strong>, 
            we&apos;ve grown to become the go-to destination for quality football jerseys in the region. Now headquartered at 
            <strong> CBU K-Block in Kitwe</strong>, we serve football fans across the Copperbelt with authentic local and international kits.
          </p>
        </section>

        <section className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--dusty-olive-dark)' }}>
            <Users size={20} style={{ color: 'var(--dusty-olive)' }} /> Why Choose Us
          </h2>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--charcoal-accent)' }}>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>1</span>
              <span><strong>Quality Guaranteed</strong> - We only stock premium quality replicas that look and feel authentic.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>2</span>
              <span><strong>Local Pride</strong> - Supporting Copperbelt football by stocking all major local team jerseys.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>3</span>
              <span><strong>Fast Delivery</strong> - Same-day delivery within Kitwe, next-day across the Copperbelt.</span>
            </li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--dusty-olive-dark)' }}>
            <Calendar size={20} style={{ color: 'var(--dusty-olive)' }} /> Coming Soon
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--champagne-mist)' }}>
              <p className="text-2xl mb-1">Soccer Boots</p>
              <p className="text-xs" style={{ color: 'var(--khaki-dark)' }}>Premium brands</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--champagne-mist)' }}>
              <p className="text-2xl mb-1">Match Balls</p>
              <p className="text-xs" style={{ color: 'var(--khaki-dark)' }}>Official replicas</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Cart Page
function CartPage({ cart, removeFromCart, clearCart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const sendWhatsAppOrder = () => {
    const phone = "260XXXXXXXXX";
    const items = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const msg = `Hi Kopala Kits! I want to order: ${items}. Total: K${total}. I'm at CBU K-Block.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--champagne-mist)' }}>
          <ShoppingCart size={32} style={{ color: 'var(--khaki-dark)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--dusty-olive-dark)' }}>Your Cart is Empty</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--khaki-dark)' }}>Add some jerseys to get started!</p>
        <Link 
          to="/"
          className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}
        >
          Browse Kits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--dusty-olive-dark)' }}>Your Cart</h1>
      
      <div className="space-y-4 mb-6">
        {cart.map((item, index) => (
          <div 
            key={index}
            className="p-4 rounded-xl border flex items-center gap-4"
            style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}
          >
            <div className="w-16 h-16">
              <JerseySVG color={item.color} accent={item.accent} pattern={item.pattern} />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-sm" style={{ color: 'var(--charcoal-accent)' }}>{item.name}</h3>
              <p className="text-xs" style={{ color: 'var(--khaki-dark)' }}>Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-bold" style={{ color: 'var(--dusty-olive)' }}>K{item.price * item.quantity}</p>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-xs underline"
                style={{ color: 'var(--khaki-dark)' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--champagne-mist)' }}>
        <div className="flex justify-between items-center">
          <span className="font-bold" style={{ color: 'var(--charcoal-accent)' }}>Total</span>
          <span className="text-2xl font-black" style={{ color: 'var(--dusty-olive)' }}>K{total}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={sendWhatsAppOrder}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}
        >
          <MessageCircle size={18} /> Order via WhatsApp
        </button>
        <button 
          onClick={clearCart}
          className="w-full py-3 rounded-xl font-bold text-sm transition-colors"
          style={{ backgroundColor: 'var(--champagne-mist)', color: 'var(--khaki-dark)' }}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="mt-auto p-8 text-center border-t" style={{ borderColor: 'var(--khaki-light)', backgroundColor: 'var(--champagne-light)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--khaki-dark)' }}>&copy; 2026 Kopala Kits</p>
      <p className="text-xs mt-1" style={{ color: 'var(--dusty-olive-light)' }}>Built for the Copperbelt</p>
    </footer>
  );
}

// Main App Component
export default function KopalaKits() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: 'var(--champagne-light)', color: 'var(--charcoal-accent)' }}>
          <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} cartCount={cartCount} />
          
          <Routes>
            <Route path="/" element={<ShopPage addToCart={addToCart} />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          </Routes>

          <Footer />
        </div>
      </BrowserRouter>
    </CartContext.Provider>
  );
}
