import React, { useState } from 'react';
import { MapPin, MessageCircle, Info } from 'lucide-react';

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
  }
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
      {/* Jersey body */}
      <path 
        d="M50 15 L25 25 L10 25 L10 50 L25 55 L25 85 L75 85 L75 55 L90 50 L90 25 L75 25 L50 15" 
        fill={pattern === 'gradient' ? `url(#grad-${color})` : color}
        stroke={accent}
        strokeWidth="2"
      />
      {/* Collar */}
      <path d="M45 15 L50 20 L55 15" fill="none" stroke={accent} strokeWidth="2" />
      {/* Pattern overlays */}
      {pattern !== 'gradient' && getPattern()}
    </svg>
  );
}

export default function KopalaKits() {
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
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--ethereal-ivory)', color: 'var(--charcoal-accent)' }}>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--warm-beige)' }}>
        <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--dusty-sage)' }}>KOPALA KITS</h1>
        <div className="flex gap-4 items-center">
          <a href="#about" className="text-sm font-medium" style={{ color: 'var(--charcoal-accent)' }}>About</a>
          <div className="px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'var(--warm-beige)', color: 'var(--dusty-sage)' }}>
            <MapPin size={12} /> CBU K-BLOCK
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="text-white px-6 py-12 text-center" style={{ backgroundColor: 'var(--dusty-sage)' }}>
        <h2 className="text-3xl font-bold mb-2">Copperbelt&apos;s Finest Kits</h2>
        <p className="opacity-90 mb-6">Local & International jerseys delivered to your doorstep.</p>
        <div className="flex justify-center gap-2">
          {['All', 'International', 'Local'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition"
              style={{ 
                backgroundColor: filter === cat ? 'var(--soft-cream)' : 'rgba(255,255,255,0.2)',
                color: filter === cat ? 'var(--dusty-sage)' : 'white'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="rounded-xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--warm-beige)' }}
          >
            {/* Jersey Visual */}
            <div 
              className="h-48 w-full flex items-center justify-center p-4 relative overflow-hidden"
              style={{ backgroundColor: `${product.color}15` }}
            >
              <div className="w-32 h-32 group-hover:scale-110 transition-transform duration-300">
                <JerseySVG color={product.color} accent={product.accent} pattern={product.pattern} />
              </div>
              {/* Team color accent bar */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: product.color }}
              />
            </div>
            <div className="p-3 flex-grow">
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted-gold)' }}>{product.category}</span>
              <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
              <p className="text-xs mt-1 opacity-70">{product.desc}</p>
              <p className="font-black mt-2 text-lg" style={{ color: 'var(--dusty-sage)' }}>K{product.price}</p>
            </div>
            <button 
              onClick={() => sendWhatsApp(product.name)}
              className="m-3 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition hover:opacity-90"
              style={{ backgroundColor: product.color === '#FFFFFF' ? 'var(--dusty-sage)' : product.color }}
            >
              <MessageCircle size={14} /> ORDER NOW
            </button>
          </div>
        ))}
      </main>

      {/* ABOUT SECTION */}
      <section 
        id="about" 
        className="m-4 p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--warm-beige)' }}
      >
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Info style={{ color: 'var(--dusty-sage)' }} /> Our Story
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal-accent)' }}>
          Kopala Kits originated in <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong>. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants. 
          <br /><br />
          <span className="font-bold italic">Coming Soon: Professional Soccer Boots & Balls!</span>
        </p>
      </section>

      {/* FOOTER */}
      <footer className="p-8 text-center text-xs" style={{ color: 'var(--muted-gold)' }}>
        <p>&copy; 2026 Kopala Kits. Built for the Copperbelt.</p>
      </footer>
    </div>
  );
}
