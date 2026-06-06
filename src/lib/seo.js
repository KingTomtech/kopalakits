/**
 * Lightweight SEO helper for React SPAs without react-helmet.
 * Updates document.title, meta description, and canonical link on route changes.
 */

const SITE = 'Kopala Kits';
const ORIGIN = 'https://kopala.zingati.app';

const DEFAULT = {
  title: `${SITE} — Soccer Jerseys in Kitwe, Zambia | Order via WhatsApp`,
  description:
    'Shop premium soccer jerseys in Kitwe, Zambia. Local teams, international clubs, national teams & retro classics. Starting from K480. Order via WhatsApp — fast delivery across the Copperbelt.',
};

const ROUTE_META = {
  '/': DEFAULT,
  '/shop': {
    title: `Shop All Soccer Jerseys — ${SITE}`,
    description: 'Browse local Zambian team jerseys, international club kits, national team jerseys and retro classics. Filter by size, category and price. WhatsApp ordering available.',
  },
  '/about': {
    title: `About Us — ${SITE}`,
    description: 'Kopala Kits is Kitwe\'s premium soccer jersey shop. Based at Copperbelt University, we deliver authentic local and international kits across Zambia.',
  },
  '/contact': {
    title: `Contact & WhatsApp Order — ${SITE}`,
    description: 'Get in touch with Kopala Kits in Kitwe, Zambia. Order via WhatsApp, call us or visit our store at Copperbelt University for the best soccer jerseys.',
  },
  '/predictions': {
    title: `Fan Zone Match Predictions — ${SITE}`,
    description: 'Predict match outcomes for your favourite teams and climb the leaderboard. Free to play — no account required.',
  },
  '/tournaments': {
    title: `Tournament Brackets & Fixtures — ${SITE}`,
    description: 'Follow live tournament brackets, knockout stages and match results. Updated in real time.',
  },
  '/news': {
    title: `Soccer News & Headlines — ${SITE}`,
    description: 'Latest football news from Zambia, Africa and around the world. Aggregated from ESPN, The Athletic, NBC Sports and more.',
  },
  '/media': {
    title: `Football Media & Videos — ${SITE}`,
    description: 'Watch football highlights, kit launch videos, match reactions and fan content curated for Zambian soccer fans.',
  },
  '/zusa': {
    title: `ZUSA — Zambian Universities Sports Association — ${SITE}`,
    description: 'ZUSA news, fixtures and updates. Supporting university sports across Zambia.',
  },
  '/faz': {
    title: `FAZ — Football Association of Zambia — ${SITE}`,
    description: 'FAZ news, national team updates, Super League standings and Chipolopolo coverage.',
  },
};

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOg(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO(pathname) {
  const meta = ROUTE_META[pathname] || DEFAULT;

  document.title = meta.title;
  setMeta('title', meta.title);
  setMeta('description', meta.description);
  setOg('og:title', meta.title);
  setOg('og:description', meta.description);
  setOg('og:url', `${ORIGIN}${pathname}`);
  setCanonical(`${ORIGIN}${pathname}`);
}

/**
 * Call this from ProductPage (or any dynamic detail page) to override
 * the route-level SEO with product-specific data.
 */
export function setProductSEO(product) {
  if (!product) return;
  const title = `${product.name} — Buy in Kitwe — ${SITE}`;
  const desc = `${product.desc || product.name}. Price: K${product.price}. Available in Kitwe, Zambia — order via WhatsApp for fast Copperbelt delivery.`;
  document.title = title;
  setMeta('title', title);
  setMeta('description', desc);
  setOg('og:title', title);
  setOg('og:description', desc);
  setOg('og:image', product.image || `${ORIGIN}/og-image.jpg`);
  setOg('og:type', 'product');
  setCanonical(`${ORIGIN}/product/${product.id}`);

  // Inject Product structured data
  let script = document.getElementById('ld-product');
  if (!script) {
    script = document.createElement('script');
    script.id = 'ld-product';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc || product.name,
    image: product.image || `${ORIGIN}/og-image.jpg`,
    url: `${ORIGIN}/product/${product.id}`,
    brand: { '@type': 'Brand', name: product.brand || 'Kopala Kits' },
    offers: {
      '@type': 'Offer',
      url: `${ORIGIN}/product/${product.id}`,
      priceCurrency: 'ZMW',
      price: String(product.price),
      availability: product.soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Store',
        name: SITE,
        telephone: '+260770713619',
      },
    },
  });
}

export function clearProductSEO() {
  const script = document.getElementById('ld-product');
  if (script) script.remove();
}
