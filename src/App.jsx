import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Capacitor } from '@capacitor/core';

import PublicApp from './components/public/PublicApp';

import { initialData } from './data/initialData.js';
import datosIncluidos from './data/descuentos.json';
import { combinarDatos } from './utils/descuentos';
import { descargarDatos, leerCache, masReciente } from './utils/remoteData';
import { hashDatos, cargarBorrador, guardarBorrador, descartarBorrador, limpiarClavesAntiguas } from './utils/storage';

// El admin se carga bajo demanda: los usuarios de la app pública no descargan su código.
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

const Cargando = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white/70">Cargando…</div>
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

  // Datos publicados: los incluidos en el build o, si hay, una versión más
  // reciente descargada de GitHub (se actualizan solos cada día).
  const [publicados, setPublicados] = useState(() => masReciente(datosIncluidos, leerCache()));

  useEffect(() => {
    let vigente = true;
    descargarDatos().then((remotos) => {
      if (vigente && remotos) setPublicados((actual) => masReciente(actual, remotos));
    });
    return () => {
      vigente = false;
    };
  }, []);

  // Borrador editable del admin (solo datos manuales de initialData.js).
  const [draft, setDraft] = useState(() => {
    if (!ADMIN_ENABLED) return initialData;
    return cargarBorrador(BASE_VERSION) || initialData;
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
  const datosPublicos = useMemo(() => {
    if (!ADMIN_ENABLED) return publicados;
    return combinarDatos(draft, publicados.descuentos.filter((d) => d.fuente));
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
      bancos={datosPublicos.bancos}
      descuentos={datosPublicos.descuentos}
      actualizado={publicados.generado}
      onLoginClick={openAdmin}
      showLoginButton={ADMIN_ENABLED}
    />
  );
};

export default CardDiscount;
