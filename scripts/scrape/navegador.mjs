// scripts/scrape/navegador.mjs - navegador compartido (Playwright) para sitios con JavaScript
import { chromium } from 'playwright';
import { USER_AGENT } from './lib.mjs';

let browser;

export const abrirPagina = async () => {
  browser ??= await chromium.launch();
  return browser.newPage({ userAgent: USER_AGENT, locale: 'es-CL', timezoneId: 'America/Santiago' });
};

export const cerrarNavegador = async () => {
  await browser?.close();
  browser = undefined;
};

export const DEBUG = process.env.SCRAPER_DEBUG === '1';
export const debug = (...args) => DEBUG && console.log('[debug]', ...args);
