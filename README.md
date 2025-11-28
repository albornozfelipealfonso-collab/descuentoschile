# CardDiscount

Aplicación móvil y web para consultar descuentos de tarjetas bancarias en Chile. Vista pública para usuarios y panel de administración para gestionar contenido.

## Características

- **APK Android** + **Web responsive**
- Búsqueda en tiempo real y filtros avanzados (banco, día, categoría, tipo tarjeta)
- Panel admin con CRUD completo de bancos y descuentos
- Export/Import de datos JSON
- Generador de código para empaquetar datos en APK
- Upload de logos bancarios (Base64 o URLs)

## Stack Tecnológico

- React 18 + Capacitor
- localStorage + datos embebidos
- CSS3 responsive

## Estructura

```
src/
├── components/
│   ├── auth/         # Login admin
│   ├── public/       # Vista usuarios
│   ├── admin/        # Panel administración
│   └── shared/       # Hooks comunes
├── data/
│   └── initialData.js
└── utils/
```

## Instalación

```bash
git clone https://github.com/tuusuario/carddiscount.git
cd carddiscount
npm install
npm run dev
```

## Build Android

```bash
npm run build
npx cap sync android
npx cap build android
```

## Administración

**Acceso**: Botón login en web  
**Contraseña**: `admin123`

**Workflow**: Editar datos → "Generar Código" → Reemplazar `initialData.js` → Build APK

## Licencia

MIT License