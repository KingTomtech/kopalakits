import { Award, Globe, Heart, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '24+', label: 'Kits in stock' },
  { value: '4', label: 'Categories' },
  { value: '100%', label: 'Authentic' },
  { value: '1', label: 'Tap to order' },
];

const VALUES = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Authentic only',
    body: 'Every jersey we sell is sourced from official suppliers. No knock-offs, no counterfeits — just real kits for real fans.',
  },
  {
    icon: <Truck size={20} />,
    title: 'Fast in Zambia',
    body: 'Same-day delivery in Kitwe, next-day to Ndola, Lusaka and the rest of the Copperbelt. We deliver.',
  },
  {
    icon: <Heart size={20} />,
    title: 'Local love',
    body: 'We celebrate Zambian football as much as the international game. Nkana, Power, Mufulira, Kabwe — all here.',
  },
  {
    icon: <Award size={20} />,
    title: 'Real fans, run by fans',
    body: 'We started because finding a quality jersey in Kitwe was hard. Now it is one WhatsApp message.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Retro archive',
    body: 'Sharp-era Man United, JVC Arsenal, Carlsberg Liverpool — collector pieces from the 90s, sourced with care.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Worldwide demand',
    body: 'We ship across the region. If you want a kit we do not have, message us — we source on request.',
  },
];

export default function AboutPage() {
  return (
    <div className="kk-fade">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--surface) 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <Logo size={56} variant="mark" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-4" style={{ color: 'var(--text)' }}>
            We're Kopala Kits.
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg" style={{ color: 'var(--text-muted)' }}>
            A small Zambian business with a big love for football. We started in Kitwe selling
            jerseys to friends, and now we ship to the whole Copperbelt. Premium kits, fair
            prices, no friction — order in a tap on WhatsApp.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="text-2xl font-black" style={{ color: 'var(--brand-deep)' }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand-deep)' }}>
              Our story
            </span>
            <h2 className="text-3xl font-black tracking-tight mt-1" style={{ color: 'var(--text)' }}>
              Built in Kitwe, for the fans.
            </h2>
          </div>
          <div className="space-y-4 text-base" style={{ color: 'var(--text-muted)' }}>
            <p>
              Kopala Kits was born out of frustration. Quality football jerseys were hard to find in
              Zambia, and what you did find was expensive or fake. We set out to change that.
            </p>
            <p>
              Today we stock local Zambian teams (Nkana, Power, Mufulira Wanderers, Kabwe Warriors),
              international clubs (Arsenal, Chelsea), national sides (Argentina, Portugal, England,
              France, Germany, Spain, Brazil, Zambia) and a growing retro archive of 90s classics.
            </p>
            <p>
              Our promise is simple: real jerseys, fair prices, no friction. You browse, you tap,
              you WhatsApp us. We confirm, you pay on delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>What we stand for</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-5"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
              >
                {v.icon}
              </div>
              <h3 className="font-bold mt-3" style={{ color: 'var(--text)' }}>{v.title}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div
          className="rounded-3xl p-8 text-center"
          style={{ backgroundColor: 'var(--brand-deep)', color: '#FFFFFF' }}
        >
          <h2 className="text-3xl font-black tracking-tight">Ready to find your kit?</h2>
          <p className="mt-2 opacity-90">24 jerseys, 4 categories, 1 tap to order.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold"
              style={{ backgroundColor: '#FFFFFF', color: 'var(--brand-deep)' }}
            >
              Shop the catalog
            </Link>
            <a
              href="https://wa.me/260770713619"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold border-2"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF' }}
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
