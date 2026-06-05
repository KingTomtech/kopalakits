import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Share2 } from 'lucide-react';
import { useDeviceId } from '../hooks/useDeviceId.js';
import { PHONE_FALLBACK } from '../constants.js';
import MatchRow from '../components/MatchRow.jsx';

function SkeletonRow() {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-9 rounded kk-skeleton" />
        <div className="h-9 rounded kk-skeleton" />
        <div className="h-9 rounded kk-skeleton" />
      </div>
    </div>
  );
}

export default function TournamentDetailPage({ showToast }) {
  const { id } = useParams();
  const deviceId = useDeviceId();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tournaments/${id}`, { headers: { 'X-Device-Id': deviceId } });
      if (res.status === 404) { setError('Tournament not found'); return; }
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setTournament(data.tournament);
    } catch (e) {
      setError(e.message || 'Could not load tournament.');
    } finally {
      setLoading(false);
    }
  }, [id, deviceId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const pick = useCallback(async (matchId, side) => {
    if (!tournament) return;
    setBusy(true);
    try {
      const res = await fetch('/api/tournaments/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
        body: JSON.stringify({ tournamentId: tournament.id, matchId, pick: side }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not save');
      }
      await load();
      showToast?.(`Picked ${side} win`);
    } catch (e) {
      showToast?.(e.message || 'Pick failed');
    } finally {
      setBusy(false);
    }
  }, [tournament, deviceId, load, showToast]);

  const share = () => {
    const text = `I'm predicting the ${tournament.name} on Kopala Kits. Can you beat my picks?`;
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: 'Kopala Kits', text, url }).catch(() => {});
    else window.open(`https://wa.me/${PHONE_FALLBACK}?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center kk-fade">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{error}</h1>
        <Link
          to="/tournaments"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-2xl font-bold text-white"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          <ArrowLeft size={16} /> Back to tournaments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <Link
        to="/tournaments"
        className="inline-flex items-center gap-1 text-sm font-bold mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} /> All tournaments
      </Link>

      {loading || !tournament ? (
        <div className="space-y-3">
          <div className="h-20 rounded-3xl kk-skeleton" />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <>
          <header
            className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tournament.accentColor} 0%, var(--brand-deep) 100%)`, color: '#FFFFFF' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                {tournament.coverEmoji || '⚽'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                  >
                    {tournament.status}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{tournament.name}</h1>
                <p className="mt-2 text-sm md:text-base opacity-90 max-w-2xl">{tournament.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-90">
                  <span>
                    <span className="font-black" style={{ color: '#FFFFFF' }}>{tournament.progress.picked}</span>
                    <span className="opacity-80"> / {tournament.progress.total} picked</span>
                  </span>
                  <span>
                    <span className="font-black" style={{ color: '#FFFFFF' }}>{tournament.progress.correct}</span>
                    <span className="opacity-80"> correct</span>
                  </span>
                  <span>
                    <span className="font-black" style={{ color: '#FFFFFF' }}>
                      {tournament.progress.picked ? Math.round((tournament.progress.correct / tournament.progress.picked) * 100) : 0}
                    </span>
                    <span className="opacity-80">% accuracy</span>
                  </span>
                </div>
              </div>
              <button
                onClick={share}
                className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {(tournament.rounds || []).map((round) => (
              <section key={round.name}>
                <h2 className="text-lg font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
                  {round.name}
                </h2>
                <div className="space-y-2">
                  {round.matches.map((m) => (
                    <MatchRow
                      key={m.id}
                      match={m}
                      myPick={tournament.myPicks?.[m.id]}
                      busy={busy}
                      onPick={(matchId, side) => pick(matchId, side)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10">
            <div
              className="rounded-3xl p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center"
              style={{ backgroundColor: 'var(--brand-deep)', color: '#FFFFFF' }}
            >
              <div>
                <h2 className="text-xl font-black tracking-tight">Bragging rights on the line</h2>
                <p className="mt-1 opacity-90">Beat the highest scorer and we'll give you a discount code on your next order.</p>
              </div>
              <a
                href={`https://wa.me/${PHONE_FALLBACK}?text=${encodeURIComponent("I'm playing the Kopala Kits predictions. What do I win if I beat the leaderboard?")}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold"
                style={{ backgroundColor: '#FFFFFF', color: 'var(--brand-deep)' }}
              >
                <MessageCircle size={16} /> Ask on WhatsApp
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
