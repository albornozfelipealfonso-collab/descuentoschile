// Sonda temporal (ronda 3): formato exacto de los datos
import { chromium } from 'playwright';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

// ---- BCI: API directa sin navegador
console.log('\n==================== BCI API (fetch directo)');
try {
  const r = await fetch('https://api.bciplus.cl/bff-loyalty-beneficios/v1/offers?itemsPorPagina=100&pagina=1', {
    headers: { 'User-Agent': UA, Accept: 'application/json', Origin: 'https://www.bci.cl', Referer: 'https://www.bci.cl/' }
  });
  console.log('status', r.status);
  const j = await r.json();
  console.log('paginado', JSON.stringify(j.paginado));
  const claves = {};
  for (const o of j.ofertas) for (const k of Object.keys(o)) claves[k] = (claves[k] || 0) + 1;
  console.log('CLAVES', JSON.stringify(claves));
  for (const o of j.ofertas.slice(0, 3)) console.log('OFERTA', JSON.stringify(o).slice(0, 3500));
  const restaurant = j.ofertas.find((o) => /restaur/i.test(JSON.stringify(o)));
  if (restaurant) console.log('OFERTA RESTAURANT', JSON.stringify(restaurant).slice(0, 3500));
} catch (e) { console.log('ERROR', e.message); }

const browser = await chromium.launch();

// ---- Banco de Chile
console.log('\n==================== BANCO DE CHILE');
{
  const page = await browser.newPage({ userAgent: UA, locale: 'es-CL' });
  const scripts = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (/widget_manager|\.js(\?|$)/.test(u) && /bancochile/.test(u)) scripts.push(u);
    const t = res.request().resourceType();
    if ((t === 'xhr' || t === 'fetch') && /bancochile/.test(u) && !/mes-Is/.test(u)) {
      let b = ''; try { b = await res.text(); } catch { /* */ }
      console.log('XHR', res.status(), b.length, u, '\n    ', b.slice(0, 500).replace(/\s+/g, ' '));
    }
  });
  await page.goto('https://sitiospublicos.bancochile.cl/personas/beneficios', { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('ERR', e.message));
  await page.waitForTimeout(12000);
  console.log('hijos del contenedor:', await page.locator('#bch-beneficios-home-componentes *').count());
  console.log('SCRIPTS', JSON.stringify(scripts.slice(0, 30)));
  // Buscar referencias a APIs dentro de los scripts de widgets
  for (const s of scripts.filter((u) => /widget_manager/.test(u)).slice(0, 10)) {
    const txt = await page.evaluate(async (u) => (await fetch(u)).text(), s).catch(() => '');
    const apis = [...new Set(txt.match(/["'`](https?:\/\/[^"'`]*|\/api\/[^"'`]*)["'`]/g) || [])].filter((x) => /api|benefic|content/i.test(x));
    console.log('WIDGET', s, txt.length, JSON.stringify(apis.slice(0, 25)));
  }
  // Probar la API de contenidos de Modyo desde el mismo origen (con las cookies anti-bot)
  const candidatos = [
    '/api/content/spaces/personas/types/beneficios/entries?per_page=5',
    '/api/content/spaces/personas/types/beneficio/entries?per_page=5',
    '/api/content/spaces/beneficios/types/beneficios/entries?per_page=5',
    '/api/content/spaces/beneficios/types/beneficio/entries?per_page=5',
    '/api/content/spaces/beneficios-personas/types/beneficio/entries?per_page=5',
    '/api/content/spaces/personas/types/descuentos/entries?per_page=5',
  ];
  for (const c of candidatos) {
    const res = await page.evaluate(async (u) => {
      try { const r = await fetch(u); return `${r.status} ${(await r.text()).slice(0, 600)}`; } catch (e) { return 'ERR ' + e.message; }
    }, c);
    console.log('MODYO', c, '=>', res.replace(/\s+/g, ' '));
  }
  await page.close();
}

// ---- Falabella: estructura de las tarjetas
console.log('\n==================== FALABELLA');
{
  const r = await fetch('https://www.bancofalabella.cl/descuentos/todos', { headers: { 'User-Agent': UA } });
  const html = await r.text();
  console.log('fetch directo status', r.status, 'size', html.length, '| contiene Doggis:', html.includes('Doggis'));
  const i = html.indexOf('Doggis');
  if (i > 0) console.log('CONTEXTO HTML', html.slice(i - 1500, i + 1500).replace(/\s+/g, ' '));
  const page = await browser.newPage({ userAgent: UA, locale: 'es-CL' });
  await page.goto('https://www.bancofalabella.cl/descuentos/todos', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  const card = await page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /Dcto en Doggis/.test(e.textContent));
    let n = el; for (let k = 0; k < 6 && n; k++) n = n.parentElement;
    return { tag: el?.tagName, cls: el?.className, card: n?.outerHTML?.slice(0, 3000) };
  });
  console.log('CARD', JSON.stringify(card));
  console.log('links a detalle:', JSON.stringify(await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')).filter((h) => /descuento|beneficio/.test(h)).slice(0, 15))));
  await page.close();
}
await browser.close();
