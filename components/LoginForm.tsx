
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
      setError('Invalid ID or Password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white/10 relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 rotate-3">
            <i className="fas fa-rocket text-white text-4xl"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tighter">Conversion Pro</h1>
          <p className="text-slate-600 mt-3 font-bold text-sm uppercase tracking-widest">Lead Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1">
              Authentication ID
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <i className="fas fa-id-badge"></i>
              </span>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-base"
                placeholder="Enter your ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1">
              Secret Passcode
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <i className="fas fa-shield-alt"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-base"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-center animate-bounce">
              <i className="fas fa-exclamation-triangle mr-3 text-sm"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transform hover:-translate-y-1 transition-all active:scale-95 shadow-2xl shadow-indigo-200"
          >
            Access System <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </form>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enterprise Edition</span>
            <div className="h-[1px] w-12 bg-slate-100"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-4">
            Authorized Personnel Only. All session data is monitored and synchronized in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
