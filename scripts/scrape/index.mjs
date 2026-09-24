// scripts/scrape/index.mjs
// Ejecuta los scrapers de cada banco y guarda data/scraped/<banco>.json.
// Protecciones: si un scraper falla, trae muy pocos descuentos o demasiados
// inválidos, se conservan los datos anteriores de ese banco.
//
// Uso: node scripts/scrape/index.mjs [banco1 banco2 ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { normalizarDescuento, toISODate } from '../../src/utils/descuentos.js';
import { SCRAPERS } from './bancos/index.mjs';

const DIR = path.resolve('data/scraped');
const MIN_RATIO = 0.5;      // no aceptar si baja a menos de la mitad
const MIN_PREVIO = 10;      // ...cuando antes había al menos esta cantidad
const MAX_INVALIDOS = 0.3;  // no aceptar si más del 30% viene incompleto

const leerPrevio = async (id) => {
  const file = path.join(DIR, `${id}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, 'utf8'));
};

export const validarResultado = (crudos, previo, scraper) => {
  const normalizados = crudos.map((d) =>
    normalizarDescuento({ ...d, banco_nombre: scraper.banco_nombre, fuente: scraper.id, activo: true })
  );
  const validos = normalizados.filter((d) => d.id && d.establecimiento && d.descuento);
  // Eliminar duplicados por id
  const unicos = [...new Map(validos.map((d) => [d.id, d])).values()];

  if (unicos.length === 0) throw new Error('no se encontró ningún descuento');
  const invalidos = 1 - validos.length / normalizados.length;
  if (invalidos > MAX_INVALIDOS) {
    throw new Error(`${Math.round(invalidos * 100)}% de los descuentos vienen incompletos`);
  }
  const antes = previo?.descuentos?.length ?? 0;
  if (antes >= MIN_PREVIO && unicos.length < antes * MIN_RATIO) {
    throw new Error(`bajó de ${antes} a ${unicos.length} descuentos (posible cambio en el sitio)`);
  }
  return unicos;
};

const main = async () => {
  await mkdir(DIR, { recursive: true });
  const filtro = process.argv.slice(2);
  const scrapers = SCRAPERS.filter((s) => filtro.length === 0 || filtro.includes(s.id));
  const resumen = [];

  for (const scraper of scrapers) {
    const inicio = Date.now();
    const previo = await leerPrevio(scraper.id);
    try {
      const crudos = await scraper.scrape();
      const descuentos = validarResultado(crudos, previo, scraper);
      const salida = {
        fuente: scraper.id,
        banco_nombre: scraper.banco_nombre,
        url: scraper.url,
        actualizado: toISODate(),
        descuentos
      };
      await writeFile(path.join(DIR, `${scraper.id}.json`), JSON.stringify(salida, null, 2) + '\n');
      resumen.push({ banco: scraper.id, ok: true, cantidad: descuentos.length, antes: previo?.descuentos?.length ?? 0 });
    } catch (error) {
      resumen.push({ banco: scraper.id, ok: false, error: error.message, conserva: previo?.descuentos?.length ?? 0 });
    }
    resumen.at(-1).segundos = Math.round((Date.now() - inicio) / 1000);
  }

  for (const r of resumen) {
    console.log(
      r.ok
        ? `✅ ${r.banco}: ${r.cantidad} descuentos (antes ${r.antes}) en ${r.segundos}s`
        : `❌ ${r.banco}: ${r.error}. Se conservan ${r.conserva} descuentos anteriores.`
    );
  }
  await writeFile(path.join(DIR, '_resumen.json'), JSON.stringify(resumen, null, 2) + '\n');
  // Código de salida 0 aunque falle un banco: los demás igual se publican.
  // El workflow lee _resumen.json para avisar de los fallos.
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
