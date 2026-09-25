// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(password)) {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen fondo-grilla flex items-center justify-center p-4">
      <div className="bg-ink-900 border border-line w-full max-w-sm">
        <div className="px-6 h-14 flex items-center border-b border-line">
          <span className="rotulo text-fg">
            <span className="text-volt">//</span> Acceso admin
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="admin-password" className="rotulo block text-fg-dim mb-2">
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
              autoComplete="current-password"
              className="w-full h-11 bg-ink-950 border border-line focus:border-volt/60 px-3 text-fg placeholder:text-fg-dim outline-none transition-colors"
              placeholder="••••••••"
              required
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p role="alert" className="rotulo mt-2 text-alerta">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 rotulo bg-volt text-ink-950 font-semibold hover:brightness-110 transition"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full rotulo text-fg-dim hover:text-fg transition-colors"
          >
            ← Volver a la app
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;