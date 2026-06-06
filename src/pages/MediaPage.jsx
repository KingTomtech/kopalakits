import { Music2, ExternalLink, Play, Heart, MessageCircle } from 'lucide-react';
import { YouTubeIcon, InstagramIcon, FacebookIcon } from '../components/BrandIcons.jsx';
import { useState } from 'react';

const INSTAGRAM_HANDLE = 'kopala_kits';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
const TIKTOK_HANDLE = 'kopala.kits'; // placeholder — verify before launch
const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`;

// YouTube embeds use the privacy-enhanced youtube-nocookie.com domain which
// doesn't set cookies until the user clicks Play.
// TODO: add real video IDs before launch
const YOUTUBE_VIDEOS = [];

function YoutubeEmbed({ id, title }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border aspect-video relative"
      style={{ borderColor: 'var(--border)', backgroundColor: '#000' }}
    >
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
      />
    </div>
  );
}

function InstagramProfile() {
  // Use Instagram's official embed widget for the profile timeline.
  // It auto-resizes and is responsive up to a width.
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div
        className="px-4 py-3 flex items-center gap-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)' }}
        >
          <InstagramIcon size={20} />
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>@{INSTAGRAM_HANDLE}</div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold"
            style={{ color: 'var(--brand-deep)' }}
          >
            View on Instagram <ExternalLink size={10} className="inline -mt-0.5" />
          </a>
        </div>
      </div>
      <iframe
        title={`@${INSTAGRAM_HANDLE} on Instagram`}
        src={`https://www.instagram.com/${INSTAGRAM_HANDLE}/embed/`}
        loading="lazy"
        className="w-full"
        style={{ border: 0, height: 540, maxWidth: '100%' }}
        allow="clipboard-write; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

function FacebookPage() {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: '#1877F2' }}
        >
          <FacebookIcon size={20} />
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>Kopala Kits</div>
          <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Facebook page</div>
        </div>
      </div>
      <iframe
        title="Kopala Kits on Facebook"
        src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fkopalakits&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
        loading="lazy"
        className="w-full"
        style={{ border: 'none', overflow: 'hidden', height: 600 }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
      />
    </div>
  );
}

function TikTokEmbed() {
  // TikTok's official embed only supports individual video URLs, not profiles.
  // We link out to the profile and embed one featured video.
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: '#000' }}
        >
          <Music2 size={20} />
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>TikTok</div>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold"
            style={{ color: 'var(--brand-deep)' }}
          >
            @{TIKTOK_HANDLE} <ExternalLink size={10} className="inline -mt-0.5" />
          </a>
        </div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Find us on TikTok for kit reveals, behind-the-scenes, and the occasional dance.
      </p>
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-bold"
        style={{ backgroundColor: '#000' }}
      >
        <Music2 size={14} /> Open TikTok
      </a>
    </div>
  );
}

export default function MediaPage() {
  const [tab, setTab] = useState('youtube'); // 'youtube' | 'instagram' | 'tiktok' | 'facebook'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 kk-fade">
      <section
        className="rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--brand-deep) 0%, var(--text) 130%)', color: '#FFFFFF' }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Media</h1>
        <p className="mt-2 max-w-2xl opacity-90">
          Watch kit reveals, see behind-the-scenes, and follow us on social. We post
          new content weekly — follow to never miss a drop.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'youtube',   label: 'YouTube',  icon: <YouTubeIcon size={14} />,   color: '#FF0000' },
            { id: 'instagram', label: 'Instagram', icon: <InstagramIcon size={14} />, color: '#E1306C' },
            { id: 'tiktok',    label: 'TikTok',   icon: <Music2 size={14} />,    color: '#000000' },
            { id: 'facebook',  label: 'Facebook', icon: <FacebookIcon size={14} />,  color: '#1877F2' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border-2 transition"
              style={{
                backgroundColor: tab === t.id ? t.color : 'transparent',
                borderColor: tab === t.id ? t.color : 'rgba(255,255,255,0.4)',
                color: tab === t.id ? '#FFFFFF' : '#FFFFFF',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'youtube' && (
        <div>
          <h2 className="text-xl font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            <span className="inline-flex items-center gap-2">
              <YouTubeIcon size={18} style={{ color: '#FF0000' }} /> Latest videos
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YOUTUBE_VIDEOS.map((v) => (
              <div key={v.id} className="kk-rise">
                <YoutubeEmbed id={v.id} title={v.title} />
                <div className="mt-2 text-sm font-bold" style={{ color: 'var(--text)' }}>{v.title}</div>
                <a
                  href={`https://youtu.be/${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Watch on YouTube
                </a>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="https://www.youtube.com/@kopala_kits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold"
              style={{ backgroundColor: '#FF0000' }}
            >
              <YouTubeIcon size={16} /> Subscribe
            </a>
            <a
              href="https://www.youtube.com/@kopala_kits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold border-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Play size={14} /> Open channel
            </a>
          </div>
        </div>
      )}

      {tab === 'instagram' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InstagramProfile />
          <div
            className="rounded-2xl p-5 border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
              <span className="inline-flex items-center gap-2">
                <Heart size={16} style={{ color: '#E1306C' }} /> Why follow?
              </span>
            </h2>
            <ul className="mt-3 text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
              <li>• New kit reveals before they hit the shop</li>
              <li>• Behind-the-scenes from the warehouse</li>
              <li>• Customer orders & reactions (with permission)</li>
              <li>• Live match-day stories</li>
            </ul>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)' }}
            >
              <InstagramIcon size={16} /> Open Instagram
            </a>
          </div>
        </div>
      )}

      {tab === 'tiktok' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TikTokEmbed />
          <div
            className="rounded-2xl p-5 border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
              <span className="inline-flex items-center gap-2">
                <Music2 size={16} style={{ color: '#000' }} /> What you'll see
              </span>
            </h2>
            <ul className="mt-3 text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
              <li>• 60-second kit reveals</li>
              <li>• Jersey unboxings from real customers</li>
              <li>• Match-day fan reactions</li>
              <li>• The occasional dance</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'facebook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FacebookPage />
          <div
            className="rounded-2xl p-5 border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={16} style={{ color: '#1877F2' }} /> Why we use Facebook
              </span>
            </h2>
            <ul className="mt-3 text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
              <li>• A lot of our customers in the Copperbelt are on Facebook</li>
              <li>• Group orders and event bookings</li>
              <li>• Reviews from real buyers</li>
            </ul>
          </div>
        </div>
      )}

      <section className="mt-10">
        <div
          className="rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ backgroundColor: 'var(--brand-deep)', color: '#FFFFFF' }}
        >
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black tracking-tight">Follow the build</h3>
            <p className="mt-1 opacity-90">
              Every jersey you see in the shop has a story — how it was sourced, how
              it was packed, who it went to. We tell that story on social, in
              short. Pick your platform and follow along.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)' }}
            >
              <InstagramIcon size={16} /> @{INSTAGRAM_HANDLE}
            </a>
            <a
              href="https://www.youtube.com/@kopala_kits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold"
              style={{ backgroundColor: '#FF0000' }}
            >
              <YouTubeIcon size={16} /> YouTube
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold"
              style={{ backgroundColor: '#000' }}
            >
              <Music2 size={16} /> @{TIKTOK_HANDLE}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
