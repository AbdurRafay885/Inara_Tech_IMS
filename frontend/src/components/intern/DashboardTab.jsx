import React from 'react';
import { ClipboardList, Clock, PlayCircle, FileCheck, Send, Search, FileText } from 'lucide-react';
import { formatDepartment } from '../../utils/formatDepartment';

const DashboardTab = ({ dashboardStats, navigate }) => {
  return (
    <div className="space-y-12 dashboard-view">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-3 min-w-0 pt-1">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">My Placement</span>
            <div className="text-[12px] leading-none text-slate-300 whitespace-nowrap">
              <span className="font-semibold text-slate-200 text-[14px]">Placement:</span>{' '}
              <span className="text-lg font-bold text-slate-100 capitalize leading-none align-middle">
                {formatDepartment(dashboardStats.department)}
              </span>
            </div>
            <div className="text-[12px] leading-none text-slate-300 whitespace-nowrap">
              <span className="font-semibold text-slate-200 text-[14px]">Supervisor:</span>{' '}
              <span className="text-lg font-bold text-slate-100 leading-none align-middle">
                {dashboardStats.supervisorName}
              </span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-100 shrink-0 ml-4 opacity-0 pointer-events-none hidden md:block">
            {formatDepartment(dashboardStats.department)}
          </div>
        </div>
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-2">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">Training Progress</span>
            <div className="w-48 pt-1">
              <div className="flex justify-between items-center mb-1.5 text-sm text-slate-300">
                <span className="font-semibold">Approved:</span>
                <span className="font-bold text-slate-100 text-base">{dashboardStats.roadmapProgress?.progressString || '0 / 0 Weeks'}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style={{ width: `${dashboardStats.roadmapProgress?.progressPercentage || 0}%` }}></div>
              </div>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-100 shrink-0 ml-4">
            {dashboardStats.roadmapProgress?.progressPercentage || 0}%
          </div>
        </div>
      </div>

      {/* Project Tasks Row */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Project Tasks Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="relative bg-slate-900 border border-blue-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <ClipboardList className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Total Tasks</span>
              <span className="text-[25px] font-extrabold text-blue-600 leading-none mt-1.5 text-center">
                {(dashboardStats.tasks?.PENDING || 0) + (dashboardStats.tasks?.IN_PROGRESS || 0) + (dashboardStats.tasks?.COMPLETED || 0)}
              </span>
            </div>
          </div>
          {/* Pending */}
          <div className="relative bg-slate-900 border border-yellow-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Pending</span>
              <span className="text-[25px] font-extrabold text-yellow-600 leading-none mt-1.5 text-center">{dashboardStats.tasks?.PENDING || 0}</span>
            </div>
          </div>
          {/* In Progress */}
          <div className="relative bg-slate-900 border border-cyan-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <PlayCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">In Progress</span>
              <span className="text-[25px] font-extrabold text-cyan-600 leading-none mt-1.5 text-center">{dashboardStats.tasks?.IN_PROGRESS || 0}</span>
            </div>
          </div>
          {/* Completed */}
          <div className="relative bg-slate-900 border border-green-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <FileCheck className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Completed</span>
              <span className="text-[25px] font-extrabold text-green-600 leading-none mt-1.5 text-center">{dashboardStats.tasks?.COMPLETED || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Reports Row */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Roadmap Reports Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="relative bg-slate-900 border border-yellow-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Total</span>
              <span className="text-[25px] font-extrabold text-yellow-600 leading-none mt-1.5 text-center">
                {(dashboardStats.reports?.SUBMITTED || 0) +
                  (dashboardStats.reports?.UNDER_REVIEW || 0) +
                  (dashboardStats.reports?.APPROVED || 0) +
                  (dashboardStats.reports?.CHANGES_REQUESTED || 0)}
              </span>
            </div>
          </div>
          {/* Pending */}
          <div className="relative bg-slate-900 border border-purple-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Search className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Pending</span>
              <span className="text-[25px] font-extrabold text-purple-600 leading-none mt-1.5 text-center">
                {(dashboardStats.reports?.SUBMITTED || 0) +
                  (dashboardStats.reports?.UNDER_REVIEW || 0)}
              </span>
            </div>
          </div>
          {/* Approved */}
          <div className="relative bg-slate-900 border border-green-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <FileCheck className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Approved</span>
              <span className="text-[25px] font-extrabold text-green-600 leading-none mt-1.5 text-center">{dashboardStats.reports?.APPROVED || 0}</span>
            </div>
          </div>
          {/* Changes Requested */}
          <div className="relative bg-slate-900 border border-red-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Changes Req.</span>
              <span className="text-[25px] font-extrabold text-red-600 leading-none mt-1.5 text-center">{dashboardStats.reports?.CHANGES_REQUESTED || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split layout: Next Task & Onboarding Compliance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Next Task Card */}
        <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3 mb-4">Next Urgent Task</h3>
            {dashboardStats.nextTask ? (
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="font-bold text-slate-100 text-sm block">{dashboardStats.nextTask.title}</span>
                  <span className="text-slate-400 text-xs block">Project: <span className="font-bold text-slate-300">{dashboardStats.nextTask.projectName}</span></span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Due Date: <span className="font-bold text-red-400">{new Date(dashboardStats.nextTask.dueDate).toLocaleDateString()}</span></span>
                  <button
                    onClick={() => navigate('/intern/projects')}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    Submit Deliverable
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-slate-400 text-sm font-semibold">All tasks completed! 🎉</p>
                <p className="text-slate-500 text-xs">No active or pending tasks assigned currently.</p>
              </div>
            )}
          </div>
        </div>

        {/* Onboarding Documents Compliance Checklist */}
        <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
              <span>Onboarding Checklist</span>
              <button onClick={() => navigate('/intern/onboarding')} className="text-xs text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer p-0 font-semibold btn-icon">
                Upload Docs &rarr;
              </button>
            </h3>
            <div className="space-y-2.5">
              {Object.entries(dashboardStats.onboardingDocs || {}).map(([type, status]) => (
                <div key={type} className="flex justify-between items-center text-xs pb-2 border-b border-slate-900 last:border-0 last:pb-0">
                  <span className="text-slate-200 font-semibold uppercase">{type.replace('_', ' ')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' :
                    status === 'UPLOADED' ? 'bg-cyan-950 text-cyan-400 border-cyan-800/20' :
                      status === 'REJECTED' ? 'bg-red-950 text-red-400 border-red-800/20' :
                        'bg-slate-900 text-slate-400 border-slate-800/20'
                    }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Supervisor Feedback */}
      <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3">Recent Supervisor Feedback</h3>
        {dashboardStats.recentFeedback?.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">No reports feedback recorded yet.</p>
        ) : (
          <div className="space-y-3.5">
            {dashboardStats.recentFeedback?.map((item, index) => (
              <div key={index} className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold text-slate-200">Week {item.weekNumber} Report</span>
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-red-500 mt-1 italic leading-relaxed">{item.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
