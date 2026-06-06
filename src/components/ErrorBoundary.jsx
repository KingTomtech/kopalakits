import { Component } from 'react';

/**
 * Top-level error boundary so a runtime exception in the React tree
 * doesn't leave the user staring at a blank page. Renders a minimal
 * recovery UI with a "Reload" button that also clears the SW cache so
 * a buggy service worker can't trap the user.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  async handleReset() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
      }
    } catch {
      /* best-effort */
    }
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            background: 'var(--surface)',
            borderRadius: 24,
            padding: '2rem 1.75rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--brand)',
              color: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              margin: '0 auto 1rem',
            }}
          >
            K
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem', fontSize: 14, lineHeight: 1.5 }}>
            The page hit an unexpected error. Reloading should clear it up — and
            we'll also clear any stale cached data that might be the cause.
          </p>
          <button
            type="button"
            onClick={() => this.handleReset()}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              background: 'var(--brand)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {this.state.error?.message && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary style={{ fontSize: 12, color: 'var(--text-faint)', cursor: 'pointer' }}>
                Technical details
              </summary>
              <pre
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  fontSize: 11,
                  overflow: 'auto',
                  maxHeight: 200,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {String(this.state.error.message)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
