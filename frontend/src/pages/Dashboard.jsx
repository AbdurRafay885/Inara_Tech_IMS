import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminPanel from '../components/AdminPanel';
import SupervisorPanel from '../components/SupervisorPanel';
import InternPanel from '../components/InternPanel';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden text-slate-100">
      {/* Dynamic Unified Sidebar */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <main className="flex-1 min-w-0 bg-slate-950 flex flex-col p-6 md:p-8 overflow-hidden">
        <div className="flex-1 min-h-0 bg-white border border-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden flex flex-col shadow-sm">
          <div className="flex-1 overflow-y-auto pr-1">
            <Routes>
              <Route
                path=":tab"
                element={
                  user?.role === 'ADMIN' ? (
                    <AdminPanel />
                  ) : user?.role === 'SUPERVISOR' ? (
                    <SupervisorPanel />
                  ) : (
                    <InternPanel />
                  )
                }
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      user?.role === 'ADMIN'
                        ? '/admin/dashboard'
                        : user?.role === 'SUPERVISOR'
                        ? '/supervisor/dashboard'
                        : '/intern/dashboard'
                    }
                    replace
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
