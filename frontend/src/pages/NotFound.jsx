import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
      <div className="h-20 w-20 rounded-2xl bg-cyan-400 border border-cyan-800/20 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/5">
        <span className="font-mono text-black text-3xl font-bold">404</span>
      </div>
      <h2 className="text-3xl font-extrabold text-slate-100 mb-2">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been relocated to another address.
      </p>
      <Link to="/home" className="btn-primary py-3 px-6 text-sm font-semibold">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
