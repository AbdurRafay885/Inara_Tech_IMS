import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/inara_logo.png';
import formBg from '../assets/form_bg.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-3">
            <img src={logo} alt="Inara Technologies Logo" className="h-24 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
          <p className="text-slate-200 text-sm mt-1">We will send you a link to reset your account password</p>
        </div>

        <div className="glass-panel p-8 auth-card bg-slate-900/40">
          {error && (
            <div className="bg-white border border-red-800/40 rounded-xl p-4 mb-6 text-red-600 text-[13px]">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-white border border-blue-800/40 rounded-xl p-4 mb-6 text-black text-[13px] font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                Registered Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="glass-input"
                placeholder="name@inara.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex justify-center items-center space-x-2 font-semibold"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Link</span>}
            </button>
          </form>
        </div>

        <p className="text-center text-black text-xs font-semibold mt-6">
          Remember password? <Link to="/login" className="text-blue-800 hover:text-blue-955 font-extrabold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
