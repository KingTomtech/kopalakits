/**
 * OG Image Generator for Kopala Kits
 * Requires: npm install puppeteer (or use Playwright)
 *
 * Usage:
 *   node scripts/generate-og-image.js
 *   pnpm add -D puppeteer  # one-time install
 *
 * This generates a 1200x630 social preview image from og-image.html
 */

const fs = require("fs");
const path = require("path");

async function generateOGImage() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("❌ puppeteer not installed. Run: pnpm add -D puppeteer");
    console.log("   Alternatively, open public/og-image.html in a browser");
    console.log("   at 1200x630 and screenshot it manually.");
    process.exit(1);
  }

  const htmlPath = path.join(__dirname, "..", "public", "og-image.html");
  const outputPath = path.join(__dirname, "..", "public", "og-image.jpg");

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  const html = fs.readFileSync(htmlPath, "utf8");
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.screenshot({ path: outputPath, type: "jpeg", quality: 90 });
  await browser.close();

  console.log("✅ OG image generated:", outputPath);
}

generateOGImage().catch(console.error);
