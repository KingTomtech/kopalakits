import { useEffect, useState, useCallback } from 'react';
import { Save, Trash2, RefreshCw, Target, AlertCircle, Trophy } from 'lucide-react';
import { AUTH_TOKEN_KEY } from '../constants.js';

const RESULT_LABEL = { home: 'Home win', away: 'Away win', draw: 'Draw' };

export default function FanZoneAdmin() {
  const [active, setActive] = useState('results'); // 'results' | 'tournaments'
  const [fixtures, setFixtures] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const flash = (msg, isErr = false) => {
    if (isErr) { setError(msg); setTimeout(() => setError(''), 3000); }
    else { setToast(msg); setTimeout(() => setToast(''), 2500); }
  };

  const authHeaders = () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    return token ? { authorization: `Bearer ${token}` } : {};
  };

  const loadFixtures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predictions');
      const data = await res.json();
      setFixtures(data.fixtures || []);
    } finally { setLoading(false); }
  }, []);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tournaments', { headers: authHeaders() });
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (active === 'results') loadFixtures();
    if (active === 'tournaments') loadTournaments();
  }, [active, loadFixtures, loadTournaments]);

  const setResult = async (fixtureId, result) => {
    try {
      const res = await fetch('/api/admin/predictions/result', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ fixtureId, result }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed');
      }
      flash('Result saved');
      await loadFixtures();
    } catch (e) { flash(e.message, true); }
  };

  const deleteTournament = async (id) => {
    if (!window.confirm(`Delete tournament "${id}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/tournaments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed');
      flash('Tournament deleted');
      await loadTournaments();
    } catch (e) { flash(e.message, true); }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: '#FEE2E2', color: '#7F1D1D' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {toast && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: '#DCFCE7', color: '#14532D' }}>
          <Save size={16} /> {toast}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActive('results')}
          className="px-3 py-1.5 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: active === 'results' ? '#3F4A26' : 'transparent',
            color: active === 'results' ? '#FFFFFF' : '#3F4A26',
            border: '1px solid #3F4A26',
          }}
        >
          <Target size={14} className="inline -mt-0.5 mr-1" />
          Set match results
        </button>
        <button
          onClick={() => setActive('tournaments')}
          className="px-3 py-1.5 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: active === 'tournaments' ? '#3F4A26' : 'transparent',
            color: active === 'tournaments' ? '#FFFFFF' : '#3F4A26',
            border: '1px solid #3F4A26',
          }}
        >
          <Trophy size={14} className="inline -mt-0.5 mr-1" />
          Manage tournaments
        </button>
        <button
          onClick={active === 'results' ? loadFixtures : loadTournaments}
          className="ml-auto p-2 rounded-lg hover:bg-gray-100"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {active === 'results' && (
        <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: '#D8C3A5' }}>
          <p className="text-sm mb-3" style={{ color: '#6B655A' }}>
            Set the actual result of each finished fixture so predictions can be scored
            and the leaderboard updates. Locked fixtures are past kickoff.
          </p>
          {fixtures.length === 0 ? (
            <p className="text-sm italic" style={{ color: '#6B655A' }}>
              No fixtures in the cache yet. Visit the public Predictions page first
              so the system pulls upcoming events, then come back here.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {fixtures.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl p-3 border"
                  style={{ borderColor: '#EADDC6', backgroundColor: '#FAFAF8' }}
                >
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#6B655A' }}>
                    <span className="font-bold uppercase tracking-wider">{f.league || 'Friendly'}</span>
                    {f.locked && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">Locked</span>}
                    {f.result && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Result set</span>}
                  </div>
                  <div className="text-sm font-bold" style={{ color: '#3F4A26' }}>
                    {f.home.name} vs {f.away.name}
                  </div>
                  <div className="text-xs mb-2" style={{ color: '#6B655A' }}>
                    {new Date(f.kickoff).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['home', 'draw', 'away'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setResult(f.id, r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                        style={{
                          backgroundColor: f.result === r ? '#5E6B3C' : 'transparent',
                          borderColor: f.result === r ? '#5E6B3C' : '#D8C3A5',
                          color: f.result === r ? '#FFFFFF' : '#3F4A26',
                        }}
                      >
                        {RESULT_LABEL[r]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'tournaments' && (
        <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: '#D8C3A5' }}>
          <p className="text-sm mb-3" style={{ color: '#6B655A' }}>
            Edit or delete tournaments. The full JSON editor lives in the products
            tab; here you can delete a tournament to reset it.
          </p>
          {tournaments.length === 0 ? (
            <p className="text-sm italic" style={{ color: '#6B655A' }}>No tournaments yet.</p>
          ) : (
            <div className="space-y-2">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl p-3 border flex items-center gap-3"
                  style={{ borderColor: '#EADDC6', backgroundColor: '#FAFAF8' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: t.accentColor, color: '#FFFFFF' }}
                  >
                    {t.coverEmoji || '⚽'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm" style={{ color: '#3F4A26' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: '#6B655A' }}>
                      {t.status} · {(t.rounds || []).reduce((s, r) => s + (r.matches?.length || 0), 0)} matches
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTournament(t.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs mt-3" style={{ color: '#9A9388' }}>
            To create or edit a tournament bracket in detail, use the Admin "Edit JSON"
            tab — export the current tournaments, edit, and re-import.
          </p>
        </div>
      )}
    </div>
  );
}
