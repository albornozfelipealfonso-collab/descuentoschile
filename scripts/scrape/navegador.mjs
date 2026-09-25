// scripts/scrape/navegador.mjs - navegador compartido (Playwright) para sitios con JavaScript
import { chromium } from 'playwright';
import { USER_AGENT } from './lib.mjs';

let browser;
let visible;

export const abrirPagina = async () => {
  browser ??= await chromium.launch();
  return browser.newPage({ userAgent: USER_AGENT, locale: 'es-CL', timezoneId: 'America/Santiago' });
};

/**
 * Página en un navegador con ventana (no oculto). Algunos sitios (Incapsula)
 * bloquean el modo oculto; solo funciona en un computador con pantalla.
 */
export const abrirPaginaVisible = async () => {
  visible ??= await chromium.launch({ headless: false });
  return visible.newPage({ locale: 'es-CL', timezoneId: 'America/Santiago' });
};

export const cerrarNavegador = async () => {
  await Promise.all([browser?.close(), visible?.close()]);
  browser = undefined;
  visible = undefined;
};

export const DEBUG = process.env.SCRAPER_DEBUG === '1';
export const debug = (...args) => DEBUG && console.log('[debug]', ...args);
