import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDepartment } from '../utils/formatDepartment';
import {
  LayoutDashboard,
  FileCheck,
  Building2,
  History,
  Bell,
  Users,
  ClipboardList,
  CheckSquare,
  Map,
  FileText,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import logo from '../assets/inara_logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const getNavItems = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/applications', name: 'Applications', icon: ClipboardList },
          { path: '/admin/interns', name: 'Interns', icon: Users },
          { path: '/admin/onboarddocs', name: 'Documents', icon: FileCheck },
          { path: '/admin/departments', name: 'Assign Depts.', icon: Building2 },
          { path: '/admin/history', name: 'Archived', icon: History },
          { path: '/admin/alerts', name: 'Alert Center', icon: Bell },
          { path: '/admin/settings', name: 'Settings', icon: Settings },
        ];
      case 'SUPERVISOR':
        return [
          { path: '/supervisor/dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { path: '/supervisor/interns', name: 'My Interns', icon: Users },
          { path: '/supervisor/roadmap', name: 'Roadmaps', icon: Map },
          { path: '/supervisor/review', name: 'Reports', icon: ClipboardList },
          { path: '/supervisor/projects', name: 'Projects', icon: CheckSquare },
          { path: '/supervisor/records', name: 'Archived', icon: History },
          { path: '/supervisor/alerts', name: 'Alert Center', icon: Bell },
        ];
      case 'INTERN':
        return [
          { path: '/intern/dashboard', name: 'Dashboard', icon: LayoutDashboard },
          { path: '/intern/profile', name: 'Profile', icon: User },
          { path: '/intern/onboarding', name: 'Documents', icon: FileText },
          { path: '/intern/roadmap', name: 'Training', icon: Map },
          { path: '/intern/reports', name: 'Reports', icon: ClipboardList },
          { path: '/intern/projects', name: 'Projects', icon: CheckSquare },
          { path: '/intern/alerts', name: 'Alert Center', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const getProfileData = () => {
    if (!user) return { name: '', role: '', avatarUrl: null, useAvatar: true };

    const formatDept = formatDepartment;

    switch (user.role) {
      case 'ADMIN':
        return {
          name: 'Admin',
          role: 'System Administrator',
          avatarUrl: null,
          useAvatar: true,
        };
      case 'SUPERVISOR':
        return {
          name: 'Supervisor',
          role: `${formatDepartment(user.department)} Supervisor`,
          avatarUrl: null,
          useAvatar: true,
        };
      case 'INTERN':
        return {
          name: `${user.firstName} ${user.lastName}`,
          role: `${formatDepartment(user.department)} Intern`,
          avatarUrl: user.picture ? `http://localhost:5000/uploads/pictures/${user.picture}` : null,
          useAvatar: false,
        };
      default:
        return {
          name: `${user.firstName} ${user.lastName}`,
          role: 'User',
          avatarUrl: null,
          useAvatar: true,
        };
    }
  };

  const navItems = getNavItems();
  const profile = getProfileData();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-800 shadow-[2px_0_15px_-3px_rgba(220,38,38,0.05)] flex flex-col justify-between shrink-0 p-4">
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Brand Logo */}
        <div className="flex items-center justify-center pt-6 pb-4 px-2 shrink-0">
          <img src={logo} alt="Inara Logo" className="w-[98%] max-h-20 object-contain" />
        </div>

        <hr className="mx-6 border-slate-200" />

        {/* Dynamic Navigation Items */}
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3.5 py-3.5 px-5 transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 border-l-[5px] border-red-600 text-white rounded-r-xl rounded-l-md mx-2 font-semibold shadow-md shadow-red-200'
                  : 'text-slate-100 hover:text-slate-50 hover:bg-slate-100/10 rounded-xl mx-2 font-semibold'
                  }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-200'}`} />
                <span className="text-[15px] truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Details Card */}
      <div className="border-t border-slate-800 pt-4 mt-auto">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3 truncate">
            {/* Avatar / Profile Picture */}
            <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-800 bg-slate-100 flex items-center justify-center">
              {!profile.useAvatar && profile.avatarUrl ? (
                <>
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div style={{ display: 'none' }} className="h-full w-full bg-slate-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="truncate">
              <span className="font-bold text-[13px] block text-slate-100 truncate leading-tight">
                {profile.name}
              </span>
              <span className="text-slate-200 text-[10px] block truncate mt-0.5 font-medium">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Sign Out"
            className="text-slate-200 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-805 bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-100">
              Sign Out Confirmation
            </h3>
            <p className="text-slate-300 text-sm font-medium">
              Are you sure you want to sign out?
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-600 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors text-center"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="bg-red-600 hover:bg-red-700 text-white border border-red-600 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors text-center"
              >
                Sign Out
              </button>

            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
