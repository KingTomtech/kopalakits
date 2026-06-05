import { useEffect, useState, useCallback } from 'react';
import { Trophy, Users, Target } from 'lucide-react';
import { useDeviceId } from '../hooks/useDeviceId.js';

function StatusBadge({ status }) {
  const map = {
    upcoming: { label: 'Upcoming', bg: 'var(--warning)', color: '#1A1815' },
    active:   { label: 'Live',     bg: 'var(--success)', color: '#FFFFFF' },
    finished: { label: 'Final',    bg: 'var(--ink-500)', color: '#FFFFFF' },
  };
  const s = map[status] || map.upcoming;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}




function TournamentCard({ tournament }) {
  const { progress } = tournament;
  const pct = progress.total ? Math.round((progress.picked / progress.total) * 100) : 0;
  return (
    <a
      href={`/tournaments/${tournament.id}`}
      className="block rounded-2xl overflow-hidden border transition hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="p-4 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${tournament.accentColor} 0%, var(--bg-elevated) 130%)` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
        >
          {tournament.coverEmoji || '⚽'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={tournament.status} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {progress.total} matches
            </span>
          </div>
          <h2 className="text-lg font-black mt-1 truncate" style={{ color: '#FFFFFF' }}>{tournament.name}</h2>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{tournament.description}</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-faint)' }}>
            <span>{progress.picked} of {progress.total} picked</span>
            <span>{progress.correct} correct</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--brand)' }} />
          </div>
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      <div className="h-20 kk-skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-3/4 rounded kk-skeleton" />
        <div className="h-3 w-1/2 rounded kk-skeleton" />
        <div className="h-1.5 w-full rounded kk-skeleton" />
      </div>
    </div>
  );
}

export default function TournamentsPage({ showToast }) {
  const deviceId = useDeviceId();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tournaments', { headers: { 'X-Device-Id': deviceId } });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (e) {
      setError(e.message || 'Could not load tournaments.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const pick = useCallback(async (tournamentId, matchId, side) => {
    try {
      const res = await fetch('/api/tournaments/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
        body: JSON.stringify({ tournamentId, matchId, pick: side }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not save');
      }
      await load();
      showToast?.(`Picked ${side} win`);
    } catch (e) {
      showToast?.(e.message || 'Pick failed');
    }
  }, [deviceId, load, showToast]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <section
        className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--brand-deep) 0%, var(--text) 100%)', color: '#FFFFFF' }}
      >
        <div className="flex items-start gap-3 mb-2">
          <Trophy size={28} />
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Tournaments</h1>
        </div>
        <p className="opacity-90 max-w-xl">
          Predict the outcomes of full tournament brackets. Pick the World Cup, the Kopala
          Cup, the Champions League — every match, every round. Highest accuracy wins
          bragging rights (and maybe a discount code).
        </p>
      </section>

      {error ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
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
      ) : tournaments.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--border)' }}
        >
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>No tournaments yet</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            The admin will set up the next tournament soon. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onPick={pick}
              busy={false}
              onOpen={() => {}}
            />
          ))}
        </div>
      )}

      <LeaderboardWidget />
    </div>
  );
}

function LeaderboardWidget() {
  const [board, setBoard] = useState(null);
  useEffect(() => {
    fetch('/api/predictions/leaderboard')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setBoard(d))
      .catch(() => setBoard(null));
  }, []);
  if (!board || !board.top?.length) return null;
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
          <span className="inline-flex items-center gap-2">
            <Target size={18} style={{ color: 'var(--brand-deep)' }} />
            Top predictors
          </span>
        </h2>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {board.totalPlayers} players · {board.totalMatches} matches played
        </span>
      </div>
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <ol className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {board.top.map((p, i) => (
            <li
              key={p.deviceId + i}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  backgroundColor: i === 0 ? 'var(--warning)' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--bg-elevated)',
                  color: i < 3 ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{p.deviceId}</div>
                <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {p.correct} of {p.picked} correct
                </div>
              </div>
              <div
                className="text-lg font-black tabular-nums"
                style={{ color: p.accuracy >= 50 ? 'var(--success)' : 'var(--text-muted)' }}
              >
                {p.accuracy}%
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-faint)' }}>
        <Users size={11} className="inline -mt-0.5" /> Anonymous leaderboard — no sign-up needed
      </p>
    </section>
  );
}
