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
    _note: 'COSAFA URL has been returning ESPN general headlines since 2025. Kept for fallback when the upstream recovers; classify() now requires Zambia/Africa content keywords to surface these items.'
  },
  {
    id: 'bbc-sport-africa',
    label: 'BBC Sport – Africa',
    url: 'https://feeds.bbci.co.uk/sport/africa/rss.xml',
    tags: ['football', 'africa'],
  },
  {
    id: 'africa-top-sports',
    label: 'Africa Top Sports',
    url: 'https://africatopsports.com/feed/',
    tags: ['football', 'africa'],
  },
  {
    id: 'kingfut',
    label: 'KingFut (Egypt)',
    url: 'https://www.kingfut.com/feed/',
    tags: ['football', 'africa'],
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
  {
    id: 'lusakastar',
    label: 'Lusaka Star',
    url: 'https://lusakastar.com/feed/',
    tags: ['zambia'],
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
  {
    id: 'football-italia',
    label: 'Football Italia',
    url: 'https://www.football-italia.net/rss.xml',
    tags: ['football'],
  },
  {
    id: 'these-football-times',
    label: 'These Football Times',
    url: 'https://thesefootballtimes.co/feed/',
    tags: ['kit-launches', 'football'],
  },
  {
    id: 'the-football-faithful',
    label: 'The Football Faithful',
    url: 'https://www.thefootballfaithful.com/feed/',
    tags: ['football'],
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
// Feeds that are intentionally multi-sport. Items from these feeds are
// hidden from the "All" tab (which stays football-only) and surfaced in
// the dedicated "All Sports" tab instead. sky-sports-all is excluded
// because its current content is Premier League/football, not other sports.
const MULTI_SPORT_FEEDS = new Set([
  'bbc-sport-all',
  'guardian-sport',
  'espn-sport-all',
  'espn-cosafa',
]);

export function classify(item, filter) {
  const text   = (item.title + ' ' + (item.description || '')).toLowerCase();
  const src    = (item.source  || '').toLowerCase();
  const feedId = (item._source || '').toLowerCase();

  if (filter === 'all-sports') {
    return MULTI_SPORT_FEEDS.has(feedId);
  }

  if (filter === 'all') {
    // "All News" tab stays football-only. Multi-sport items live under
    // the dedicated "All Sports" tab so we don't pollute the soccer feed.
    if (MULTI_SPORT_FEEDS.has(feedId)) return false;
    return true;
  }

  // Zambia filter - prioritize feed origin
  if (filter === 'zambia') {
    // Defensive: a small handful of feed URLs that USED to be Zambia-only
    // are now returning general ESPN/sport headlines. Exclude any item
    // that is clearly about another sport, even if the feed origin
    // historically meant "Zambia".
    const isOtherSport = /\b(nba|nfl|mlb|nhl|american football|tennis|boxing|f1|formula 1|golf|cricket|rugby|wwe|ufc|mls)\b/i.test(text);
    if (isOtherSport) return false;

    // Feed-based detection (high confidence)
    const isZambiaFeed = /bola-yapa-zed|daily-mail-zm|goal-diggers|lusakastar/.test(feedId);
    if (isZambiaFeed) return true;

    // espn-cosafa is now often a multi-sport catch-all. Only include items
    // whose content is genuinely about Zambia / Chipolopolo / FAZ, not
    // items that happen to be in the same feed.
    if (feedId === 'espn-cosafa') {
      return /\b(zambia|chipolopolo|copper queens|faz|zesco|nkana|kabwe warriors|power dynamos)\b/i.test(text);
    }

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
    // Same defensive check: feeds occasionally drift into US sports.
    const isOtherSport = /\b(nba|nfl|mlb|nhl|american football|tennis|boxing|f1|formula 1|golf|cricket|rugby|wwe|ufc|mls)\b/i.test(text);
    if (isOtherSport) return false;

    const isAfricaFeed = /bola-yapa-zed|goal-diggers|espn-afcon|bbc-sport-africa|africa-top-sports|kingfut|lusakastar/.test(feedId);
    if (isAfricaFeed) return true;

    // espn-cosafa is now often a multi-sport catch-all. Require African
    // context in the content, not just the feed origin.
    if (feedId === 'espn-cosafa') {
      return /\b(africa|afcon|cosafa|caf|chan|wafu|cecafa|zambia|chipolopolo|copper queens|faz|zesco|nkana)\b/i.test(text);
    }

    const isAfricaSource = /caf online|africanews|kickoff|brila|futaa|mozzart/.test(src);
    if (isAfricaSource) return true;

    // Zambia items belong under "Zambia", not "Africa" — but only if they
    // don't also reference pan-African context (AFCON/COSAFCA etc.)
    const isZambiaOnly = /\bzambia\b/.test(text) && !/\b(africa|afcon|cosafa|caf|chan|wafu|cecafa)\b/.test(text);
    if (isZambiaOnly) return false;

    // Pan-African tournament mention alone is enough (no country required)
    if (/\b(afcon|cosafa|cecafa|wafu|chan|caf champions|africa cup)\b/i.test(text)) return true;

    return /\b(africa|african)\b/i.test(text) &&
           /\b(egypt|nigeria|ghana|kenya|south africa|senegal|morocco|ivory coast|côte d'ivoire|ethiopia|tanzania|zimbabwe|malawi|angola|mozambique|rwanda|uganda|cameroon|algeria|tunisia|mali|burkina faso|guinea|congo|drc|togo|cape verde|niger|sudan)\b/i.test(text);
  }

  if (filter === 'kit-launches') {
    const isKitFeed = /footy-headlines/.test(feedId);
    if (isKitFeed) return true;

    const isKitSource = /footy headlines|kickoff|soccerbible/.test(src);
    if (isKitSource) return true;

    // Expanded kit-related keywords. "leaked" / "leak" are big giveaways
    // on Footy Headlines-style sites, and we now also accept a kit word
    // alone when combined with a club context word (e.g. "Liverpool 24/25
    // away kit", "Arsenal home shirt 25-26").
    const kitKeywords = /\b(kit|jersey|kits|jerseys|launch|launches|launched|reveal|revealed|reveals|leak|leaked|leaks|apparel|collection|home shirt|away shirt|third shirt|goalkeeper kit|training kit|pre match|third kit|crunch|stripes|stripe pattern|crested)\b/i;
    const brandKeywords = /\b(nike|adidas|puma|new balance|hummel|umbro|macron|kappa|castore|joma|kelme|errea|marathon sports)\b/i;
    const clubContext = /\b(2024[-\/]25|2025[-\/]26|2026[-\/]27|24\/25|25\/26|26\/27|home|away|third|pre[-\s]?match|goalkeeper|gk|new shirt|new kit|season)\b/i;

    if (kitKeywords.test(text) && brandKeywords.test(text)) return true;
    // Permit a kit word + club context if the brand isn't in the title.
    // This catches a lot of "Team 25/26 kit" headlines from non-official
    // kit blogs that name a club+year but not the manufacturer.
    if (kitKeywords.test(text) && clubContext.test(text)) return true;
    return false;
  }

  if (filter === 'world') {
    // Exclude any feed or content that is specifically Zambia/Africa.
    // Multi-sport feeds (NBA/NFL/tennis/cricket) live in the All Sports
    // tab, not "Rest of World", so keep them out of this view too.
    const isExcludedFeed = /bola-yapa-zed|daily-mail-zm|goal-diggers|espn-afcon|espn-cosafa|bbc-sport-all|guardian-sport|espn-sport-all/.test(feedId);
    if (isExcludedFeed) return false;

    const isExcludedSource = /znbc|daily mail zambia|times of zambia|caf online|africanews/.test(src);
    if (isExcludedSource) return false;

    // Exclude African context (any country on the pan-African list OR a
    // pan-African tournament). Local Zambia coverage of national team is
    // also excluded so we don't double-count it in the Zambia tab.
    const isAfricanContext = /\b(africa|afcon|cosafa|cecafa|wafu|chan|caf champions|africa cup)\b/i.test(text);
    const isAfricanCountry = /\b(egypt|nigeria|ghana|kenya|south africa|senegal|morocco|ivory coast|côte d'ivoire|ethiopia|tanzania|zimbabwe|malawi|angola|mozambique|rwanda|uganda|cameroon|algeria|tunisia|mali|burkina faso|guinea|congo|drc|togo|cape verde|niger|sudan)\b/i.test(text);
    const isZambiaContext = /\b(zambia|chipolopolo|copper queens|faz|zesco|nkana|power dynamos|buildcon|green eagles|napsa|red arrows|forest rangers|kabwe warriors)\b/i.test(text);
    return !(isAfricanContext || isAfricanCountry || isZambiaContext);
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

    // Get link - handle different formats. RSS 2.0 <link> elements are
    // commonly wrapped in <![CDATA[...]]> (BBC, ESPN, Goal all do this).
    // DOMParser keeps the literal CDATA markers in textContent, so always
    // unwrap before validating. Prefer the href attribute for Atom feeds.
    let link = '';
    const linkElem = elem.querySelector('link');
    if (linkElem) {
      const href = linkElem.getAttribute('href');
      link = unwrapCdata(href || linkElem.textContent || '').trim();
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
      // Use innerHTML (preserves CDATA-wrapped HTML, which the parser has
      // already merged) and then strip tags. textContent loses anchor
      // targets and inline tags, so always prefer innerHTML when present.
      const raw = descElem.innerHTML || descElem.textContent || '';
      description = cleanText(raw);
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

    // Get video enclosure / media. Broadened detection beyond the original
    // 5 keywords: now also catches YouTube embeds (channel feeds embed
    // youtube.com/watch or youtu.be links in <link>), <yt:videoId> YouTube
    // channel RSS, and the football jargon ("preview", "trailer").
    // Keyword matching is intentionally strict so a gossip headline like
    // "X opens up on viral video backlash" isn't tagged as a watchable video.
    let video = extractVideoFromXmlElement(elem) || detectVideoFromLink(link) || detectYoutubeFromXml(elem);
    if (!video && isLikelyVideoTitle(title, description, link)) {
      video = true; // keyword-flagged video item
    }

    // If we have a video but no image, try to synthesize a YouTube
    // thumbnail from the watch/shorts URL.
    if (video && !image) {
      image = youtubeThumbnailFromLink(link);
    }

    if (title && link) {
      const item = {
        title: title.slice(0, 200),
        link: validateAndSanitizeUrl(link),
        description: description.slice(0, 240),
        pubDate,
        source: feed.label,
        image: validateAndSanitizeUrl(image),
        video: video || undefined,
      };
      item.source = refineSource(item);
      items.push(item);
    }
  }

  return { id: feed.id, label: feed.label, items };
}

// Comprehensive image extraction for namespaced XML
function extractImageFromXmlElement(element) {
  // 1. content:encoded often wraps the full HTML body of the post and
  //    contains the hero <img src=...>. Guardian, LusakaStar, and many
  //    WordPress feeds only put their image there. Check it first so we
  //    don't fall through to a description that strips it.
  try {
    const contentEncoded = element.querySelector('content\\:encoded');
    if (contentEncoded) {
      const html = contentEncoded.innerHTML || contentEncoded.textContent || '';
      const srcsetMatch = html.match(/<img[^>]+srcset=["']([^"']+)["']/i);
      if (srcsetMatch) {
        const first = srcsetMatch[1].split(',')[0].trim().split(/\s+/)[0];
        if (first) return first;
      }
      const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
      if (imgMatch) return imgMatch[1];
    }
  } catch (e) { /* ignore */ }

  // 2. Common RSS image tags. Note we do NOT require `type="image"` for
  //    media:content because Guardian ships `<media:content width="140"
  //    url="...">` without a type attribute. We accept any media:content
  //    whose url points to a recognised image extension.
  const imageSelectors = [
    'enclosure[type^="image"]',
    'media\\:content[url]',
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
      continue;
    }
  }

  // 3. Some feeds (BBC, Guardian) ship <media:content medium="image"> with
  //    no url attribute but with a nested expression. The url is usually
  //    inside a child tag we can fish out.
  try {
    const mediaContent = Array.from(element.querySelectorAll('media\\:content'));
    for (const mc of mediaContent) {
      const url = mc.getAttribute('url');
      if (url && url.match(/\.(jpg|jpeg|png|webp|gif)/i)) return url;
    }
  } catch (e) { /* ignore */ }

  // 4. Description fallback (last resort)
  const descElem = element.querySelector('description') || element.querySelector('summary');
  if (descElem) {
    const content = descElem.innerHTML || descElem.textContent || '';
    const srcsetMatch = content.match(/<img[^>]+srcset=["']([^"']+)["']/i);
    if (srcsetMatch) {
      const first = srcsetMatch[1].split(',')[0].trim().split(/\s+/)[0];
      if (first) return first;
    }
    const imgMatch = content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
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

// YouTube embeds often appear in <content:encoded> as an <iframe> whose
// src is youtube.com/embed/... or youtu.be/... The enclosure and
// media:content blocks don't exist for these. The link itself is sometimes
// a YouTube watch URL (RSS YouTube channel feeds) so a regex on the link
// is the cheapest reliable signal.
function detectVideoFromLink(link) {
  if (!link) return null;
  return /youtu\.be\/|youtube\.com\/(watch|embed|shorts|v\/)/i.test(link) ? true : null;
}

function detectYoutubeFromXml(element) {
  // RSS YouTube channel format uses <yt:videoId>
  try {
    if (element.querySelector('yt\\:videoId')) return true;
  } catch { /* ignore */ }
  return null;
}

function detectYoutubeFromXmlString(xml) {
  return /<yt:videoId[\s>]/i.test(xml) ? true : null;
}

// Strict keyword check: only flag a story as a "video" when the title or
// description looks unambiguously like a watchable clip. Avoids false
// positives on gossip / news headlines that happen to mention the word
// "video" (e.g. "X opens up on viral video backlash").
function isLikelyVideoTitle(title, description, link) {
  if (!title) return false;
  // YouTube/embedded video always counts (handled elsewhere), this is the
  // fallback for non-YouTube RSS video items.
  if (/\b(watch|highlights|clip|replay|trailer|goalmouth|skills)\b/i.test(title)) return true;
  if (description && /\b(highlights|trailer|watch now|replay|extended highlights|press conference)\b/i.test(description)) {
    // Only count when there's a strong noun pairing — "watch highlights",
    // "extended highlights", "press conference replay" — not just "watch".
    return /\b(highlights|trailer|press conference|extended highlights|watch now|watch live|game recap|match recap)\b/i.test(description);
  }
  return false;
}

// Given a YouTube watch / shorts / youtu.be URL, return the
// `maxresdefault.jpg` thumbnail URL. Returns null when the link is not
// YouTube. The YouTube CDN always returns *something* for valid video IDs
// (a placeholder grey image if maxres is missing) so the card is never
// blank.
function youtubeThumbnailFromLink(link) {
  if (!link) return null;
  let id = null;
  const m1 = link.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m1) id = m1[1];
  if (!id) {
    const m2 = link.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)([A-Za-z0-9_-]{6,})/);
    if (m2) id = m2[1];
  }
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function youtubeIdFromLink(link) {
  if (!link) return null;
  let m = link.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m) return m[1];
  m = link.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
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
    let image = enclosureUrl(raw) || mediaThumb(raw) || mediaContentUrl(raw) || contentEncodedImg(raw) || ogImage(raw);

    if (!image && description) {
      const srcsetMatch = description.match(/<img[^>]+srcset=["']([^"']+)["']/i);
      if (srcsetMatch) {
        const first = srcsetMatch[1].split(',')[0].trim().split(/\s+/)[0];
        if (first) image = first;
      }
      if (!image) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgMatch) image = imgMatch[1];
      }
    }

    // Video extraction for regex parser
    let video = videoEnclosure(raw) || mediaGroupVideo(raw) || detectVideoFromLink(link) || detectYoutubeFromXmlString(raw);
    if (!video && isLikelyVideoTitle(title, description, link)) {
      video = true;
    }

    // If we have a video but no image, try a YouTube thumbnail.
    if (video && !image) {
      image = youtubeThumbnailFromLink(link);
    }

    if (title && link) {
      const item = {
        title: cleanText(title).slice(0, 200),
        link: validateAndSanitizeUrl(unwrapCdata(link)),
        description: cleanText(description).slice(0, 240),
        pubDate: validPubDate,
        source: feed.label,
        image: validateAndSanitizeUrl(image),
        video: video || undefined,
      };
      item.source = refineSource(item);
      items.push(item);
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
    const url = tag.match(/\burl="([^"]+\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i);
    if (url) return url[1].replace(/&amp;/g, '&');
  }
  return null;
}

function ogImage(xml) {
  const m = xml.match(/og:image[^"]*"([^"]+\.(?:jpg|jpeg|png|webp))"/i);
  return m ? m[1] : null;
}

function contentEncodedImg(xml) {
  const m = xml.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
  if (!m) return null;
  const html = m[1];
  const srcsetMatch = html.match(/<img[^>]+srcset=["']([^"']+)["']/i);
  if (srcsetMatch) {
    const first = srcsetMatch[1].split(',')[0].trim().split(/\s+/)[0];
    if (first) return first;
  }
  const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  return imgMatch ? imgMatch[1] : null;
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
  const unwrapped = unwrapCdata(s);
  const noMdImages = unwrapped.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const noMdLinks  = noMdImages.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return decodeEntities(stripTags(noMdLinks));
}

function unwrapCdata(s) {
  if (!s) return '';
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Override the per-item source label based on content keywords. Some feeds
 * (espn-sport-all, espn-english-premier, guardian-sport) publish a mix of
 * sports under one URL, so a single feed label misrepresents the story.
 * The override is conservative — only fires on unambiguous cues.
 */
function refineSource(item) {
  const text = (item.title + ' ' + (item.description || '')).toLowerCase();
  // Skip if the feed itself is already specific (Premier League, Champions
  // League, etc.). We only override the multi-sport catch-alls.
  const feedId = (item._source || '').toLowerCase();
  const ambiguous = /sport-all|sport–all/.test(item.source || '') ||
                    feedId === 'espn-sport-all' || feedId === 'bbc-sport-all' ||
                    feedId === 'guardian-sport' || feedId === 'sky-sports-all';
  if (!ambiguous) return item.source;

  // Sport-specific overrides (order matters: more specific first).
  if (/\b(nba|nfl|mlb|nhl|american football|tennis|boxing|f1|formula 1|golf|cricket|rugby)\b/.test(text)) {
    if (/\bnba\b/.test(text))    return item.source + ' · NBA';
    if (/\bnfl\b/.test(text))    return item.source + ' · NFL';
    if (/\bnhl\b/.test(text))    return item.source + ' · NHL';
    if (/\bmlb\b/.test(text))    return item.source + ' · MLB';
    if (/\b(f1|formula 1)\b/.test(text)) return item.source + ' · F1';
    if (/\btennis\b/.test(text)) return item.source + ' · Tennis';
    if (/\bcricket\b/.test(text))return item.source + ' · Cricket';
    if (/\brugby\b/.test(text))  return item.source + ' · Rugby';
    if (/\bgolf\b/.test(text))   return item.source + ' · Golf';
  }
  // League-specific football overrides.
  if (/\bpremier league\b/.test(text) && /\b(england|english|pl)\b/.test(text)) return item.source + ' · Premier League';
  if (/\bchampions league\b/.test(text))   return item.source + ' · Champions League';
  if (/\beuropa league\b/.test(text))      return item.source + ' · Europa League';
  if (/\bla liga\b/.test(text))            return item.source + ' · La Liga';
  if (/\bserie a\b/.test(text))            return item.source + ' · Serie A';
  if (/\bbundesliga\b/.test(text))         return item.source + ' · Bundesliga';
  if (/\bmls\b/.test(text))                return item.source + ' · MLS';

  return item.source;
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
