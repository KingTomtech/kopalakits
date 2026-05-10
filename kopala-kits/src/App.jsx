import React, { useState } from 'react';
import { ShoppingCart, MapPin, MessageCircle, Info, ChevronRight } from 'lucide-react';

// 1. PRODUCT DATABASE (International & Local)
const products = [
  {
    id: 1,
    name: "Man United 25/26 Home",
    price: 850,
    category: "International",
    img: "https://images.footballfanatics.com/manchester-united/manchester-united-adidas-home-shirt-2025-26_ss5_p-200784345.jpg",
    desc: "Premium quality Red Devils home kit."
  },
  {
    id: 2,
    name: "Arsenal 25/26 Home",
    price: 850,
    category: "International",
    img: "https://images.footballfanatics.com/arsenal/arsenal-adidas-home-shirt-2025-26_ss5_p-200784346.jpg",
    desc: "The Gunners classic red and white."
  },
  {
    id: 3,
    name: "Chipolopolo Home 2026",
    price: 750,
    category: "Local",
    img: "https://faz.techmasterszambia.com/wp-content/uploads/2023/kopa-green.jpg",
    desc: "Official Zambia National Team Jersey."
  },
  {
    id: 4,
    name: "Real Madrid 25/26 Home",
    price: 900,
    category: "International",
    img: "https://images.footballfanatics.com/real-madrid/real-madrid-adidas-home-shirt-2025-26.jpg",
    desc: "Hala Madrid! The iconic white kit."
  },
  {
    id: 5,
    name: "Power Dynamos Home",
    price: 650,
    category: "Local",
    img: "https://umbro.co.za/cdn/shop/products/PowerDynamosHome.jpg",
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black tracking-tighter text-green-700">KOPALA KITS</h1>
        <div className="flex gap-4">
          <a href="#about" className="text-sm font-medium">About</a>
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <MapPin size={12} /> CBU K-BLOCK
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="bg-green-700 text-white px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-2">Copperbelt's Finest Kits</h2>
        <p className="opacity-90 mb-6">Local & International jerseys delivered to your doorstep.</p>
        <div className="flex justify-center gap-2">
          {['All', 'International', 'Local'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === cat ? 'bg-white text-green-700' : 'bg-green-800 text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
            <img 
              src={product.img} 
              alt={product.name} 
              className="h-48 w-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Jersey+Coming+Soon'; }}
            />
            <div className="p-3 flex-grow">
              <span className="text-[10px] font-bold uppercase text-gray-400">{product.category}</span>
              <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
              <p className="text-green-700 font-black mt-1">K{product.price}</p>
            </div>
            <button 
              onClick={() => sendWhatsApp(product.name)}
              className="m-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition"
            >
              <MessageCircle size={14} /> ORDER NOW
            </button>
          </div>
        ))}
      </main>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-white m-4 p-6 rounded-2xl border">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Info className="text-green-600" /> Our Story
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Kopala Kits originated in <strong>Luanshya</strong> and has now established its headquarters at 
          <strong> CBU, K Block</strong>. We specialize in high-quality soccer jerseys for both local 
          Zambian teams and international giants. 
          <br /><br />
          <span className="font-bold text-gray-900 italic">Coming Soon: Professional Soccer Boots & Balls!</span>
        </p>
      </section>

      {/* FOOTER */}
      <footer className="p-8 text-center text-gray-400 text-xs">
        <p>© 2026 Kopala Kits. Built for the Copperbelt.</p>
      </footer>
    </div>
  );
}
