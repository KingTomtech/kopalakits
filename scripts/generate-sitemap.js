/**
 * Sitemap Generator for Kopala Kits
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = "https://kopala.zingati.app";
const PRODUCTS_PATH = path.join(__dirname, "..", "public", "products.json");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "sitemap.xml");

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  xml += `  <url>\n`;
  xml += `    <loc>${DOMAIN}/</loc>\n`;
  xml += `    <lastmod>${now}</lastmod>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `  </url>\n`;

  const categories = ["Local", "International", "Leagues", "Retro"];
  for (const cat of categories) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/?category=${encodeURIComponent(cat)}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `  </url>\n`;
  }

  // Top-level pages
  for (const route of ['shop', 'about', 'contact', 'predictions', 'tournaments', 'news', 'zusa', 'faz', 'media', 'admin']) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/${route}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <priority>${route === '' ? '1.0' : '0.7'}</priority>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `  </url>\n`;
  }

  for (const product of products) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const imgUrl = product.image?.startsWith("http") ? product.image : `${DOMAIN}${product.image || product.img}`;
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/product/${product.id}-${slug}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${imgUrl}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(product.name)}</image:title>\n`;
    xml += `      <image:caption>${escapeXml(product.desc)}</image:caption>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log("Sitemap generated:", OUTPUT_PATH);
}

generateSitemap();
