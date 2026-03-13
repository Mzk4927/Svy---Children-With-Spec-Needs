import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationId: 'default-org',
    role: 'viewer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.register(formData);
      navigate('/login');
    } catch (registerError) {
      setError(registerError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Create account</h1>
        <p className="text-slate-500 mb-8 text-center">Register a new user for the registry.</p>

        {error && <div className="bg-red-100 text-red-700 border border-red-300 rounded p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" className="w-full px-4 py-2 border border-slate-300 rounded-lg" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 border border-slate-300 rounded-lg" required />
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-4 py-2 border border-slate-300 rounded-lg" required />
          <input name="organizationId" value={formData.organizationId} onChange={handleChange} placeholder="Organization ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg" required />
          <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
            <option value="viewer">Viewer</option>
            <option value="data_entry">Data Entry</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
