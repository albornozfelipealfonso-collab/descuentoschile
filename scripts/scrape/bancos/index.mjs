// Registro de scrapers. Cada uno exporta { id, banco_nombre, url, scrape() }.
// banco_nombre debe coincidir con un banco de src/data/initialData.js.
//
// No incluidos: Banco de Chile (Incapsula) y Santander (bloqueo por IP) rechazan
// las conexiones desde los servidores de GitHub Actions; Itaú, Coopeuch y
// BancoEstado bloquean los navegadores automatizados.
import bci from './bci.mjs';
import bice from './bice.mjs';
import cencosud from './cencosud.mjs';
import falabella from './falabella.mjs';
import mach from './mach.mjs';
import ripley from './ripley.mjs';
import spin from './spin.mjs';

export const SCRAPERS = [bci, falabella, bice, mach, ripley, spin, cencosud];
