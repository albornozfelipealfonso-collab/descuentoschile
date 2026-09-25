// Registro de scrapers. Cada uno exporta { id, banco_nombre, url, scrape() }.
// banco_nombre debe coincidir con un banco de src/data/initialData.js.
//
// Banco de Chile es `soloLocal`: su protección (Incapsula) bloquea a GitHub y al
// navegador oculto, así que se actualiza desde un PC con `npm run scrape bancochile`.
//
// No incluidos: Santander (bloqueo por IP) rechaza las conexiones desde los
// servidores de GitHub Actions; Itaú, Coopeuch,
// Banco Security y BancoEstado bloquean los navegadores automatizados, y sbpay
// publica los días y condiciones solo como imagen.
import bancochile from './bancochile.mjs';
import bci from './bci.mjs';
import bice from './bice.mjs';
import cencosud from './cencosud.mjs';
import copecpay from './copecpay.mjs';
import falabella from './falabella.mjs';
import mach from './mach.mjs';
import ripley from './ripley.mjs';
import spin from './spin.mjs';
import tenpo from './tenpo.mjs';

export const SCRAPERS = [bci, falabella, bice, mach, ripley, spin, cencosud, copecpay, tenpo, bancochile];
