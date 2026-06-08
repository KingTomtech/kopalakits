import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';
const PAGES = ['/', '/media', '/predictions', '/tournaments', '/news', '/tournaments/world-cup-2026'];

const browser = await chromium.launch();
const results = [];

for (const path of PAGES) {
  const page = await browser.newPage();
  const errors = [];
  const consoleLogs = [];
  
  page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleLogs.push(`CONSOLE ERROR: ${msg.text()}`);
    if (msg.type() === 'warning') consoleLogs.push(`CONSOLE WARN: ${msg.text()}`);
  });
  
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
  const title = await page.title();
  const content = await page.content();
  const hasRoot = content.includes('id="root"');
  const hasHydrated = await page.evaluate(() => document.getElementById('root')?.children?.length > 0);
  
  results.push({
    path,
    status: res.status(),
    title,
    hydrated: hasHydrated,
    errors: [...errors, ...consoleLogs],
  });
  
  await page.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
