// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 CardDiscount</h1>
          <p className="text-white/80">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Contraseña de Admin
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              placeholder="Ingresa la contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-all"
          >
            Volver a la App
          </button>
        </form>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Contraseña: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;