import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, Sun, Moon } from 'lucide-react';
import Logo from './components/Logo.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import PredictionsPage from './pages/PredictionsPage.jsx';
import TournamentsPage from './pages/TournamentsPage.jsx';
import TournamentDetailPage from './pages/TournamentDetailPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import ZusaPage from './pages/ZusaPage.jsx';
import FazPage from './pages/FazPage.jsx';
import MediaPage from './pages/MediaPage.jsx';
import BottomNav from './components/BottomNav.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import QuickAddModal from './components/QuickAddModal.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Toast from './components/Toast.jsx';
import FloatingWhatsApp from './components/FloatingWhatsApp.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import { useProducts } from './hooks/useProducts.js';
import { useCart } from './hooks/useCart.js';
import { useTheme } from './hooks/useTheme.js';
import { useSEO } from './lib/seo.js';
import { PHONE_FALLBACK } from './constants.js';

export default function App() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [logoPulsing, setLogoPulsing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const { products, loading, loadError, reload, banner, dismissBanner } = useProducts();
  const cart = useCart(setToast);
  const { darkMode, toggleDarkMode } = useTheme();

  // Update page title and meta tags on every route change
  useSEO(location.pathname);

  // Scroll-to-top on route change so detail pages don't carry the home scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [location.pathname]);

  // Reset mobile menu on navigation. setState-in-effect is the right pattern
  // here — we want the menu to close when the route changes, not when the
  // user opens it (which would cause a re-render loop).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  // Logo 5-tap admin access with a 3rd/4th-click pulse hint.
  const handleLogoClick = useCallback(() => {
    setLogoClicks((c) => {
      const next = c + 1;
      if (next >= 5) {
        setLogoPulsing(false);
        window.dispatchEvent(new CustomEvent('kopala:open-admin'));
        return 0;
      }
      if (next >= 3) setLogoPulsing(true);
      return next;
    });
  }, []);

  // Reset logo counter after 1.5s of inactivity.
  useEffect(() => {
    if (logoClicks === 0) return;
    const t = setTimeout(() => setLogoClicks(0), 1500);
    return () => clearTimeout(t);
  }, [logoClicks]);

  const showToast = useCallback((msg) => {
    setToast({ id: Date.now(), msg });
    setTimeout(() => setToast((cur) => (cur && cur.msg === msg ? null : cur)), 1800);
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--bg)' }}>
      <AnnouncementBar banner={banner} onDismiss={dismissBanner} />

      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            onClick={handleLogoClick}
            className={`group ${logoPulsing ? 'kk-pulse' : ''}`}
            aria-label="Kopala Kits home"
          >
            <Logo size={36} variant="wordmark" color="olive" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>Home</Link>
            <Link to="/shop" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>Shop</Link>
            <Link to="/predictions" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5 inline-flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
              Predictions
            </Link>
            <Link to="/tournaments" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>Tournaments</Link>
            <Link to="/news" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>News</Link>
            <Link to="/media" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>Media</Link>
            <Link to="/about" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>About</Link>
            <Link to="/contact" className="px-3 py-2 rounded-xl text-sm font-bold hover:bg-black/5" style={{ color: 'var(--text)' }}>Contact</Link>
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl hover:bg-black/5 transition"
              aria-label={`Open cart, ${cart.count} items`}
            >
              <ShoppingCart size={20} style={{ color: 'var(--text)' }} />
              {cart.count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {cart.count}
                </span>
              )}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl hover:bg-black/5 transition hidden sm:inline-flex"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode
                ? <Sun size={20} style={{ color: 'var(--text)' }} />
                : <Moon size={20} style={{ color: 'var(--text)' }} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-2xl hover:bg-black/5 transition md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} style={{ color: 'var(--text)' }} />
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={
            <HomePage
              products={products} loading={loading} loadError={loadError} reload={reload}
              onAddToCart={setQuickAddProduct} cart={cart} showToast={showToast}
            />
          } />
          <Route path="/shop" element={
            <ShopPage
              products={products} loading={loading} loadError={loadError} reload={reload}
              onAddToCart={setQuickAddProduct} cart={cart} showToast={showToast}
            />
          } />
          <Route path="/product/:id" element={
            <ProductPage
              products={products} loading={loading}
              onAddToCart={setQuickAddProduct} cart={cart} showToast={showToast}
            />
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage phone={PHONE_FALLBACK} />} />
          <Route path="/predictions" element={
            <PredictionsPage showToast={showToast} />
          } />
          <Route path="/tournaments" element={
            <TournamentsPage showToast={showToast} />
          } />
          <Route path="/tournaments/:id" element={
            <TournamentDetailPage showToast={showToast} />
          } />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/zusa" element={<ZusaPage />} />
          <Route path="/faz" element={<FazPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <SiteFooter phone={PHONE_FALLBACK} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        phone={PHONE_FALLBACK}
      />

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
          onAdd={(line) => { cart.add(line); showToast(`Added ${line.name} to cart`); }}
        />
      )}

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
      />

      <BottomNav />
      <FloatingWhatsApp phone={PHONE_FALLBACK} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Tailwind keyframe used by the logo 3rd/4th click pulse */}
      <style>{`@keyframes kkPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } .kk-pulse { animation: kkPulse 400ms ease-in-out 2; }`}</style>
    </div>
  );
}
