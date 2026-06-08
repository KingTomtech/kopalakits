import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { FacebookIcon, TikTokIcon, InstagramIcon } from '../components/BrandIcons.jsx';
import { FACEBOOK_URL, TIKTOK_URL, INSTAGRAM_HANDLE, PHONE_FALLBACK } from '../constants.js';

const FAQS = [
  {
    q: 'How do I order?',
    a: 'Browse the shop, add jerseys to your cart, then tap "Order via WhatsApp" — a pre-filled message opens in WhatsApp. We confirm availability, you pay on delivery.',
  },
  {
    q: 'Do you have a physical store?',
    a: 'Yes — we are based in Kitwe. Come see the kits in person. We are open Mon–Fri 8am–6pm, Sat 9am–4pm.',
  },
  {
    q: 'Do you ship outside Kitwe?',
    a: 'Yes. Same-day in Kitwe, next-day to Ndola and the rest of the Copperbelt. We can also arrange Lusaka and further on request.',
  },
  {
    q: 'What if my size is out of stock?',
    a: 'Message us on WhatsApp and we will source it. We can usually get any team kit within a week.',
  },
  {
    q: 'Do you accept returns?',
    a: 'Yes — unworn jerseys with tags can be exchanged within 7 days. Damaged or worn items are final sale.',
  },
  {
    q: 'Are the jerseys authentic?',
    a: '100%. We source from official suppliers. Replicas are clearly labeled as such.',
  },
];

export default function ContactPage({ phone }) {
  const prettyPhone = phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  const [openIdx, setOpenIdx] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // We don't have a backend for this form — open WhatsApp with the message
    // as a fallback so the user always reaches a real human.
    const text = `Hi Kopala Kits! ${form.message ? '\n\n' + form.message : ''}${form.name ? '\n\n— ' + form.name : ''}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const socials = [
    { label: 'Facebook',  href: FACEBOOK_URL,                                bg: '#1877F2', icon: <FacebookIcon size={18} /> },
    { label: 'TikTok',    href: TIKTOK_URL,                                  bg: '#000000', icon: <TikTokIcon size={18} /> },
    { label: 'Instagram', href: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`, bg: 'var(--bg)', icon: <InstagramIcon size={18} /> },
    { label: 'WhatsApp',  href: `https://wa.me/${phone || PHONE_FALLBACK}`,  bg: '#25D366', icon: <MessageCircle size={18} color="#FFFFFF" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column — info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Talk to us.
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            WhatsApp is the fastest way to reach us. We typically reply within an hour during business hours.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href={`https://wa.me/${phone}`}
              className="flex items-center gap-3 p-3 rounded-2xl border transition hover:shadow-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#25D366', color: '#FFFFFF' }}
              >
                <MessageCircle size={18} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>WhatsApp (fastest)</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>+{prettyPhone}</div>
              </div>
            </a>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl border transition hover:shadow-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
              >
                <Phone size={18} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Phone</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>+{prettyPhone}</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl border transition hover:shadow-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
              >
                <Mail size={18} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Email</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>hello@kopala.zingati.app</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl border transition hover:shadow-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
              >
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Visit</div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
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
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-2xl border transition hover:shadow-md"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--brand-deep)' }}
              >
                <Clock size={18} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Hours</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Mon–Fri 8am–6pm · Sat 9am–4pm · Sun closed
                </div>
              </div>
            </div>
          </div>

          {/* Social row */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
              Follow us
            </h3>
            <div className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Kopala Kits on ${s.label}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold transition hover:brightness-110"
                  style={{ backgroundColor: s.bg, color: '#FFFFFF' }}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Right column — form + map */}
        <div className="space-y-4">
          <form
            onSubmit={submit}
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>Send us a message</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Submitting opens WhatsApp with your message pre-filled.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Your name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option>General</option>
                  <option>Order question</option>
                  <option>Sourcing request</option>
                  <option>Wholesale / bulk</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 text-base md:text-sm min-h-[100px]"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)' }}
                  placeholder="Tell us what you're looking for…"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Send size={16} /> {sent ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
              </button>
            </div>
          </form>

          <div
            className="rounded-2xl overflow-hidden border h-64"
            style={{ borderColor: 'var(--border)' }}
          >
            <iframe
              title="Kopala Kits location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=28.20%2C-12.81%2C28.23%2C-12.79&layer=mapnik&marker=-12.8024%2C28.2135"
              className="w-full h-full"
              style={{ border: 0, filter: 'var(--map-filter, none)' }}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Frequently asked</h2>
        <div className="mt-4 space-y-2">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              open={openIdx === i}
              onClick={(e) => { e.preventDefault(); setOpenIdx(openIdx === i ? -1 : i); }}
              className="rounded-2xl border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <summary
                className="cursor-pointer px-4 py-3 font-bold text-sm list-none flex items-center justify-between"
                style={{ color: 'var(--text)' }}
              >
                {f.q}
                <span style={{ color: 'var(--text-faint)' }}>{openIdx === i ? '−' : '+'}</span>
              </summary>
              <div className="px-4 pb-3 text-sm" style={{ color: 'var(--text-muted)' }}>{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
