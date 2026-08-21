import React from 'react';
import { Users } from 'lucide-react';
import { formatDepartment } from '../../utils/formatDepartment';

const DashboardTab = ({
  dashboardStats,
  navigate,
  getDeptBadgeClass,
  getApplicationStatusClass
}) => {
  return (
    <div className="space-y-12 dashboard-view">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-2">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">Active Interns</span>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              Active interns currently undergoing placement and roadmap training.
            </p>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 shrink-0 ml-4">
            {dashboardStats.activeInterns || 0}
          </div>
        </div>
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-2">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">Active Supervisors</span>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              Assigned supervisors managing department teams and milestones.
            </p>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 shrink-0 ml-4">
            {dashboardStats.activeSupervisors || 0}
          </div>
        </div>
      </div>

      {/* Interns Per Department Row */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Interns Registered Per Department</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {dashboardStats.departments?.map((d, index) => {
            const colors = [
              { border: 'border-blue-500', text: 'text-blue-600' },
              { border: 'border-yellow-500', text: 'text-yellow-600' },
              { border: 'border-cyan-500', text: 'text-cyan-600' },
              { border: 'border-purple-500', text: 'text-purple-600' },
              { border: 'border-green-500', text: 'text-green-600' },
              { border: 'border-red-500', text: 'text-red-600' }
            ][index % 5];

            return (
              <div key={d.department} className={`relative bg-slate-900 border ${colors.border} pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center`}>
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex flex-col justify-center items-center w-full">
                  <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">
                    {formatDepartment(d.department)}
                  </span>
                  <span className={`text-[25px] font-extrabold ${colors.text} leading-none mt-1.5 text-center`}>
                    {d.internCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Departments & Supervisors (One supervisor per department) */}
      <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-black border-b border-slate-900 pb-3">Department Placements & Supervisors</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {dashboardStats.departments?.map((d) => (
            <div key={d.department} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col justify-between space-y-3">
              <div>
                <span className={`px-3.5 py-1 rounded-md text-xs font-bold border uppercase block w-fit ${getDeptBadgeClass(d.department)}`}>
                  {formatDepartment(d.department)}
                </span>
                <span className="text-slate-100 font-bold block text-sm mt-3">{d.supervisorName}</span>
                <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider block mt-0.5">Assigned Supervisor</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split layout for Recent Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
              <span>Recent Applications</span>
              <button onClick={() => navigate('/admin/applications')} className="text-xs text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer p-0 font-semibold btn-icon">
                View All &rarr;
              </button>
            </h3>
            {dashboardStats.recentApplications?.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No recent applications submitted.</p>
            ) : (
              <div className="divide-y divide-slate-900 space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {dashboardStats.recentApplications?.map((app) => (
                  <div key={app.id} className="pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{app.firstName} {app.lastName}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{app.email} &bull; {formatDepartment(app.preferredDepartment)}</span>
                    </div>
                    <span className={`px-3.5 py-1 text-xs font-bold rounded-md border uppercase tracking-wider shrink-0 ${getApplicationStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Documents Review */}
        <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
              <span>Documents Pending Verification</span>
              <button onClick={() => navigate('/admin/onboarddocs')} className="text-xs text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer p-0 font-semibold btn-icon">
                View All &rarr;
              </button>
            </h3>
            {dashboardStats.recentPendingDocs?.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">All documents are verified!</p>
            ) : (
              <div className="divide-y divide-slate-900 space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {dashboardStats.recentPendingDocs?.map((doc) => (
                  <div key={doc.id} className="pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{doc.intern?.firstName} {doc.intern?.lastName}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{formatDepartment(doc.intern?.department)}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-slate-300 capitalize">{doc.type.toLowerCase().replace('_', ' ')}</span>
                      <button
                        onClick={() => navigate('/admin/onboarddocs')}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-2.5 py-1.5 rounded text-[10px] transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
