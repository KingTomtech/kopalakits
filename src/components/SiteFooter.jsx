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
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition"
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
            <li><a href="/" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Home</a></li>
            <li><a href="/shop" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Shop all kits</a></li>
            <li><a href="/shop?category=Local" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Local teams</a></li>
            <li><a href="/shop?category=International" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>International</a></li>
            <li><a href="/shop?category=National" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>National teams</a></li>
            <li><a href="/shop?category=Retro" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Retro classics</a></li>
            <li><a href="/about" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>About us</a></li>
            <li><a href="/contact" className="font-medium hover:underline" style={{ color: 'var(--text-muted)' }}>Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--text-faint)' }}>Find Us</h4>
          <address className="not-italic text-sm space-y-1.5" style={{ color: 'var(--text-muted)' }}>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <span>K-Block, Copperbelt University<br />Kitwe, Copperbelt Province, Zambia</span>
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
