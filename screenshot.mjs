import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const scrollY = parseInt(process.argv[4]) || 0;
const viewportOnly = process.argv[5] === 'viewport';

// Find next available number
const existing = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.startsWith('screenshot-'));
let maxNum = 0;
for (const f of existing) {
  const match = f.match(/^screenshot-(\d+)/);
  if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
}
const num = maxNum + 1;
const filename = label ? `screenshot-${num}-${label}.png` : `screenshot-${num}.png`;
const outputPath = path.join(SCREENSHOTS_DIR, filename);

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 300));
  }

  await page.screenshot({ path: outputPath, fullPage: !viewportOnly });
  console.log(`Screenshot saved: ${outputPath}`);
  await browser.close();
})();
