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
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--champagne-light)', color: 'var(--charcoal-accent)' }}>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-beige)' }}>
        <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--dusty-olive-dark)' }}>KOPALA KITS</h1>
        <div className="flex gap-4 items-center">
          <a href="#about" className="text-sm font-medium hover:underline" style={{ color: 'var(--khaki-dark)' }}>About</a>
          <div className="px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5" style={{ backgroundColor: 'var(--dusty-olive)', color: 'var(--champagne-light)' }}>
            <MapPin size={12} /> CBU K-BLOCK
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
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

      {/* PRODUCT GRID */}
      <main className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="rounded-2xl shadow-sm border overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-light)' }}
          >
            {/* Jersey Visual */}
            <div 
              className="h-48 w-full flex items-center justify-center p-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, var(--champagne-light) 0%, var(--champagne-mist) 100%)` }}
            >
              <div className="w-32 h-32 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                <JerseySVG color={product.color} accent={product.accent} pattern={product.pattern} />
              </div>
              {/* Team color accent bar */}
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
            <button 
              onClick={() => sendWhatsApp(product.name)}
              className="mx-4 mb-4 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                backgroundColor: product.color === '#FFFFFF' ? 'var(--dusty-olive)' : product.color,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <MessageCircle size={14} /> ORDER NOW
            </button>
          </div>
        ))}
      </main>

      {/* ABOUT SECTION */}
      <section 
        id="about" 
        className="mx-4 md:mx-6 my-8 p-6 md:p-8 rounded-2xl border"
        style={{ backgroundColor: 'var(--soft-cream)', borderColor: 'var(--khaki-beige)' }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--dusty-olive-dark)' }}>
          <Info style={{ color: 'var(--dusty-olive)' }} /> Our Story
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal-accent)' }}>
          Kopala Kits originated in <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong>. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants. 
        </p>
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--champagne-mist)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--dusty-olive)' }}>
            Coming Soon: Professional Soccer Boots & Balls!
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-8 text-center border-t" style={{ borderColor: 'var(--khaki-light)', backgroundColor: 'var(--champagne-light)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--khaki-dark)' }}>&copy; 2026 Kopala Kits</p>
        <p className="text-xs mt-1" style={{ color: 'var(--dusty-olive-light)' }}>Built for the Copperbelt</p>
      </footer>
    </div>
  );
}
