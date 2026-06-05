import { MapPin, Phone, Mail, Globe, Calendar } from 'lucide-react';
import { FAZ } from '../lib/orgs.js';

export default function FazPage() {
  return (
    <div className="kk-fade">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${FAZ.accentColor} 0%, var(--text) 130%)`, color: '#FFFFFF' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              ⚽
            </div>
            <div>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                Est. {FAZ.established}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{FAZ.fullName}</h1>
          <p className="text-lg md:text-xl opacity-90 mt-2 max-w-2xl">{FAZ.blurb}</p>
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
              About FAZ
            </h2>
            <p className="mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{FAZ.about}</p>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              Football House
            </h3>
            <p className="font-bold mt-2" style={{ color: 'var(--text)' }}>
              <MapPin size={14} className="inline -mt-0.5" /> {FAZ.hq}
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              President: <strong>{FAZ.president}</strong>
            </p>
            <a
              href={FAZ.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold"
              style={{ color: FAZ.accentColor }}
            >
              <Globe size={14} /> {FAZ.contact.website}
            </a>
          </div>
        </div>
      </section>

      {/* National teams */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          National teams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {FAZ.nationalTeams.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-5 flex items-start gap-3"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: FAZ.primaryColor, color: '#FFFFFF' }}
              >
                🦛
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold" style={{ color: 'var(--text)' }}>{t.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.nickname}</div>
                {(t.coach || t.captain) && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {t.coach && <>Coach: <strong>{t.coach}</strong></>}
                    {t.coach && t.captain && <> · </>}
                    {t.captain && <>Captain: <strong>{t.captain}</strong></>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* League pyramid */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          League pyramid
        </h2>
        <div className="mt-3 space-y-2">
          {FAZ.leagues.map((l) => (
            <div
              key={l.name}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  backgroundColor: l.tier === 1 ? FAZ.accentColor : 'var(--bg-elevated)',
                  color: l.tier === 1 ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                T{l.tier}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold" style={{ color: 'var(--text)' }}>{l.name}</div>
                {l.teams && <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{l.teams} teams</div>}
                {l.promoted && <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{l.promoted}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          Upcoming events
        </h2>
        <div className="mt-3 space-y-2">
          {FAZ.upcomingEvents.map((e) => (
            <div
              key={`${e.home}-${e.away}-${e.date}`}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text)' }}
              >
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                  {e.type}
                </div>
                <div className="font-bold" style={{ color: 'var(--text)' }}>
                  {e.home} vs {e.away}
                </div>
                {e.venue && (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.venue}</div>
                )}
              </div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
          Dates are indicative — confirm at {FAZ.contact.website}.
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div
          className="rounded-3xl p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
          style={{ backgroundColor: FAZ.accentColor, color: '#FFFFFF' }}
        >
          <div>
            <h3 className="text-2xl font-black tracking-tight">One nation. One game.</h3>
            <p className="mt-1 opacity-90">Get the official FAZ updates, fixtures, and live scores.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${FAZ.contact.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Mail size={16} /> {FAZ.contact.email}
            </a>
            <a
              href={`tel:${FAZ.contact.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Phone size={16} /> {FAZ.contact.phone}
            </a>
            <a
              href={FAZ.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold"
              style={{ backgroundColor: '#FFFFFF', color: FAZ.accentColor }}
            >
              <Globe size={16} /> Visit FAZ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
