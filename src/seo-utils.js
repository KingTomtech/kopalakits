/**
 * SEO Utilities for Kopala Kits
 * Dynamic JSON-LD structured data injection
 */

const DOMAIN = "https://kopala.zingati.app";

/**
 * Generate Product JSON-LD schema for a single product
 */
export function getProductSchema(product) {
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${DOMAIN}${product.image || product.img}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.desc,
    brand: {
      "@type": "Brand",
      name: product.category === "Local" ? "Zambian Local" : product.category,
    },
    offers: {
      "@type": "Offer",
      url: `${DOMAIN}/?product=${product.id}`,
      priceCurrency: "ZMW",
      price: String(product.price),
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Kopala Kits",
        url: DOMAIN,
      },
    },
    category: product.category,
    ...(product.newArrival ? { isRelatedTo: { "@type": "Thing", name: "New Arrival" } } : {}),
  };
}

/**
 * Generate Organization JSON-LD schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${DOMAIN}/#organization`,
    name: "Kopala Kits",
    url: DOMAIN,
    logo: `${DOMAIN}/favicon.svg`,
    image: `${DOMAIN}/og-image.jpg`,
    description:
      "Premium soccer jerseys in Kitwe, Zambia — local, international, national & retro classics.",
    sameAs: ["https://wa.me/260770713619"],
  };
}

/**
 * Generate WebSite JSON-LD with search
 */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${DOMAIN}/#website`,
    name: "Kopala Kits",
    url: DOMAIN,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${DOMAIN}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate LocalBusiness JSON-LD schema
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${DOMAIN}/#store`,
    name: "Kopala Kits",
    url: DOMAIN,
    logo: `${DOMAIN}/favicon.svg`,
    image: `${DOMAIN}/og-image.jpg`,
    description:
      "Premium soccer jerseys in Kitwe, Zambia — local, international, national & retro classics.",
    telephone: "+260770713619",
    email: "",
    priceRange: "K480–K800",
    currenciesAccepted: "ZMW",
    paymentAccepted: "Cash, Mobile Money",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "16:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "K-Block, Copperbelt University",
      addressLocality: "Kitwe",
      addressRegion: "Copperbelt Province",
      postalCode: "10101",
      addressCountry: "ZM",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -12.8024,
      longitude: 28.2135,
    },
    areaServed: {
      "@type": "State",
      name: "Copperbelt Province",
      addressCountry: "ZM",
    },
    hasMap: "https://maps.google.com/?q=Copperbelt+University+Kitwe+Zambia",
  };
}

/**
 * Generate BreadcrumbList JSON-LD for current page
 */
export function getBreadcrumbSchema(category, productName) {
  const items = [
    { position: 1, name: "Home", item: `${DOMAIN}/` },
    { position: 2, name: "Soccer Jerseys", item: `${DOMAIN}/` },
  ];

  if (category) {
    items.push({
      position: 3,
      name: category + " Jerseys",
      item: `${DOMAIN}/?category=${encodeURIComponent(category)}`,
    });
  }

  if (productName) {
    items.push({
      position: category ? 4 : 3,
      name: productName,
      item: `${DOMAIN}/`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i) => ({
      "@type": "ListItem",
      position: i.position,
      name: i.name,
      item: i.item,
    })),
  };
}

/**
 * Generate ItemList JSON-LD for product catalog
 */
export function getProductListSchema(products) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Soccer Jersey Collection — Kopala Kits",
    description: "Premium soccer jerseys available at Kopala Kits, Kitwe Zambia",
    url: `${DOMAIN}/`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        url: `${DOMAIN}/?product=${p.id}`,
        image: p.image?.startsWith("http") ? p.image : `${DOMAIN}${p.image || p.img}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "ZMW",
          price: String(p.price),
          availability: p.soldOut
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        },
      },
    })),
  };
}
