import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Trophy, Newspaper, Video, TrendingUp } from 'lucide-react';

const ITEMS = [
  { to: '/',            label: 'Home',        icon: Home,        end: true },
  { to: '/shop',        label: 'Shop',        icon: ShoppingBag },
  { to: '/predictions', label: 'Predict',     icon: TrendingUp },
  { to: '/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/news',        label: 'News',        icon: Newspaper },
  { to: '/media',       label: 'Media',       icon: Video },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur-md md:hidden"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg) 92%, transparent)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
      aria-label="Primary"
    >
      <ul className="grid grid-cols-6">
        {ITEMS.map((it) => {
          const active = it.end ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <li key={it.to}>
              <NavLink
                to={it.to}
                end={it.end}
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold transition hover:opacity-80"
                style={{ color: active ? 'var(--brand-deep)' : 'var(--text-muted)' }}
                aria-current={active ? 'page' : undefined}
              >
                <it.icon size={20} />
                {it.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
