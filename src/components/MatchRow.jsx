import { useEffect, useState } from 'react';
import { Check, X as XIcon, Lock } from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function timeUntil(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return null;
  const d = Math.floor(ms / 86_400_000);
  if (d > 0) return `${d}d`;
  const h = Math.floor(ms / 3_600_000);
  if (h > 0) return `${h}h`;
  return `${Math.floor(ms / 60_000)}m`;
}

function TeamSlot({ team, side, myPick, result }) {
  const won = result && ((side === 'home' && result === 'home') || (side === 'away' && result === 'away'));
  const isMyPick = myPick === side;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: isMyPick ? '2px solid var(--brand)' : '2px solid transparent',
        }}
      >
        <span className="text-lg">⚽</span>
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-bold text-sm truncate"
          style={{ color: won ? 'var(--success)' : 'var(--text)' }}
        >
          {team.name}
        </div>
      </div>
    </div>
  );
}

export default function MatchRow({ match, myPick, busy, onPick }) {
  // Tick the clock once on mount and every minute so the kickoff countdown
  //  refreshes. Date.now() is impure so it must live in an effect.
  const [now, setNow] = useState(0);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const locked = !!match.result || (now > 0 && new Date(match.kickoff).getTime() <= now);
  const isWin = myPick && match.result && myPick === match.result;
  const isLoss = myPick && match.result && myPick !== match.result;
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-3 rounded-2xl border"
      style={{
        borderColor: isWin ? 'var(--success)' : isLoss ? 'var(--danger)' : 'var(--border)',
        backgroundColor: isWin ? 'rgba(31,138,76,0.06)' : isLoss ? 'rgba(197,54,74,0.06)' : 'var(--surface)',
      }}
    >
      <TeamSlot team={match.home} side="home" myPick={myPick} result={match.result} />
      <div className="text-center px-1">
        {match.result ? (
          <div
            className="font-black text-lg"
            style={{ color: 'var(--text)' }}
          >
            {match.result === 'draw' ? 'D' : (match.result === 'home' ? 'H' : 'A')}
          </div>
        ) : (
          <div className="text-xs font-bold" style={{ color: 'var(--text-faint)' }}>vs</div>
        )}
      </div>
      <TeamSlot team={match.away} side="away" myPick={myPick} result={match.result} />
      <div className="col-span-3 mt-2 flex items-center gap-2 flex-wrap">
        <span className="text-xs tabular-nums" style={{ color: 'var(--text-faint)' }}>
          {fmtDate(match.kickoff)}
        </span>
        {locked ? (
          <span
            className="inline-flex items-center gap-1 text-xs font-bold"
            style={{ color: isWin ? 'var(--success)' : isLoss ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            {isWin ? <><Check size={12} /> Correct</> : isLoss ? <><XIcon size={12} /> Wrong</> : <><Lock size={12} /> Locked</>}
          </span>
        ) : (
          <>
            <button
              onClick={() => onPick(match.id, 'home')}
              disabled={busy}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border-2"
              style={{
                backgroundColor: myPick === 'home' ? 'var(--brand)' : 'transparent',
                borderColor: myPick === 'home' ? 'var(--brand)' : 'var(--border)',
                color: myPick === 'home' ? '#FFFFFF' : 'var(--text)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              Home win
            </button>
            <button
              onClick={() => onPick(match.id, 'away')}
              disabled={busy}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border-2"
              style={{
                backgroundColor: myPick === 'away' ? 'var(--danger)' : 'transparent',
                borderColor: myPick === 'away' ? 'var(--danger)' : 'var(--border)',
                color: myPick === 'away' ? '#FFFFFF' : 'var(--text)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              Away win
            </button>
            {timeUntil(match.kickoff) && (
              <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>
                in {timeUntil(match.kickoff)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
