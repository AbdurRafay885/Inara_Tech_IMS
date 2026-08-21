import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/inara_logo.png';
import formBg from '../assets/form_bg.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirect = (usr) => {
    if (usr.role === 'APPLICANT') {
      if (usr.applicationId) {
        navigate('/track');
      } else {
        navigate('/apply');
      }
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (user) {
      handleRedirect(user);
    }

    // Read queries (e.g. Session expired)
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setAlertMsg('Your session has expired. Please sign in again.');
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlertMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const usr = JSON.parse(localStorage.getItem('user'));
      handleRedirect(usr);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* Top Right Apply Button */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          to="/apply"
          className="inline-block px-5 py-2.5 rounded-xl border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-200 text-xs shadow-sm bg-transparent cursor-pointer"
        >
          Apply for Internship
        </Link>
      </div>

      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-3">
            <img src={logo} alt="Inara Technologies Logo" className="h-24 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="text-2xl font-bold text-slate-100">Sign in to IMS Portal</h2>
          <p className="text-slate-200 text-sm mt-1">Enter your credentials to access the portal</p>
        </div>

        {/* Panel */}
        <div className="glass-panel p-8 auth-card bg-slate-900/40">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3 text-red-800 text-[13px] font-semibold">
              <svg className="h-5 w-5 shrink-0 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {alertMsg && (
            <div className="bg-white border border-blue-800/40 rounded-xl p-4 mb-6 flex items-center space-x-3 text-blue-900 text-[13px]">
              <svg className="h-5 w-5 shrink-0 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{alertMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                Email Address
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-blue-800 hover:text-blue-950 text-xs font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="glass-input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3a9 9 0 0 1-8.56-8.56m1.153-1.153a3.5 3.5 0 0 1 4.828 4.828" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex justify-center items-center space-x-2 font-semibold"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        {/* Support & Navigation */}
        <div className="text-center mt-6 space-y-2">
          <p>
            <Link to="/home" className="text-blue-800 hover:text-blue-955 text-xs font-extrabold hover:underline">&larr; Go to home page</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
