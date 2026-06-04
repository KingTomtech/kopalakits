export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div
      key={toast.id}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl shadow-2xl text-sm font-bold text-white pointer-events-auto kk-rise"
      style={{ backgroundColor: 'var(--text)' }}
      role="status"
      aria-live="polite"
      onClick={onDismiss}
    >
      {toast.msg}
    </div>
  );
}
