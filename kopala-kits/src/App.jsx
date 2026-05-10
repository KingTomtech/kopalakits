import React, { useState } from 'react';
import { ShoppingCart, MapPin, MessageCircle, Info, ChevronRight } from 'lucide-react';

// 1. PRODUCT DATABASE (International & Local)
const products = [
  {
    id: 1,
    name: "Man United 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1627628930949-85c2a7a6e0f8?q=80&w=800&auto=format&fit=crop",
    desc: "Premium quality Red Devils home kit."
  },
  {
    id: 2,
    name: "Arsenal 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1599557282923-0c7b9d4f8d7e?q=80&w=800&auto=format&fit=crop",
    desc: "The Gunners classic red and white."
  },
  {
    id: 3,
    name: "Chipolopolo Home 2026",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1518605348400-48f0c37c5d6e?q=80&w=800&auto=format&fit=crop",
    desc: "Official Zambia National Team Jersey."
  },
  {
    id: 4,
    name: "Real Madrid 25/26 Home",
    price: 400,
    category: "International",
    img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=800&auto=format&fit=crop",
    desc: "Hala Madrid! The iconic white kit."
  },
  {
    id: 5,
    name: "Power Dynamos Home",
    price: 400,
    category: "Local",
    img: "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=800&auto=format&fit=crop",
    desc: "Aba Yellow official replica."
  }
];

export default function KopalaKits() {
  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const sendWhatsApp = (productName) => {
    const phone = "260XXXXXXXXX"; // REPLACE WITH YOUR NUMBER
    const msg = `Hi Kopala Kits! I'm at CBU K-Block and I want to buy the ${productName}. Is it available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--ethereal-ivory)', color: 'var(--charcoal-accent)' }}>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b px-4 py-3 flex justify-between items-center shadow-sm" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--dusty-sage)' }}>KOPALA KITS</h1>
        <div className="flex gap-4">
          <a href="#about" className="text-sm font-medium" style={{ color: 'var(--charcoal-accent)' }}>About</a>
          <div className="px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'var(--warm-beige)', color: 'var(--charcoal-accent)' }}>
            <MapPin size={12} /> CBU K-BLOCK
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="px-6 py-12 text-center" style={{ backgroundColor: 'var(--dusty-sage)', color: 'var(--soft-cream)' }}>
        <h2 className="text-3xl font-bold mb-2">Copperbelt's Finest Kits</h2>
        <p className="opacity-90 mb-6">Local & International jerseys delivered to your doorstep.</p>
        <div className="flex justify-center gap-2">
          {['All', 'International', 'Local'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === cat ? 'text-dusty-sage' : 'bg-opacity-50'}`}
              style={filter === cat ? { backgroundColor: 'var(--soft-cream)', color: 'var(--dusty-sage)' } : { backgroundColor: 'var(--muted-gold)', color: 'var(--soft-cream)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="rounded-xl shadow-sm border overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--soft-cream)' }}>
            <img 
              src={product.img} 
              alt={product.name} 
              className="h-48 w-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Jersey+Coming+Soon'; }}
            />
            <div className="p-3 flex-grow">
              <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--muted-gold)' }}>{product.category}</span>
              <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--charcoal-accent)' }}>{product.name}</h3>
              <p className="font-black mt-1" style={{ color: 'var(--dusty-sage)' }}>K{product.price}</p>
            </div>
            <button 
              onClick={() => sendWhatsApp(product.name)}
              className="m-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition"
              style={{ backgroundColor: 'var(--dusty-sage)', color: 'var(--soft-cream)' }}
            >
              <MessageCircle size={14} /> ORDER NOW
            </button>
          </div>
        ))}
      </main>

      {/* ABOUT SECTION */}
      <section id="about" className="m-4 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Info style={{ color: 'var(--dusty-sage)' }} /> Our Story
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal-accent)' }}>
          Kopala Kits originated in <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong>. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants. 
          <br /><br />
          <span className="font-bold italic" style={{ color: 'var(--charcoal-accent)' }}>Coming Soon: Professional Soccer Boots & Balls!</span>
        </p>
      </section>

      {/* FOOTER */}
      <footer className="p-8 text-center text-xs" style={{ color: 'var(--muted-gold)' }}>
        <p>© 2026 Kopala Kits. Built for the Copperbelt.</p>
      </footer>
    </div>
  );
}
