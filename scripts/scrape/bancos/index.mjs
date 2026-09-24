// Registro de scrapers. Cada uno exporta { id, banco_nombre, url, scrape() }.
// banco_nombre debe coincidir con un banco de src/data/initialData.js.
//
// No incluidos: Banco de Chile (Incapsula) y Santander (bloqueo por IP) rechazan
// las conexiones desde los servidores de GitHub Actions.
import bci from './bci.mjs';
import falabella from './falabella.mjs';

export const SCRAPERS = [bci, falabella];
