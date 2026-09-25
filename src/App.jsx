import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';

import PublicApp from './components/public/PublicApp';

import { initialData } from './data/initialData.js';
import { combinarDatos, normalizarDescuento } from './utils/descuentos';
import { descargarDatos, leerCache, masReciente } from './utils/remoteData';
import { hashDatos, cargarBorrador, guardarBorrador, descartarBorrador, limpiarClavesAntiguas } from './utils/storage';

// El admin se carga bajo demanda: los usuarios de la app pública no descargan su código.
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

const Cargando = () => (
  <div className="min-h-screen fondo-grilla flex items-center justify-center rotulo text-fg-muted">
    Cargando<span className="text-volt animate-parpadeo">_</span>
  </div>
);

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';
const SESSION_KEY = 'cardDiscount_admin_session';

// El panel admin nunca se incluye en la app nativa. En la web se activa en
// desarrollo, o en producción solo si VITE_ENABLE_ADMIN=true y hay contraseña.
const ADMIN_ENABLED =
  !Capacitor.isNativePlatform() &&
  (import.meta.env.DEV || (import.meta.env.VITE_ENABLE_ADMIN === 'true' && ADMIN_PASSWORD !== ''));

// Sin contraseña configurada (solo posible en desarrollo) no se pide login.
const REQUIRES_LOGIN = ADMIN_PASSWORD !== '';

const BASE_VERSION = hashDatos(initialData);

// Los descuentos incluidos en el build (~1 MB) van en un archivo aparte que se
// carga después de mostrar la app, en vez de dentro del código principal.
const cargarIncluidos = () => import('./data/descuentos.json').then((m) => m.default);

const readSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const CardDiscount = () => {
  const [currentView, setCurrentView] = useState('public');
  const [isLoggedIn, setIsLoggedIn] = useState(() => ADMIN_ENABLED && (!REQUIRES_LOGIN || readSession()));

  // Datos publicados: al abrir se muestra al instante la última copia guardada
  // (si hay) y luego se reemplaza por la más reciente entre los datos incluidos
  // en el build y los descargados de GitHub (se actualizan solos cada día).
  const [publicados, setPublicados] = useState(leerCache);

  useEffect(() => {
    let vigente = true;
    const actualizar = (datos) => {
      if (vigente && datos) setPublicados((actual) => masReciente(actual, datos));
    };
    cargarIncluidos().then(actualizar, () => {});
    descargarDatos().then(actualizar);
    return () => {
      vigente = false;
    };
  }, []);

  // Borrador editable del admin (solo datos manuales de initialData.js).
  // Se guarda junto a la versión de initialData.js a la que pertenece: si el
  // archivo cambia con la app abierta (recarga en caliente al pegar el código
  // generado), el borrador anterior deja de valer en vez de pisar los datos nuevos.
  const [borrador, setBorrador] = useState(() => ({
    base: BASE_VERSION,
    datos: (ADMIN_ENABLED && cargarBorrador(BASE_VERSION)) || initialData
  }));
  const draft = borrador.base === BASE_VERSION ? borrador.datos : initialData;
  const setDraft = (actualizar) =>
    setBorrador((prev) => {
      const actual = prev.base === BASE_VERSION ? prev.datos : initialData;
      return { base: BASE_VERSION, datos: typeof actualizar === 'function' ? actualizar(actual) : actualizar };
    });

  useEffect(() => {
    limpiarClavesAntiguas();
  }, []);

  useEffect(() => {
    if (ADMIN_ENABLED && draft !== initialData) {
      guardarBorrador(BASE_VERSION, draft.bancos, draft.descuentos);
    }
  }, [draft]);

  const hayCambios = draft !== initialData;

  const setBancos = (updater) =>
    setDraft((prev) => ({ ...prev, bancos: typeof updater === 'function' ? updater(prev.bancos) : updater }));
  const setDescuentos = (updater) =>
    setDraft((prev) => ({ ...prev, descuentos: typeof updater === 'function' ? updater(prev.descuentos) : updater }));

  const descartarCambios = () => {
    descartarBorrador();
    setDraft(initialData);
  };

  const handleLogin = (inputPassword) => {
    if (inputPassword !== ADMIN_PASSWORD) return false;
    setIsLoggedIn(true);
    setCurrentView('admin');
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // sessionStorage no disponible: la sesión dura hasta recargar
    }
    return true;
  };

  const handleLogout = () => {
    setIsLoggedIn(!REQUIRES_LOGIN);
    setCurrentView('public');
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignorar
    }
  };

  const openAdmin = () => setCurrentView(isLoggedIn ? 'admin' : 'login');

  // En modo admin se previsualiza el borrador + lo scrapeado; si no, los datos publicados.
  // El borrador se normaliza igual que al publicar, para que la vista previa sea fiel.
  const datosPublicos = useMemo(() => {
    if (!ADMIN_ENABLED || !publicados) return publicados;
    const borrador = { bancos: draft.bancos, descuentos: draft.descuentos.map(normalizarDescuento) };
    return combinarDatos(borrador, publicados.descuentos.filter((d) => d.fuente));
  }, [draft, publicados]);

  if (ADMIN_ENABLED && currentView === 'login' && !isLoggedIn) {
    return (
      <Suspense fallback={<Cargando />}>
        <LoginForm onLogin={handleLogin} onBack={() => setCurrentView('public')} />
      </Suspense>
    );
  }

  if (ADMIN_ENABLED && currentView === 'admin' && isLoggedIn) {
    return (
      <Suspense fallback={<Cargando />}>
        <AdminDashboard
          bancos={draft.bancos}
          setBancos={setBancos}
          descuentos={draft.descuentos}
          setDescuentos={setDescuentos}
          hayCambios={hayCambios}
          onDescartarCambios={descartarCambios}
          onVerApp={() => setCurrentView('public')}
          onLogout={handleLogout}
          showLogout={REQUIRES_LOGIN}
        />
      </Suspense>
    );
  }

  return (
    <PublicApp
      bancos={datosPublicos?.bancos}
      descuentos={datosPublicos?.descuentos}
      cargando={!datosPublicos}
      actualizado={publicados?.generado}
      onLoginClick={openAdmin}
      showLoginButton={ADMIN_ENABLED}
    />
  );
};

export default CardDiscount;
