// Sonda temporal (ronda 2)
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const browser = await chromium.launch();

const visitar = async (nombre, url, extra) => {
  console.log(`\n==================== ${nombre} ${url}`);
  const page = await browser.newPage({ userAgent: UA, locale: 'es-CL' });
  const reqs = [];
  page.on('response', async (res) => {
    const t = res.request().resourceType();
    if (t !== 'xhr' && t !== 'fetch') return;
    let body = '';
    try { body = await res.text(); } catch { /* */ }
    reqs.push({ url: res.url(), status: res.status(), ct: res.headers()['content-type'] || '', size: body.length, sample: body.slice(0, 600).replace(/\s+/g, ' ') });
  });
  try {
    const r = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(4000);
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 3000); await page.waitForTimeout(800); }
    console.log('status', r?.status(), '| final', page.url(), '| title', await page.title());
    if (extra) await extra(page);
  } catch (e) { console.log('ERROR', e.message); }
  reqs.filter((r) => !/cookielaw|evergage|qualtrics|google|facebook|hotjar|iteratehq|doubleclick|analytics|firebase|clarity|tiktok|bing/.test(r.url))
    .sort((a, b) => b.size - a.size).slice(0, 12)
    .forEach((r) => console.log('XHR', r.status, r.size, r.ct.slice(0, 30), r.url, '\n    ', r.sample));
  await page.close();
};

// Banco de Chile: buscar a dónde apunta "BENEFICIOS"
await visitar('bancochile-home', 'https://sitiospublicos.bancochile.cl/personas/beneficios', async (page) => {
  const as = await page.$$eval('a', (xs) => xs.map((a) => `${a.innerText.trim().slice(0, 40)} -> ${a.href}`).filter((s) => /benef|descuent|promo/i.test(s)));
  console.log('ANCHORS', JSON.stringify(as.slice(0, 30)));
  const html = await page.content();
  console.log('HTML size', html.length, '| iframes', await page.locator('iframe').count());
  const m = html.match(/https?:\/\/[^"' ]*benefic[^"' ]*/gi);
  console.log('URLS EN HTML', JSON.stringify([...new Set(m || [])].slice(0, 30)));
});
await visitar('bancochile-portal', 'https://ww3.bancochile.cl/beneficios');
await visitar('bancochile-portal2', 'https://www.bancochile.cl/beneficios');

// BCI
await visitar('bci-listado', 'https://www.bci.cl/beneficios/beneficios-bci', async (page) => {
  const as = await page.$$eval('a[href*="/detalle/"]', (xs) => xs.map((a) => a.href));
  console.log('DETALLES', as.length, JSON.stringify(as.slice(0, 8)));
  const card = await page.$$eval('a[href*="/detalle/"]', (xs) => xs.slice(0, 2).map((a) => a.outerHTML.slice(0, 1500)));
  console.log('CARD HTML', JSON.stringify(card));
});
await visitar('bci-detalle', 'https://www.bci.cl/beneficios/beneficios-bci/detalle/x5-de-cashback-8unv58t', async (page) => {
  console.log('TEXT', (await page.innerText('main').catch(() => page.innerText('body'))).replace(/\s+/g, ' ').slice(0, 1500));
});

// Falabella
await visitar('falabella-todos', 'https://www.bancofalabella.cl/descuentos/todos', async (page) => {
  const html = await page.content();
  console.log('HTML size', html.length, '| __NEXT_DATA__', html.includes('__NEXT_DATA__'), '| __NUXT__', html.includes('__NUXT__'));
  const nd = await page.$eval('#__NEXT_DATA__', (s) => s.textContent).catch(() => '');
  if (nd) console.log('NEXT_DATA', nd.length, nd.slice(0, 2500));
  const links = await page.$$eval('a[href*="/descuentos/"]', (xs) => [...new Set(xs.map((a) => a.href))]);
  console.log('LINKS descuentos', links.length, JSON.stringify(links.slice(20, 40)));
  console.log('TEXT', (await page.innerText('body')).replace(/\s+/g, ' ').slice(600, 2600));
});

// Santander (otra entrada)
await visitar('santander-www', 'https://www.santander.cl/beneficios');

await browser.close();
