// Sonda temporal: abre los sitios de beneficios y lista las respuestas JSON que cargan.
import { chromium } from 'playwright';

const SITES = {
  bancochile: 'https://sitiospublicos.bancochile.cl/personas/beneficios',
  santander: 'https://banco.santander.cl/beneficios',
  bci: 'https://www.bci.cl/beneficios',
  falabella: 'https://www.bancofalabella.cl/descuentos'
};

const browser = await chromium.launch();
for (const [key, url] of Object.entries(SITES)) {
  console.log(`\n==================== ${key} ${url}`);
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
    locale: 'es-CL'
  });
  const seen = [];
  page.on('response', async (res) => {
    const ct = res.headers()['content-type'] || '';
    if (!ct.includes('json')) return;
    try {
      const body = await res.text();
      if (body.length < 300) return;
      seen.push({ url: res.url(), status: res.status(), size: body.length, sample: body.slice(0, 400).replace(/\s+/g, ' ') });
    } catch { /* ignore */ }
  });
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(3000);
    console.log('status', resp?.status(), '| final', page.url(), '| title', await page.title());
    const links = await page.$$eval('a[href]', (as) => [...new Set(as.map((a) => a.href).filter((h) => /benefic|descuent|promo/i.test(h)))].slice(0, 40));
    console.log('LINKS', JSON.stringify(links));
    const text = (await page.innerText('body')).replace(/\s+/g, ' ').slice(0, 1500);
    console.log('TEXT', text);
  } catch (e) {
    console.log('ERROR', e.message);
  }
  seen.sort((a, b) => b.size - a.size);
  for (const s of seen.slice(0, 15)) console.log('JSON', s.status, s.size, s.url, '\n     ', s.sample);
  await page.close();
}
await browser.close();
