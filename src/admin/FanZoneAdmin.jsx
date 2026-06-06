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
      const data = await res.json().catch(() => ({}));
      setFixtures(data.fixtures || []);
    } catch (e) {
      flash(e.message || 'Failed to load fixtures', true);
    } finally { setLoading(false); }
  }, []);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tournaments', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      setTournaments(data.tournaments || []);
    } catch (e) {
      flash(e.message || 'Failed to load tournaments', true);
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
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {toast && (
        <div className="rounded-xl p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
          <Save size={16} /> {toast}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setActive('results')}
          className="px-3 py-1.5 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: active === 'results' ? 'var(--text)' : 'transparent',
            color: active === 'results' ? 'var(--bg)' : 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          <Target size={14} className="inline -mt-0.5 mr-1" />
          Set match results
        </button>
        <button
          onClick={() => setActive('tournaments')}
          className="px-3 py-1.5 rounded-lg text-sm font-bold"
          style={{
            backgroundColor: active === 'tournaments' ? 'var(--text)' : 'transparent',
            color: active === 'tournaments' ? 'var(--bg)' : 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          <Trophy size={14} className="inline -mt-0.5 mr-1" />
          Manage tournaments
        </button>
        <button
          onClick={active === 'results' ? loadFixtures : loadTournaments}
          className="ml-auto p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {active === 'results' && (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Set the actual result of each finished fixture so predictions can be scored
            and the leaderboard updates. Locked fixtures are past kickoff.
          </p>
          {fixtures.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              No fixtures in the cache yet. Visit the public Predictions page first
              so the system pulls upcoming events, then come back here.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {fixtures.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl p-3 border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold uppercase tracking-wider">{f.league || 'Friendly'}</span>
                    {f.locked && <span className="px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>Locked</span>}
                    {f.result && <span className="px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>Result set</span>}
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {f.home.name} vs {f.away.name}
                  </div>
                  <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                    {new Date(f.kickoff).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['home', 'draw', 'away'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setResult(f.id, r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold border"
                        style={{
                          backgroundColor: f.result === r ? 'var(--brand)' : 'transparent',
                          borderColor: f.result === r ? 'var(--brand)' : 'var(--border)',
                          color: f.result === r ? 'var(--bg)' : 'var(--text)',
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
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Edit or delete tournaments. The full JSON editor lives in the products
            tab; here you can delete a tournament to reset it.
          </p>
          {tournaments.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No tournaments yet.</p>
          ) : (
            <div className="space-y-2">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl p-3 border flex items-center gap-3"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: t.accentColor, color: '#FFFFFF' }}
                  >
                    {t.coverEmoji || '⚽'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.status} · {(t.rounds || []).reduce((s, r) => s + (r.matches?.length || 0), 0)} matches
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTournament(t.id)}
                    className="p-2 rounded-lg hover:bg-[var(--danger-bg)] text-[var(--danger)]"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
            To create or edit a tournament bracket in detail, use the Admin "Edit JSON"
            tab — export the current tournaments, edit, and re-import.
          </p>
        </div>
      )}
    </div>
  );
}
