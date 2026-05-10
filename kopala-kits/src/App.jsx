import React, { useState } from 'react';
import { ShoppingCart, MapPin, MessageCircle, Info, ChevronRight, Star, Truck, Shield } from 'lucide-react';

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
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  const sendWhatsApp = (productName) => {
    const phone = "260XXXXXXXXX"; // REPLACE WITH YOUR NUMBER
    const msg = `Hi Kopala Kits! I'm at CBU K-Block and I want to buy the ${productName}. Is it available?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: 'var(--ethereal-ivory)', color: 'var(--charcoal-accent)' }}>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center shadow-sm transition-all" style={{ backgroundColor: 'rgba(253, 251, 247, 0.95)' }}>
        <h1 className="text-lg sm:text-xl font-black tracking-tighter flex items-center gap-2" style={{ color: 'var(--dusty-sage)' }}>
          <Star size={18} fill="currentColor" />
          KOPALA KITS
        </h1>
        <div className="flex gap-3 sm:gap-4">
          <a href="#about" className="hidden sm:block text-sm font-medium hover:opacity-70 transition" style={{ color: 'var(--charcoal-accent)' }}>About</a>
          <div className="px-2 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: 'var(--warm-beige)', color: 'var(--charcoal-accent)' }}>
            <MapPin size={12} /> K-BLOCK
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative px-4 sm:px-6 py-12 sm:py-16 text-center overflow-hidden" style={{ backgroundColor: 'var(--dusty-sage)', color: 'var(--soft-cream)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">Copperbelt's Finest Kits</h2>
          <p className="text-sm sm:text-base opacity-90 mb-8 max-w-md mx-auto leading-relaxed">Premium local & international jerseys delivered straight to your doorstep in Luanshya and beyond.</p>
          
          {/* Filter Buttons - Mobile Optimized */}
          <div className="inline-flex p-1.5 rounded-full shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            {['All', 'International', 'Local'].map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  filter === cat ? 'shadow-md' : 'hover:bg-white/20'
                }`}
                style={
                  filter === cat 
                    ? { backgroundColor: 'var(--soft-cream)', color: 'var(--dusty-sage)' } 
                    : { backgroundColor: 'transparent', color: 'var(--soft-cream)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* FEATURES BAR */}
      <div className="px-4 py-4 grid grid-cols-3 gap-2 sm:gap-4 border-b" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--warm-beige)' }}>
            <Truck size={16} style={{ color: 'var(--dusty-sage)' }} />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold">Fast Delivery</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--warm-beige)' }}>
            <Shield size={16} style={{ color: 'var(--dusty-sage)' }} />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold">Quality Guaranteed</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--warm-beige)' }}>
            <MessageCircle size={16} style={{ color: 'var(--dusty-sage)' }} />
          </div>
          <span className="text-[10px] sm:text-xs font-semibold">Easy Orders</span>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <main className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="group rounded-2xl shadow-md border overflow-hidden flex flex-col transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: 'var(--soft-cream)' }}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <div className="relative overflow-hidden aspect-[4/5]">
              <img 
                src={product.img} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Jersey+Coming+Soon'; }}
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm" style={{ backgroundColor: 'var(--warm-beige)', color: 'var(--charcoal-accent)' }}>
                {product.category}
              </div>
            </div>
            <div className="p-3 sm:p-4 flex-grow">
              <h3 className="font-bold text-xs sm:text-sm leading-snug mb-2 line-clamp-2" style={{ color: 'var(--charcoal-accent)' }}>{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-black" style={{ color: 'var(--dusty-sage)' }}>K{product.price}</span>
                <button 
                  onClick={() => sendWhatsApp(product.name)}
                  className="p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm"
                  style={{ backgroundColor: 'var(--dusty-sage)', color: 'var(--soft-cream)' }}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
            <button 
              onClick={() => sendWhatsApp(product.name)}
              className="mx-3 mb-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--dusty-sage)', color: 'var(--soft-cream)' }}
            >
              <MessageCircle size={14} /> ORDER NOW
            </button>
          </div>
        ))}
      </main>

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-6xl mb-4">👕</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--charcoal-accent)' }}>No jerseys found</h3>
          <p className="opacity-70">Try selecting a different category</p>
        </div>
      )}

      {/* ABOUT SECTION */}
      <section id="about" className="m-4 sm:m-6 p-6 sm:p-8 rounded-2xl border-2 shadow-md" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2.5">
          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--warm-beige)' }}>
            <Info size={20} style={{ color: 'var(--dusty-sage)' }} />
          </div>
          Our Story
        </h3>
        <p className="text-sm sm:text-base leading-relaxed mb-4" style={{ color: 'var(--charcoal-accent)' }}>
          Kopala Kits originated in the heart of <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong>. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants, bringing the beautiful game closer to fans across the Copperbelt.
        </p>
        <div className="p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--warm-beige)', borderColor: 'var(--dusty-sage)' }}>
          <p className="text-sm font-semibold italic flex items-center gap-2" style={{ color: 'var(--charcoal-accent)' }}>
            <Star size={16} fill="currentColor" style={{ color: 'var(--dusty-sage)' }} />
            Coming Soon: Professional Soccer Boots & Balls!
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-8 text-center border-t mt-8" style={{ backgroundColor: 'var(--soft-cream)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star size={16} style={{ color: 'var(--dusty-sage)' }} fill="currentColor" />
          <span className="font-black text-sm" style={{ color: 'var(--dusty-sage)' }}>KOPALA KITS</span>
        </div>
        <p className="text-xs opacity-70 mb-2">© 2026 Kopala Kits. Built for the Copperbelt.</p>
        <p className="text-xs opacity-50">From Luanshya with ❤️</p>
      </footer>
    </div>
  );
}
