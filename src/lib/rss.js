/**
 * Free RSS feed fetcher. Caches in-memory for 30 minutes. No auth required
 * for any of the public sports RSS feeds we use. On CORS failure (some
 * feeds don't send CORS headers), falls back to a server-side proxy at
 * /api/news which uses Cloudflare Workers' fetch (no CORS issue).
 *
 * Returns a normalized shape:
 *   { title, link, description, pubDate, source, image? }
 */

const FEEDS = [
  {
    id: 'bbc-football',
    label: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
  },
  {
    id: 'espn-soccer',
    label: 'ESPN FC',
    url: 'https://www.espn.com/espn/rss/soccer/news',
  },
  {
    id: 'espn-english-premier',
    label: 'ESPN Premier League',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/eng.1',
  },
];

const RSS_TTL_MS = 30 * 60 * 1000;
const rssCache = new Map();

async function fetchRssFromOrigin(feed) {
  const res = await fetch(feed.url, { headers: { 'User-Agent': 'KopalaKits/1.0' } });
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  const text = await res.text();
  return parseRss(text, feed);
}

async function fetchRssFromProxy(feed) {
  // Fall back to the worker's /api/news proxy if the browser CORS-blocks us.
  const res = await fetch(`/api/news?feed=${feed.id}`);
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json();
}

export async function fetchFeed(feedId) {
  const feed = FEEDS.find((f) => f.id === feedId);
  if (!feed) return null;
  const now = Date.now();
  const hit = rssCache.get(feedId);
  if (hit && now - hit.t < RSS_TTL_MS) return hit.data;
  try {
    let data;
    try {
      data = await fetchRssFromOrigin(feed);
    } catch {
      data = await fetchRssFromProxy(feed);
    }
    rssCache.set(feedId, { t: now, data });
    return data;
  } catch {
    if (hit) return hit.data;
    return { feed: feedId, label: feed.label, items: [] };
  }
}

export async function fetchAllFeeds() {
  const out = await Promise.all(FEEDS.map((f) => fetchFeed(f.id)));
  return out.filter(Boolean);
}

export const RSS_FEEDS = FEEDS;

/**
 * Minimal RSS parser. Handles RSS 2.0 well enough for the feeds we use.
 * Extracts: title, link, description, pubDate, and the first <enclosure>
 * or <media:thumbnail> image.
 */
function parseRss(xmlText, feed) {
  const items = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/g;
  const match = xmlText.match(itemRe);
  if (!match) return { feed: feed.id, label: feed.label, items };
  for (const raw of match.slice(0, 25)) {
    const title = textOf(raw, 'title');
    const link = textOf(raw, 'link');
    const description = textOf(raw, 'description');
    const pubDate = textOf(raw, 'pubDate');
    const image = enclosureUrl(raw) || mediaThumb(raw);
    if (title && link) {
      items.push({
        title: decodeEntities(stripTags(title)),
        link,
        description: decodeEntities(stripTags(description)).slice(0, 240),
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        source: feed.label,
        image: image || null,
      });
    }
  }
  return { feed: feed.id, label: feed.label, items };
}

function textOf(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return m[1].trim();
}

function enclosureUrl(xml) {
  const m = xml.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/i);
  return m ? m[1] : null;
}

function mediaThumb(xml) {
  const m = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  return m ? m[1] : null;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
