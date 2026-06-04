import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp({ phone }) {
  const open = () => {
    const msg = encodeURIComponent('Hi Kopala Kits! I have a question about your jerseys.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };
  return (
    <button
      onClick={open}
      className="fixed right-4 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95 mb-[env(safe-area-inset-bottom,0)]"
      style={{
        backgroundColor: '#25D366',
        bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0))',
      }}
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="text-white" />
    </button>
  );
}
