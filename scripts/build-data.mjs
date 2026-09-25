// scripts/build-data.mjs
// Combina src/data/initialData.js (datos manuales del admin) con
// data/scraped/*.json y genera src/data/descuentos.json, que es lo que usa la
// app (incluido en el build y descargado en línea para actualizarse sola).
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { initialData } from '../src/data/initialData.js';
import { combinarDatos, normalizarBanco, normalizarDescuento, validarDatos } from '../src/utils/descuentos.js';

const SCRAPED_DIR = path.resolve('data/scraped');
const SALIDA = path.resolve('src/data/descuentos.json');

const scrapeados = [];
if (existsSync(SCRAPED_DIR)) {
  for (const file of (await readdir(SCRAPED_DIR)).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
    const { descuentos = [] } = JSON.parse(await readFile(path.join(SCRAPED_DIR, file), 'utf8'));
    scrapeados.push(...descuentos);
  }
}

const manual = {
  bancos: initialData.bancos.map(normalizarBanco),
  descuentos: initialData.descuentos.map(normalizarDescuento)
};
const combinados = combinarDatos(manual, scrapeados);
const { datos, errores } = validarDatos(combinados);
if (!datos) {
  console.error('❌ Datos inválidos, no se genera descuentos.json:\n' + errores.join('\n'));
  process.exit(1);
}

// Si el contenido no cambió, no se toca el archivo (evita cambios falsos en git y commits vacíos).
const previo = existsSync(SALIDA) ? JSON.parse(await readFile(SALIDA, 'utf8')) : null;
const contenido = (d) => JSON.stringify([d.bancos, d.descuentos]);
const mismoContenido = Boolean(previo) && contenido(previo) === contenido(datos);
if (!mismoContenido) {
  const salida = { version: 1, generado: new Date().toISOString(), ...datos };
  await writeFile(SALIDA, JSON.stringify(salida, null, 2) + '\n');
}
if (combinados.sinFecha.length) {
  console.log(
    `⚠️  ${combinados.sinFecha.length} descuentos manuales sin fecha de vencimiento no se publican ` +
      '(ponles fecha en el panel admin):\n' +
      combinados.sinFecha.map((d) => `   · ${d.banco_nombre}: ${d.establecimiento} — ${d.descuento}`).join('\n')
  );
}
console.log(`${mismoContenido ? '=' : '✅'} descuentos.json: ${datos.bancos.length} bancos, ${datos.descuentos.length} descuentos (${scrapeados.length} scrapeados)`);
