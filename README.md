# CardDiscount

App web y Android para consultar descuentos de tarjetas bancarias en Chile, con un panel de administración para mantener los datos.

## Características

- **Web responsive + APK Android** (Capacitor)
- Búsqueda instantánea, sin distinguir tildes ni mayúsculas
- Filtros por banco, día, categoría y tipo de tarjeta. Los descuentos "ambas" aparecen tanto en débito como en crédito.
- Por defecto se muestran los descuentos del día actual. Los descuentos vencidos y los de bancos desactivados se ocultan solos.
- Panel admin con CRUD de bancos y descuentos, importación/exportación JSON validada y generador de `initialData.js`

## Stack

- React 18 + Vite + Tailwind CSS
- Capacitor 7 (Android)
- Vitest + ESLint, con CI en GitHub Actions

## Inicio rápido

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                 | Qué hace                                         |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Servidor de desarrollo                           |
| `npm run build`        | Build de producción en `dist/`                   |
| `npm run preview`      | Sirve el build de producción                     |
| `npm test`             | Tests unitarios (Vitest)                         |
| `npm run lint`         | ESLint                                           |
| `npm run check`        | Lint + tests + build (lo mismo que corre el CI)  |
| `npm run android:sync` | Build + copia al proyecto Android                |

## Cómo se actualizan los datos

Los datos publicados viven en **`src/data/initialData.js`** y se empaquetan dentro de la web y de la APK. No hay backend.

1. Ejecuta `npm run dev` y entra al panel con el botón **Admin**.
2. Edita bancos y descuentos. Los cambios se guardan como borrador en el `localStorage` de tu navegador, y con **Ver app** puedes previsualizarlos.
3. Pulsa **💾 Generar Código**: valida los datos y descarga un `initialData.js` nuevo.
4. Reemplaza `src/data/initialData.js` con ese archivo y haz commit.
5. Publica: `npm run build` para la web, o `npm run android:sync` y luego `npx cap build android` para la APK.

Cuando `initialData.js` cambia, el borrador anterior se descarta y se usan los datos nuevos. Si tienes cambios sin publicar, primero usa **📥 Exportar** para guardar un respaldo.

## Panel admin y seguridad

- El panel **nunca** se incluye en la APK, y en el build web de producción está desactivado por defecto. Su código se carga solo cuando se abre.
- En desarrollo se entra sin contraseña, a menos que definas `VITE_ADMIN_PASSWORD`.
- Para activarlo en un build web, usa `VITE_ENABLE_ADMIN=true` junto con `VITE_ADMIN_PASSWORD` (ver `.env.example`).

> ⚠️ La contraseña se valida en el navegador y queda dentro del bundle JS, así que **no es seguridad real**. Como el admin solo modifica el borrador local de quien lo usa, esto no afecta a los usuarios. Si algún día los datos pasan a un servidor, la autenticación tiene que hacerse en el backend.

## Estructura

```
src/
├── App.jsx                 # Vistas (pública / login / admin) y borrador
├── components/
│   ├── auth/               # Login admin
│   ├── public/             # Vista de usuarios
│   ├── admin/              # Panel de administración
│   └── shared/hooks.jsx    # useIsMobile, useFilteredDescuentos, useDebouncedValue
├── data/initialData.js     # Datos publicados
└── utils/
    ├── descuentos.js       # Lógica pura: filtros, normalización, validación
    ├── descuentos.test.js  # Tests
    ├── storage.js          # Borrador versionado en localStorage
    └── download.js         # Descarga/lectura de archivos
```

## Android

```bash
npm run android:sync
npx cap open android      # abrir en Android Studio
npx cap build android      # o compilar directamente
```

Antes de publicar en Play Store, cambia `appId` en `capacitor.config.ts` (hoy es `com.tuempresa.carddiscount`), porque después ya no se puede modificar.
