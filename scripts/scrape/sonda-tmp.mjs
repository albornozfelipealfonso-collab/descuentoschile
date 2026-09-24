// Sonda temporal: campos extra de BCI y lista completa de Falabella
import { abrirPagina, cerrarNavegador } from './navegador.mjs';
import { USER_AGENT } from './lib.mjs';

const page = await abrirPagina();
const ofertas = [];
page.on('response', async (r) => { if (/v1\/offers\?/.test(r.url())) { try { ofertas.push(...(await r.json()).ofertas); } catch { /* */ } } });
await page.goto('https://www.bci.cl/beneficios/beneficios-bci', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(3000);
const pick = (o) => ({ titulo: o.titulo, fechaTermino: o.fechaTermino, tieneFechaTermino: o.tieneFechaTermino, categorias: o.categorias, comercio: o.comercio, beneficio: o.beneficio, deal: o.deal, scheduling: o.scheduling, tags: o.tags, tipoOfertaPrincipal: o.tipoOfertaPrincipal, partners: o.partners });
for (const i of [0, 40, 120, 200, 300]) if (ofertas[i]) console.log('BCI', i, JSON.stringify(pick(ofertas[i])).slice(0, 2500));
const conteo = (f) => { const m = {}; for (const o of ofertas) { const k = JSON.stringify(f(o)).slice(0, 80); m[k] = (m[k] || 0) + 1; } return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 15); };
console.log('BCI scheduling', JSON.stringify(conteo((o) => o.scheduling)));
console.log('BCI deal', JSON.stringify(conteo((o) => o.deal)));
console.log('BCI categorias', JSON.stringify(conteo((o) => (o.categorias || []).map((c) => c.nombre || c.name || c))));
await page.close();

// Falabella: HTML directo
const html = await (await fetch('https://www.bancofalabella.cl/descuentos/todos', { headers: { 'User-Agent': USER_AGENT } })).text();
const texto = html.replace(/\\"/g, '"');
for (const clave of ['"SIN TOPE"', 'Juan Valdez', '"discount', '"benefit', 'Dcto en Doggis']) {
  const idx = [...texto.matchAll(new RegExp(clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map((m) => m.index);
  console.log(`FAL "${clave}" apariciones:`, idx.length);
  for (const i of idx.slice(0, 2)) console.log('   ...', texto.slice(Math.max(0, i - 700), i + 700).replace(/\s+/g, ' '));
}
const slugs = [...new Set([...texto.matchAll(/descuentos\/detalle\/([a-z0-9-]+)/g)].map((m) => m[1]))];
console.log('FAL slugs de detalle:', slugs.length, JSON.stringify(slugs.slice(0, 10)));
if (slugs[0]) {
  const d = await (await fetch(`https://www.bancofalabella.cl/descuentos/detalle/${slugs.find((s) => s === 'doggis') || slugs[0]}`, { headers: { 'User-Agent': USER_AGENT } })).text();
  const t = d.replace(/\\"/g, '"');
  console.log('FAL detalle size', d.length);
  const j = t.indexOf('SIN TOPE') > 0 ? t.indexOf('SIN TOPE') : t.indexOf('%');
  console.log('FAL detalle contexto', t.slice(Math.max(0, j - 2500), j + 1500).replace(/\s+/g, ' '));
}
await cerrarNavegador();
