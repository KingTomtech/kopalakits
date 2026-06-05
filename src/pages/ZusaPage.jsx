import { GraduationCap, MapPin, Mail, Globe } from 'lucide-react';
import { ZUSA } from '../lib/orgs.js';

export default function ZusaPage() {
  return (
    <div className="kk-fade">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${ZUSA.accentColor} 0%, var(--text) 130%)`, color: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              {ZUSA.coverEmoji}
            </div>
            <div>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                Est. {ZUSA.established}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{ZUSA.fullName}</h1>
          <p className="text-lg md:text-xl opacity-90 mt-2 max-w-2xl">{ZUSA.blurb}</p>
        </div>
      </section>

      {/* About */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="md:col-span-2 rounded-2xl p-6"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              About ZUSA
            </h2>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ZUSA.about}</p>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              HQ
            </h3>
            <p className="font-bold mt-2" style={{ color: 'var(--text)' }}>
              <MapPin size={14} className="inline -mt-0.5" /> {ZUSA.hq}
            </p>
            <a
              href={`https://${ZUSA.contact.website.replace('https://', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold"
              style={{ color: ZUSA.accentColor }}
            >
              <Globe size={14} /> {ZUSA.contact.website}
            </a>
          </div>
        </div>
      </section>

      {/* ZUS Games 2026 */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          {ZUSA.games.edition}
        </h2>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          The biggest multi-sport university event in Zambia. Hosted this year by{' '}
          <strong>{ZUSA.games.host}</strong>, {ZUSA.games.dates}.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4">
          {ZUSA.games.sports.map((s) => (
            <div
              key={s}
              className="rounded-2xl p-3 text-sm font-bold text-center"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Member universities */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Member universities
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {ZUSA.memberUniversities.length} institutions
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ZUSA.memberUniversities.map((u) => (
            <div
              key={u}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: ZUSA.accentColor, color: '#FFFFFF' }}
              >
                <GraduationCap size={18} />
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{u}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div
          className="rounded-3xl p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
          style={{ backgroundColor: ZUSA.accentColor, color: '#FFFFFF' }}
        >
          <div>
            <h3 className="text-2xl font-black tracking-tight">Represent your university</h3>
            <p className="mt-1 opacity-90">
              Whether you play, coach, or just love university sport — get in touch with
              ZUSA via the channels below.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${ZUSA.contact.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Mail size={16} /> {ZUSA.contact.email}
            </a>
            <a
              href={ZUSA.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold"
              style={{ backgroundColor: '#FFFFFF', color: ZUSA.accentColor }}
            >
              <Globe size={16} /> Visit ZUSA
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
