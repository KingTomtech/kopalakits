import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MapPin, Clock, Lock, RefreshCw, Heart, Share2, MessageCircle } from 'lucide-react';
import { useDeviceId } from '../hooks/useDeviceId.js';
import { PHONE_FALLBACK } from '../constants.js';

const PICK_LABEL = { home: 'Home', away: 'Away', draw: 'Draw' };
const PICK_COLOR = { home: 'var(--brand)', away: 'var(--danger)', draw: 'var(--warning)' };

function timeUntil(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function PredictionCard({ fixture, onVote, onShare, busy }) {
  const t = fixture.tallies || { home: 0, away: 0, draw: 0, total: 0 };
  const pct = (n) => (t.total === 0 ? 0 : Math.round((n / t.total) * 100));
  const hasDraw = !!fixture.league;
  const myPick = fixture.myPick;

  return (
    <article
      className="rounded-2xl overflow-hidden border kk-rise"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
      >
        <span className="font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
          {fixture.league || 'Friendly'}
        </span>
        <span className="flex items-center gap-1.5 font-bold tabular-nums" style={{ color: fixture.locked ? 'var(--danger)' : 'var(--brand-deep)' }}>
          {fixture.locked ? <Lock size={12} /> : <Clock size={12} />}
          {fixture.locked ? 'Locked' : timeUntil(fixture.kickoff)}
        </span>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5">
        <TeamBlock team={fixture.home} side="home" myPick={myPick} />
        <div className="text-center">
          <div className="text-2xl font-black" style={{ color: 'var(--text-faint)' }}>vs</div>
        </div>
        <TeamBlock team={fixture.away} side="away" myPick={myPick} />
      </div>

      {fixture.venue && (
        <div className="px-5 pb-2 text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
          <MapPin size={12} /> {fixture.venue}
        </div>
      )}

      {/* Pick buttons */}
      {!fixture.locked && (
        <div className="px-5 pb-3 grid grid-cols-2 gap-2" style={{ gridTemplateColumns: hasDraw ? '1fr 1fr 1fr' : '1fr 1fr' }}>
          <PickButton side="home" myPick={myPick} disabled={busy} onClick={() => onVote(fixture.id, 'home')} />
          {hasDraw && <PickButton side="draw" myPick={myPick} disabled={busy} onClick={() => onVote(fixture.id, 'draw')} />}
          <PickButton side="away" myPick={myPick} disabled={busy} onClick={() => onVote(fixture.id, 'away')} />
        </div>
      )}

      {/* Tally bar */}
      <div className="px-5 pb-5">
        {t.total === 0 ? (
          <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
            No predictions yet. Be the first.
          </p>
        ) : (
          <>
            <div className="flex h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              {t.home > 0 && <div style={{ width: `${pct(t.home)}%`, backgroundColor: 'var(--brand)' }} />}
              {t.draw > 0 && <div style={{ width: `${pct(t.draw)}%`, backgroundColor: 'var(--warning)' }} />}
              {t.away > 0 && <div style={{ width: `${pct(t.away)}%`, backgroundColor: 'var(--danger)' }} />}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
                Home {pct(t.home)}% <span style={{ color: 'var(--text-faint)' }}>({t.home})</span>
              </span>
              {hasDraw && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                  Draw {pct(t.draw)}% <span style={{ color: 'var(--text-faint)' }}>({t.draw})</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />
                Away {pct(t.away)}% <span style={{ color: 'var(--text-faint)' }}>({t.away})</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer with share */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onShare(fixture)}
          className="inline-flex items-center gap-1.5 text-xs font-bold"
          style={{ color: 'var(--text-muted)' }}
        >
          <Share2 size={12} /> Share to friends
        </button>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.total} votes</span>
      </div>
    </article>
  );
}

function TeamBlock({ team, side, myPick }) {
  const isMyPick = myPick === side;
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden transition"
        style={{
          backgroundColor: isMyPick ? 'var(--bg-elevated)' : 'transparent',
          border: isMyPick ? '2px solid var(--brand)' : '2px solid transparent',
        }}
      >
        {team.badge ? (
          <img src={team.badge} alt={team.name} className="w-12 h-12 object-contain" />
        ) : (
          <span className="text-2xl">⚽</span>
        )}
      </div>
      <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text)' }}>{team.name}</div>
    </div>
  );
}

function PickButton({ side, myPick, disabled, onClick }) {
  const active = myPick === side;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="py-3 rounded-2xl font-bold text-sm transition border-2"
      style={{
        backgroundColor: active ? PICK_COLOR[side] : 'transparent',
        borderColor: active ? PICK_COLOR[side] : 'var(--border)',
        color: active ? '#FFFFFF' : 'var(--text)',
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      aria-pressed={active}
    >
      {active ? '✓ ' : ''}{PICK_LABEL[side]} win
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="h-9 kk-skeleton" />
      <div className="p-5 grid grid-cols-3 gap-3">
        <div className="col-span-1 space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl kk-skeleton" />
          <div className="h-3 w-20 mx-auto rounded kk-skeleton" />
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <div className="h-6 w-8 rounded kk-skeleton" />
        </div>
        <div className="col-span-1 space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl kk-skeleton" />
          <div className="h-3 w-20 mx-auto rounded kk-skeleton" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="h-8 rounded-2xl kk-skeleton" />
      </div>
    </div>
  );
}

export default function PredictionsPage({ showToast }) {
  const deviceId = useDeviceId();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [busyPickId, setBusyPickId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/predictions', { headers: { 'X-Device-Id': deviceId } });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json().catch(() => ({}));
      setFixtures(data.fixtures || []);
    } catch (e) {
      setError(e.message || 'Could not load fixtures.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch('/api/predictions/refresh', { method: 'POST' });
      await load();
      showToast?.('Fixtures refreshed');
    } catch {
      showToast?.('Refresh failed — try again');
    } finally {
      setRefreshing(false);
    }
  }, [load, showToast]);

  const vote = useCallback(async (fixtureId, pick) => {
    setBusyPickId(fixtureId);
    try {
      const res = await fetch('/api/predictions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
        body: JSON.stringify({ fixtureId, pick }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not save');
      }
      // Optimistic update: re-fetch is overkill, just patch the local state.
      await load();
      showToast?.(`Picked ${PICK_LABEL[pick]} win`);
    } catch (e) {
      showToast?.(e.message || 'Vote failed');
    } finally {
      setBusyPickId(null);
    }
  }, [deviceId, load, showToast]);

  const shareFixture = useCallback((fixture) => {
    const text = `⚽ ${fixture.home.name} vs ${fixture.away.name}\nMake your pick at kopala.zingati.app/predictions`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Kopala Kits Predictions', text, url }).catch(() => {});
    } else {
      try {
        navigator.clipboard.writeText(`${text}\n${url}`);
        showToast?.('Share text copied');
      } catch {
        window.open(`https://wa.me/${PHONE_FALLBACK}?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
  }, [showToast]);

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${PHONE_FALLBACK}?text=${encodeURIComponent("Yo! I'm calling it: my predictions are on Kopala Kits. Come play.")}`,
      '_blank'
    );
  };

  const totalVotes = fixtures.reduce((s, f) => s + (f.tallies?.total || 0), 0);
  const myVotes = fixtures.filter((f) => !!f.myPick).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      {/* Hero */}
      <section
        className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--surface) 100%)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
              style={{ backgroundColor: 'var(--brand)', color: '#FFFFFF' }}
            >
              <Trophy size={12} /> Fan Zone
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Pick the winner. Brag forever.
            </h1>
            <p className="mt-2 max-w-xl" style={{ color: 'var(--text-muted)' }}>
              Match-day predictions for the teams we sell jerseys for. Vote on the next
              fixtures, see how your pick stacks up against the Kopala Kits community.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm" style={{ color: 'var(--text-faint)' }}>
              <span><span className="font-black" style={{ color: 'var(--text)' }}>{fixtures.length}</span> upcoming</span>
              <span><span className="font-black" style={{ color: 'var(--text)' }}>{totalVotes}</span> total votes</span>
              <span><span className="font-black" style={{ color: 'var(--text)' }}>{myVotes}</span> your picks</span>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border self-start md:self-center"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backgroundColor: 'var(--surface)',
              opacity: refreshing ? 0.6 : 1,
            }}
            aria-label="Refresh fixtures"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </section>

      {/* Content */}
      {error ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : fixtures.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
        >
          <div className="text-5xl mb-3">⚽</div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>No upcoming fixtures right now</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            International breaks and off-season can leave the schedule empty. Tap refresh
            later, or message us if you want us to add a specific team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Browse shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixtures.map((f) => (
            <PredictionCard
              key={f.id}
              fixture={f}
              onVote={vote}
              onShare={shareFixture}
              busy={busyPickId === f.id}
            />
          ))}
        </div>
      )}

      {/* CTA strip */}
      <section className="mt-10">
        <div
          className="rounded-3xl p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
          style={{ backgroundColor: 'var(--brand-deep)', color: '#FFFFFF' }}
        >
          <div>
            <h2 className="text-2xl font-black tracking-tight">Think you've got what it takes?</h2>
            <p className="mt-1 opacity-90">Settle predictions with friends on WhatsApp. Bring receipts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold"
              style={{ backgroundColor: '#FFFFFF', color: 'var(--brand-deep)' }}
            >
              <MessageCircle size={16} /> WhatsApp a friend
            </button>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold border-2"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF' }}
            >
              <Heart size={16} /> Shop the kits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
