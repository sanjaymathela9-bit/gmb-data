
import React, { useState } from 'react';
import { ADMIN_AUTH, EMPLOYEE_AUTH } from '../constants';
import { Role, User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (id === ADMIN_AUTH.id && password === ADMIN_AUTH.password) {
      onLogin({ id: ADMIN_AUTH.id, name: 'Super Admin', role: Role.ADMIN });
    } else if (id === EMPLOYEE_AUTH.id && password === EMPLOYEE_AUTH.password) {
      onLogin({ id: EMPLOYEE_AUTH.id, name: 'Sales Associate', role: Role.EMPLOYEE });
    } else {
      setError('Invalid ID or Password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-indigo-600 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Conversion Pro</h1>
          <p className="text-gray-500 mt-2">Sign in to manage leads</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="Enter your ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center animate-shake">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transform hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
          Retail & Sales Excellence
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
