import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';


// Componentes
import LoginForm from './components/auth/LoginForm';
import PublicApp from './components/public/PublicApp';
import AdminDashboard from './components/admin/AdminDashboard';


// Datos iniciales
import { initialData } from './data/initialData.js';

// Detectar plataforma
const isMobileApp = Capacitor.isNativePlatform();
const SHOW_ADMIN = !isMobileApp;

const CardDiscount = () => {
  const [currentView, setCurrentView] = useState('public');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Datos locales (localStorage)
  const [bancos, setBancos] = useState(() => {
    const saved = localStorage.getItem('cardDiscount_bancos');
    return saved ? JSON.parse(saved) : initialData.bancos;
  });

  const [descuentos, setDescuentos] = useState(() => {
    const saved = localStorage.getItem('cardDiscount_descuentos');
    return saved ? JSON.parse(saved) : initialData.descuentos;
  });

  // Auto-guardar datos
  useEffect(() => {
    localStorage.setItem('cardDiscount_bancos', JSON.stringify(bancos));
  }, [bancos]);

  useEffect(() => {
    localStorage.setItem('cardDiscount_descuentos', JSON.stringify(descuentos));
  }, [descuentos]);

  // Verificar sesión
  useEffect(() => {
    if (localStorage.getItem('cardDiscount_session') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (inputPassword) => {
    if (inputPassword === 'admin123') {
      setIsLoggedIn(true);
      setCurrentView('admin');
      localStorage.setItem('cardDiscount_session', 'true');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('public');
    localStorage.removeItem('cardDiscount_session');
  };

  // Renderizado condicional
  if (currentView === 'login' && SHOW_ADMIN) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onBack={() => setCurrentView('public')} 
      />
    );
  }

  if (currentView === 'admin' && isLoggedIn && SHOW_ADMIN) {
    return (
      <AdminDashboard 
        bancos={bancos}
        setBancos={setBancos}
        descuentos={descuentos}
        setDescuentos={setDescuentos}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <PublicApp 
      bancos={bancos}
      descuentos={descuentos}
      onLoginClick={() => SHOW_ADMIN && setCurrentView('login')}
      showLoginButton={SHOW_ADMIN}
    />
  );
};

export default CardDiscount;