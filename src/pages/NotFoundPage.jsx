import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

export default function NotFoundPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center kk-fade">
      <Logo size={56} variant="mark" />
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter mt-4" style={{ color: 'var(--text)' }}>
        404 — offside
      </h1>
      <p className="mt-3 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
        The page you're looking for doesn't exist. Probably a foul throw.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-2xl font-bold text-white"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          Back to home
        </Link>
        <Link
          to="/shop"
          className="px-5 py-2.5 rounded-2xl font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Browse shop
        </Link>
      </div>
    </div>
  );
}
