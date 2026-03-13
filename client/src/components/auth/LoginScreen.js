import React, { useState } from 'react';
import { Stethoscope, Lock, Eye, LogIn } from 'lucide-react';
import api from '../../services/api';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      const demoEmail = role === 'admin' ? 'admin@example.com' : 'viewer@example.com';
      const demoPassword = role === 'admin' ? 'admin123' : 'viewer123';
      const data = await api.login(demoEmail, demoPassword);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Stethoscope className="w-12 h-12 text-blue-700" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Evaluation of Children With Special Needs</h1>
        <p className="text-slate-500 mb-8 text-center">Registry & Analysis System</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
          >
            <LogIn className="w-5 h-5 mr-3" />
            <span className="font-semibold">Login</span>
          </button>
        </form>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => handleDemo('admin')}
            className="flex-1 flex items-center justify-center p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Lock className="w-5 h-5 mr-3" />
            <span className="font-semibold">Admin Demo</span>
          </button>
          <button
            onClick={() => handleDemo('viewer')}
            className="flex-1 flex items-center justify-center p-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition"
          >
            <Eye className="w-5 h-5 mr-3" />
            <span className="font-semibold">Viewer Demo</span>
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-400 text-center">Online Web Application v3.0</p>
      </div>
    </div>
  );
}
