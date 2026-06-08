import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import Logo from './Logo.jsx';

export default function SiteFooter({ phone }) {
  const prettyPhone = phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  return (
    <footer
      className="border-t mt-12"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Logo size={32} variant="wordmark" />
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Premium soccer jerseys for every fan. Local, international, national &amp; retro classics — all at the best prices in Kitwe.
          </p>
          <a
            href={`https://wa.me/${phone}`}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition hover:brightness-110"
            style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
          >
            <MessageCircle size={16} /> Chat with Us
          </a>
          <a
            href="/admin"
            className="mt-2 inline-block text-xs font-bold hover:underline"
            style={{ color: 'var(--text-faint)' }}
          >
            Admin panel →
          </a>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--text-faint)' }}>Browse</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
            <li><Link to="/shop" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Shop all kits</Link></li>
            <li><Link to="/shop?category=Local" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Local teams</Link></li>
            <li><Link to="/shop?category=International" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>International</Link></li>
            <li><Link to="/shop?category=Leagues" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Leagues</Link></li>
            <li><Link to="/shop?category=Retro" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Retro classics</Link></li>
            <li><Link to="/about" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>About us</Link></li>
            <li><Link to="/contact" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--text-faint)' }}>Find Us</h4>
          <address className="not-italic text-sm space-y-1.5" style={{ color: 'var(--text-muted)' }}>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                  style={{ backgroundColor: 'var(--brand)', color: '#FFFFFF' }}
                >
                  Kitwe
                </span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg)' }}
                >
                  Copperbelt Province
                </span>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <a href={`https://wa.me/${phone}`} className="font-medium hover:underline">+{prettyPhone}</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <a href="mailto:hello@kopala.zingati.app" className="font-medium hover:underline">hello@kopala.zingati.app</a>
            </p>

          </address>
          <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>Mon–Fri 8am–6pm · Sat 9am–4pm</p>
        </div>
      </div>
      <div className="border-t px-6 py-4 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
        {new Date().getFullYear()} Kopala Kits · Kitwe, Zambia · All prices in Zambian Kwacha (ZMW)
      </div>
    </footer>
  );
}
