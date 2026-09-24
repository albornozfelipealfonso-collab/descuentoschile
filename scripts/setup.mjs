// scripts/setup.mjs - prepara el proyecto en un computador nuevo: `npm run setup`
// Solo usa módulos de Node, así que funciona antes de instalar las dependencias.
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';

const ok = (msg) => console.log(`✅ ${msg}`);
const fallo = (msg, ayuda) => {
  console.error(`\n❌ ${msg}${ayuda ? `\n   ${ayuda}` : ''}\n`);
  process.exit(1);
};
const correr = (titulo, comando) => {
  console.log(`\n▶ ${titulo}\n  $ ${comando}`);
  const r = spawnSync(comando, { stdio: 'inherit', shell: true });
  if (r.status !== 0) fallo(`Falló: ${titulo}`, `Revisa el mensaje de arriba y vuelve a ejecutar "npm run setup".`);
  ok(titulo);
};

console.log('🎯 CardDiscount — preparando el proyecto\n');

// 1. Node.js 20.19+ (lo exige Vite)
const [mayor, menor] = process.versions.node.split('.').map(Number);
if (mayor < 20 || (mayor === 20 && menor < 19)) {
  fallo(`Tienes Node.js ${process.versions.node}; se necesita 20.19 o más nuevo.`, 'Instala la versión LTS desde https://nodejs.org y vuelve a intentarlo.');
}
ok(`Node.js ${process.versions.node}`);

// 2. Git
if (spawnSync('git --version', { shell: true }).status !== 0) {
  fallo('No se encontró Git.', 'Instálalo desde https://git-scm.com y vuelve a intentarlo.');
}
ok('Git instalado');

// 3. Dependencias y navegador para los scrapers
correr('Instalar dependencias', 'npm install');
correr('Instalar navegador para los scrapers', 'npx playwright install chromium');

// 4. Variables de entorno locales (opcional)
if (!existsSync('.env.local') && existsSync('.env.example')) {
  copyFileSync('.env.example', '.env.local');
  ok('Creado .env.local desde .env.example (puedes poner ahí tu contraseña de admin)');
}

// 5. Verificación completa
correr('Verificar el proyecto (lint + tests + build)', 'npm run check');

console.log(`
🎉 ¡Listo! Comandos útiles:

   npm run dev      → abre la app en http://localhost:3000
   npm run scrape   → actualiza los descuentos desde los bancos
   claude           → trabajar con Claude Code en esta carpeta
`);
