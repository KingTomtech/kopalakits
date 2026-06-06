/**
 * Free RSS feed fetcher. Caches in-memory for 30 minutes. No auth required
 * for any of the public sports RSS feeds we use. On CORS failure (some
 * feeds don't send CORS headers), falls back to a server-side proxy at
 * /api/news which uses Cloudflare Workers' fetch (no CORS issue).
 *
 * Returns a normalized shape:
 * { id, label, items: [{ title, link, description, pubDate, source, image? }] }
 *
 * Exports:
 *   RSS_FEEDS          — full feed list (immutable config)
 *   fetchFeed(id)      — fetch a single feed (cached)
 *   classify(item, filter) — filter predicate for NewsPage
 */

// ─────────────────────────────────────────────────────────────────────────────
// IMMUTABLE FEED CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const RSS_FEEDS = Object.freeze([
  // ── GENERAL FOOTBALL / SOCCER ───────────────────────────────────────────
  {
    id: 'bbc-football',
    label: 'BBC Sport – Football',
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    tags: ['football'],
  },
  {
    id: 'espn-soccer',
    label: 'ESPN FC',
    url: 'https://www.espn.com/espn/rss/soccer/news',
    tags: ['football'],
  },
  {
    id: 'guardian-football',
    label: 'The Guardian – Football',
    url: 'https://www.theguardian.com/football/rss',
    tags: ['football'],
  },
  {
    id: 'sky-sports-football',
    label: 'Sky Sports – Football',
    url: 'https://www.skysports.com/rss/12040',
    tags: ['football'],
  },
  {
    id: 'talksport-football',
    label: 'talkSPORT',
    url: 'https://talksport.com/feed/',
    tags: ['football', 'general'],
  },
  {
    id: 'fourfourtwo',
    label: 'FourFourTwo',
    url: 'https://www.fourfourtwo.com/rss',
    tags: ['football'],
  },
  {
    id: 'transfermarkt',
    label: 'Transfermarkt',
    url: 'https://www.transfermarkt.com/rss/news',
    tags: ['football', 'general'],
  },
  {
    id: 'worldsoccer',
    label: 'World Soccer',
    url: 'https://www.worldsoccer.com/rss',
    tags: ['football', 'general'],
  },
  {
    id: 'yahoo-soccer',
    label: 'Yahoo Sports Soccer',
    url: 'https://sports.yahoo.com/soccer/rss.xml',
    tags: ['football'],
  },
  {
    id: 'gazzetta',
    label: 'La Gazzetta dello Sport',
    url: 'https://www.gazzetta.it/dynamic-feed/rss/section/last.xml',
    tags: ['football'],
  },

  // ── PREMIER LEAGUE ──────────────────────────────────────────────────────
  {
    id: 'espn-english-premier',
    label: 'ESPN – Premier League',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/eng.1',
    tags: ['football', 'premier-league'],
  },

  // ── UEFA / CHAMPIONS LEAGUE ──────────────────────────────────────────────
  {
    id: 'espn-ucl',
    label: 'ESPN – Champions League',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/UEFA.CHAMPIONS',
    tags: ['football', 'champions-league'],
  },
  {
    id: 'espn-uel',
    label: 'ESPN – Europa League',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/UEFA.EUROPA',
    tags: ['football'],
  },

  // ── AFRICAN FOOTBALL ────────────────────────────────────────────────────
  {
    id: 'espn-afcon',
    label: 'ESPN – AFCON / CAF',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/CAF.NATIONS',
    tags: ['football', 'africa'],
  },
  {
    id: 'espn-cosafa',
    label: 'ESPN – COSAFA',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/CAF.COSAFA',
    tags: ['football', 'africa', 'zambia'],
  },

  // ── ZAMBIA / LOCAL ───────────────────────────────────────────────────────
  {
    id: 'bola-yapa-zed',
    label: 'Bola Yapa Zed',
    url: 'https://bolayapazed.com/feed/',
    tags: ['football', 'zambia', 'africa'],
  },
  {
    id: 'daily-mail-zm',
    label: 'Daily Mail Zambia – Sport',
    url: 'https://www.daily-mail.co.zm/category/sports/feed/',
    tags: ['football', 'zambia', 'general'],
  },
  {
    id: 'goal-diggers',
    label: 'Goal Diggers (Zambia)',
    url: 'https://diggers.news/category/goal-diggers/feed/',
    tags: ['football', 'zambia', 'africa'],
  },

  // ── OTHER MAJOR LEAGUES ──────────────────────────────────────────────────
  {
    id: 'espn-laliga',
    label: 'ESPN – La Liga',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/esp.1',
    tags: ['football'],
  },
  {
    id: 'espn-serie-a',
    label: 'ESPN – Serie A',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/ita.1',
    tags: ['football'],
  },
  {
    id: 'espn-bundesliga',
    label: 'ESPN – Bundesliga',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/ger.1',
    tags: ['football'],
  },
  {
    id: 'espn-mls',
    label: 'ESPN – MLS',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/usa.1',
    tags: ['football'],
  },
  {
    id: 'espn-world-cup',
    label: 'ESPN – World Cup',
    url: 'https://www.espn.com/espn/rss/soccer/_/league/FIFA.WORLD',
    tags: ['football'],
  },

  // ── MULTI-SPORT / GENERAL ───────────────────────────────────────────────
  {
    id: 'bbc-sport-all',
    label: 'BBC Sport – All',
    url: 'https://feeds.bbci.co.uk/sport/rss.xml',
    tags: ['general'],
  },
  {
    id: 'guardian-sport',
    label: 'The Guardian – Sport',
    url: 'https://www.theguardian.com/sport/rss',
    tags: ['general'],
  },
  {
    id: 'sky-sports-all',
    label: 'Sky Sports – All',
    url: 'https://www.skysports.com/rss/0,20514,11661,00.xml',
    tags: ['general'],
  },
  {
    id: 'espn-sport-all',
    label: 'ESPN – All Sports',
    url: 'https://www.espn.com/espn/rss/news',
    tags: ['general'],
  },

  // ── KIT / TRANSFER LAUNCHES ──────────────────────────────────────────────
  {
    id: 'footy-headlines',
    label: 'Footy Headlines',
    url: 'https://www.footyheadlines.com/feeds/posts/default',
    tags: ['kit-launches', 'football'],
  },
]);

// ─────────────────────────────────────────────────────────────────────────────
// FEED HEALTH TRACKING (Runtime state only)
// ─────────────────────────────────────────────────────────────────────────────

const feedHealth = new Map();
const MAX_FAILURES = 3;
const HEALTH_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Periodic health checks for degraded feeds
setInterval(() => {
  const now = Date.now();
  for (const [feedId, health] of feedHealth.entries()) {
    // If feed is degraded and hasn't been checked in an hour, reset for retry
    if (health.status === 'degraded' && now - health.lastCheck > HEALTH_CHECK_INTERVAL_MS) {
      feedHealth.set(feedId, {
        failures: 0,
        lastCheck: now,
        lastSuccess: health.lastSuccess,
        status: 'active'
      });
    }
  }
}, HEALTH_CHECK_INTERVAL_MS);

function updateFeedHealth(feedId, success) {
  const health = feedHealth.get(feedId) || { 
    failures: 0, 
    lastCheck: Date.now(),
    lastSuccess: null,
    status: 'active'
  };
  
  if (success) {
    health.failures = 0;
    health.lastSuccess = Date.now();
    health.status = 'active';
  } else {
    health.failures++;
    health.lastFailure = Date.now();
    health.status = health.failures >= MAX_FAILURES ? 'degraded' : 'active';
  }
  health.lastCheck = Date.now();
  
  feedHealth.set(feedId, health);
}

function isFeedHealthy(feedId) {
  const health = feedHealth.get(feedId);
  if (!health) return true;
  return health.status === 'active';
}

// Public API to get feed health (for UI)
export function getFeedHealth() {
  const healthMap = {};
  for (const [feedId, health] of feedHealth.entries()) {
    healthMap[feedId] = {
      status: health.status,
      failures: health.failures,
      lastSuccess: health.lastSuccess
    };
  }
  return healthMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const hasDOMParser = isBrowser && typeof DOMParser !== 'undefined';
const hasIntersectionObserver = isBrowser && typeof IntersectionObserver !== 'undefined';

// Safe base URL for SSR environments
function getBaseUrl() {
  if (isBrowser) {
    return window.location.origin;
  }
  // For SSR/Cloudflare Workers - can be configured via env var
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://kopalakits.com';
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if `item` matches the active `filter` tab.
 * Uses weighted scoring: feed origin (highest) > source label > text content
 */
export function classify(item, filter) {
  if (filter === 'all') return true;

  const text   = (item.title + ' ' + (item.description || '')).toLowerCase();
  const src    = (item.source  || '').toLowerCase();
  const feedId = (item._source || '').toLowerCase();

  // Zambia filter - prioritize feed origin
  if (filter === 'zambia') {
    // Feed-based detection (high confidence)
    const isZambiaFeed = /bola-yapa-zed|daily-mail-zm|goal-diggers|espn-cosafa/.test(feedId);
    if (isZambiaFeed) return true;
    
    // Source-based detection (medium confidence)
    const isZambiaSource = /znbc|daily mail zambia|times of zambia/.test(src);
    if (isZambiaSource) return true;
    
    // Keyword detection (low confidence - only if strong indicators)
    const hasStrongZambiaKeyword = /\b(zambia|chipolopolo|copper queens|faz)\b/.test(text);
    const hasLocationKeyword = /\b(kitwe|ndola|lusaka|kabwe)\b/.test(text);
    
    // Require at least two location matches or one strong team match
    const teamMatches = (text.match(/(zesco united|nkana|power dynamos|buildcon|green eagles|napsa stars|red arrows|forest rangers|kabwe warriors)/g) || []).length;
    
    return hasStrongZambiaKeyword || (hasLocationKeyword && teamMatches >= 1) || teamMatches >= 2;
  }

  // Africa filter - prioritize feed origin
  if (filter === 'africa') {
    const isAfricaFeed = /bola-yapa-zed|goal-diggers|espn-afcon|espn-cosafa/.test(feedId);
    if (isAfricaFeed) return true;
    
    const isAfricaSource = /caf online|africanews|kickoff/.test(src);
    if (isAfricaSource) return true;
    
    // Avoid false positives from Zambia-only articles
    const isZambiaOnly = /\bzambia\b/.test(text) && !/\b(africa|afcon|cosafa)\b/.test(text);
    if (isZambiaOnly) return false;
    
    return /\b(africa|afcon|cosafa|cecafa|wafu|caf|chan)\b/.test(text) &&
           /\b(egypt|nigeria|ghana|kenya|south africa|senegal|morocco|ivory coast|côte d'ivoire|ethiopia|tanzania|zimbabwe|malawi|angola|mozambique|rwanda|uganda|cameroon|algeria|tunisia|mali|burkina faso|guinea|congo|drc)\b/i.test(text);
  }

  if (filter === 'kit-launches') {
    const isKitFeed = /footy-headlines/.test(feedId);
    if (isKitFeed) return true;
    
    const isKitSource = /footy headlines|kickoff/.test(src);
    if (isKitSource) return true;
    
    // Expanded kit-related keywords
    const kitKeywords = /\b(kit|jersey|launch|reveal|drop|leaked|boots|cleats|apparel|collection|stripe|shirt|goalkeeper kit|training kit)\b/i;
    const brandKeywords = /\b(nike|adidas|puma|new balance|hummel|umbro|macron|kappa|castore|joma|kelme|errea)\b/i;
    
    return kitKeywords.test(text) && brandKeywords.test(text);
  }

  if (filter === 'world') {
    // Exclude any feed or content that is specifically Zambia/Africa
    const isExcludedFeed = /bola-yapa-zed|daily-mail-zm|goal-diggers|espn-afcon|espn-cosafa/.test(feedId);
    if (isExcludedFeed) return false;
    
    const isExcludedSource = /znbc|daily mail zambia|times of zambia|caf online|africanews/.test(src);
    if (isExcludedSource) return false;
    
    const hasExcludedContent = /\b(zambia|chipolopolo|africa|afcon|cosafa|cecafa|caf)\b/.test(text);
    return !hasExcludedContent;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

const RSS_TTL_MS = 30 * 60 * 1000;
const rssCache   = new Map();

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, value] of rssCache.entries()) {
    if (now - value.t > RSS_TTL_MS) {
      rssCache.delete(id);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

async function fetchWithRetry(feed, retries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(feed.url, { 
        headers: { 'User-Agent': 'KopalaKits/1.0' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const text = await res.text();
      const data = parseRssXml(text, feed);
      
      updateFeedHealth(feed.id, true);
      return data;
    } catch (error) {
      lastError = error;
      updateFeedHealth(feed.id, false);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

async function fetchRssFromProxy(feed, force = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const qs = new URLSearchParams({ feed: feed.id });
  if (force) qs.set('force', '1');
  const res = await fetch(`/api/news?${qs}`, {
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json();
}

export async function fetchFeed(feedId, options = { force: false }) {
  const feed = RSS_FEEDS.find((f) => f.id === feedId);
  if (!feed) return null;
  
  // Check health before attempting
  if (!isFeedHealthy(feedId) && feedHealth.get(feedId)?.failures >= MAX_FAILURES) {
    console.warn(`Feed ${feedId} is degraded, using cache if available`);
    const hit = rssCache.get(feedId);
    if (hit) return hit.data;
  }
  
  const now = Date.now();
  const hit = rssCache.get(feedId);
  
  // Bypass cache if force refresh requested
  if (!options.force && hit && now - hit.t < RSS_TTL_MS) {
    return hit.data;
  }
  
  try {
    // Go straight to proxy — external RSS feeds never support browser CORS,
    // so direct fetch always fails and spams the console. The proxy runs on
    // the same domain and handles upstream fetching server-side.
    const data = await fetchRssFromProxy(feed, options.force);
    rssCache.set(feedId, { t: now, data });
    return data;
  } catch (error) {
    updateFeedHealth(feedId, false);
    // Return cached data if available, even if expired
    if (hit) return hit.data;
    return { id: feedId, label: feed.label, items: [], error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RSS PARSER - Dual-mode (DOMParser for browser, regex fallback for SSR)
// ─────────────────────────────────────────────────────────────────────────────

function parseRssXml(xmlText, feed) {
  // Try DOMParser first (browsers)
  if (hasDOMParser) {
    try {
      const result = parseRssDomParser(xmlText, feed);
      if (result && result.items && result.items.length > 0) {
        return result;
      }
    } catch (error) {
      console.warn(`DOMParser failed for ${feed.id}, falling back to regex:`, error);
    }
  }
  
  // Fallback to regex parser (works everywhere)
  return parseRssRegex(xmlText, feed);
}

// DOMParser-based parser (more accurate, browser-only)
function parseRssDomParser(xmlText, feed) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML parsing failed');
  }
  
  const items = [];
  
  // Try RSS 2.0 first
  let itemElements = xmlDoc.querySelectorAll('item');
  
  // Fall back to Atom
  if (itemElements.length === 0) {
    itemElements = xmlDoc.querySelectorAll('entry');
  }
  
  // Limit to 25 items per feed
  const itemsArray = Array.from(itemElements).slice(0, 25);
  
  for (const elem of itemsArray) {
    // Get title
    const titleElem = elem.querySelector('title');
    const title = titleElem ? cleanText(titleElem.textContent || '') : '';
    
    // Get link - handle different formats
    let link = '';
    const linkElem = elem.querySelector('link');
    if (linkElem) {
      link = linkElem.getAttribute('href') || linkElem.textContent || '';
    }
    if (!link) {
      const atomLink = elem.querySelector('link[href]');
      if (atomLink) link = atomLink.getAttribute('href') || '';
    }
    
    // Get description/summary
    let description = '';
    const descElem = elem.querySelector('description') || 
                     elem.querySelector('summary') ||
                     elem.querySelector('content');
    if (descElem) {
      description = cleanText(descElem.textContent || '');
      // Handle CDATA
      if (descElem.innerHTML) {
        description = cleanText(descElem.innerHTML);
      }
    }
    
    // Get pubDate
    let pubDate = null;
    const dateElem = elem.querySelector('pubDate') ||
                     elem.querySelector('published') ||
                     elem.querySelector('updated');
    if (dateElem) {
      const dateStr = dateElem.textContent || '';
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        pubDate = date.toISOString();
      }
    }
    
    // Get image - comprehensive extraction for namespaced feeds
    let image = extractImageFromXmlElement(elem);

    // Get video enclosure / media
    let video = extractVideoFromXmlElement(elem);
    const videoKeywords = /\b(watch|video|highlights|clip|replay)\b/i;
    if (!video && (videoKeywords.test(title) || videoKeywords.test(description))) {
      video = true; // keyword-flagged video item
    }

    if (title && link) {
      items.push({
        title: title.slice(0, 200),
        link: validateAndSanitizeUrl(link),
        description: description.slice(0, 240),
        pubDate,
        source: feed.label,
        image: validateAndSanitizeUrl(image),
        video: video || undefined,
      });
    }
  }
  
  return { id: feed.id, label: feed.label, items };
}

// Comprehensive image extraction for namespaced XML
function extractImageFromXmlElement(element) {
  // Try common RSS image tags
  const imageSelectors = [
    'enclosure[type^="image"]',
    'media\\:content[type^="image"]',
    'media\\:thumbnail',
    'thumbnail',
    'image',
    'image url'
  ];

  for (const selector of imageSelectors) {
    try {
      const imgElem = element.querySelector(selector);
      if (imgElem) {
        const url = imgElem.getAttribute('url') ||
                    imgElem.getAttribute('href') ||
                    imgElem.textContent;
        if (url && url.match(/\.(jpg|jpeg|png|webp|gif)/i)) {
          return url;
        }
      }
    } catch (e) {
      // Some selectors with colons may throw in some environments
      continue;
    }
  }

  // Check content:encoded for images
  try {
    const contentEncoded = element.querySelector('content\\:encoded');
    if (contentEncoded && contentEncoded.textContent) {
      const imgMatch = contentEncoded.textContent.match(/<img[^>]+src="([^">]+)"/i);
      if (imgMatch) return imgMatch[1];
    }
  } catch (e) {
    // Ignore namespace errors
  }

  // Fallback to description extraction
  const descElem = element.querySelector('description') || element.querySelector('summary');
  if (descElem) {
    const content = descElem.textContent || descElem.innerHTML || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
    if (imgMatch) return imgMatch[1];
  }

  return null;
}

function extractVideoFromXmlElement(element) {
  try {
    const vidEnc = element.querySelector('enclosure[type^="video"]');
    if (vidEnc) return vidEnc.getAttribute('url') || true;
  } catch { /* ignore */ }
  try {
    const mediaVid = element.querySelector('media\\:content[type^="video"]');
    if (mediaVid) return mediaVid.getAttribute('url') || true;
  } catch { /* ignore */ }
  try {
    const group = element.querySelector('media\\:group');
    if (group) {
      const mv = group.querySelector('media\\:content[type^="video"]');
      if (mv) return mv.getAttribute('url') || true;
    }
  } catch { /* ignore */ }
  return null;
}

// Fallback regex parser (works in all environments)
function parseRssRegex(xmlText, feed) {
  const items = [];
  const itemRe = /<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/g;
  const match = xmlText.match(itemRe);

  if (!match) return { id: feed.id, label: feed.label, items: [] };

  for (const raw of match.slice(0, 25)) {
    const title = textOf(raw, 'title');
    const link = textOf(raw, 'link') || atomLinkHref(raw);
    const description = textOf(raw, 'description') || textOf(raw, 'summary') || textOf(raw, 'content');
    let pubDate = textOf(raw, 'pubDate') || textOf(raw, 'published') || textOf(raw, 'updated');
    
    // Validate date
    let validPubDate = null;
    if (pubDate) {
      const date = new Date(pubDate);
      if (!isNaN(date.getTime())) {
        validPubDate = date.toISOString();
      }
    }
    
    // Enhanced image extraction for regex parser
    let image = enclosureUrl(raw) || mediaThumb(raw) || mediaContentUrl(raw) || ogImage(raw);

    // Also check CDATA content for images
    if (!image && description) {
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/i);
      if (imgMatch) image = imgMatch[1];
    }

    // Video extraction for regex parser
    let video = videoEnclosure(raw) || mediaGroupVideo(raw);
    const videoKeywordsRe = /\b(watch|video|highlights|clip|replay)\b/i;
    if (!video && (videoKeywordsRe.test(title) || videoKeywordsRe.test(description))) {
      video = true;
    }

    if (title && link) {
      items.push({
        title: cleanText(title).slice(0, 200),
        link: validateAndSanitizeUrl(link),
        description: cleanText(description).slice(0, 240),
        pubDate: validPubDate,
        source: feed.label,
        image: validateAndSanitizeUrl(image),
        video: video || undefined,
      });
    }
  }
  return { id: feed.id, label: feed.label, items };
}

// ─────────────────────────────────────────────────────────────────────────────
// URL SAFETY (No window dependency)
// ─────────────────────────────────────────────────────────────────────────────

function validateAndSanitizeUrl(url) {
  if (!url) return null;
  
  try {
    // Use getBaseUrl() instead of window.location.origin
    const baseUrl = getBaseUrl();
    const parsed = new URL(url, baseUrl);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn('Blocked unsafe URL protocol:', parsed.protocol);
      return null;
    }
    
    return parsed.href;
  } catch (error) {
    // If URL parsing fails, try to see if it's a relative path
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      try {
        const baseUrl = getBaseUrl();
        const absoluteUrl = new URL(url, baseUrl);
        return absoluteUrl.href;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// XML HELPERS (for regex fallback)
// ─────────────────────────────────────────────────────────────────────────────

function textOf(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m  = xml.match(re);
  if (!m) return '';
  return m[1].trim();
}

function atomLinkHref(xml) {
  const m = xml.match(/<link[^>]+href="([^"]+)"/i);
  return m ? m[1] : null;
}

function enclosureUrl(xml) {
  const tags = xml.match(/<enclosure\b[^>]*>/gi);
  if (!tags) return null;
  for (const tag of tags) {
    if (/\btype="image/i.test(tag)) {
      const url = tag.match(/\burl="([^"]+)"/i);
      if (url) return url[1];
    }
  }
  return null;
}

function mediaThumb(xml) {
  const m = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  return m ? m[1] : null;
}

function mediaContentUrl(xml) {
  const tags = xml.match(/<media:content\b[^>]*>/gi);
  if (!tags) return null;
  for (const tag of tags) {
    if (/\btype="image/i.test(tag)) {
      const url = tag.match(/\burl="([^"]+)"/i);
      if (url) return url[1];
    }
  }
  return null;
}

function ogImage(xml) {
  const m = xml.match(/og:image[^"]*"([^"]+\.(?:jpg|jpeg|png|webp))"/i);
  return m ? m[1] : null;
}

function videoEnclosure(xml) {
  const tags = xml.match(/<enclosure\b[^>]*>/gi);
  if (!tags) return null;
  for (const tag of tags) {
    if (/\btype="video/i.test(tag)) {
      const url = tag.match(/\burl="([^"]+)"/i);
      if (url) return url[1];
    }
  }
  return null;
}

function mediaGroupVideo(xml) {
  const groups = xml.match(/<media:group\b[^>]*>[\s\S]*?<\/media:group>/gi);
  if (!groups) return null;
  for (const group of groups) {
    const tags = group.match(/<media:content\b[^>]*>/gi);
    if (!tags) continue;
    for (const tag of tags) {
      if (/\btype="video/i.test(tag)) {
        const url = tag.match(/\burl="([^"]+)"/i);
        if (url) return url[1];
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT CLEANING
// ─────────────────────────────────────────────────────────────────────────────

function cleanText(s) {
  if (!s) return '';
  const clean = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return decodeEntities(stripTags(clean));
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&quot;/g,  '"')
    .replace(/&apos;/g,  "'")
    .replace(/&#39;/g,   "'")
    .replace(/&#x27;/g,  "'")
    .replace(/&nbsp;/g,  ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D');
}
