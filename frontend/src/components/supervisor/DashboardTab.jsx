import React from 'react';
import { FileText, Send, CheckSquare, Clock, ClipboardList, PlayCircle } from 'lucide-react';
import { formatDepartment } from '../../utils/formatDepartment';

const DashboardTab = ({ dashboardStats, navigate }) => {
  return (
    <div className="space-y-12 dashboard-view">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-2">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">Assigned Interns</span>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              Active interns directly under your supervision and department.
            </p>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 shrink-0 ml-4">
            {dashboardStats.internsCount || 0}
          </div>
        </div>
        <div className="glass-panel p-5 bg-slate-900 border-slate-800 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="space-y-2">
            <span className="text-slate-100 font-extrabold text-xs uppercase tracking-wider block">Created Projects</span>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              Collaborative projects created to evaluate intern performance.
            </p>
          </div>
          <div className="text-3xl font-extrabold text-slate-100 shrink-0 ml-4">
            {dashboardStats.totalProjects || 0}
          </div>
        </div>
      </div>

      {/* Weekly Reports Row */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Weekly Reports Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="relative bg-slate-900 border border-blue-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Total</span>
              <span className="text-[25px] font-extrabold text-blue-600 leading-none mt-1.5 text-center">{dashboardStats.reports?.TOTAL || 0}</span>
            </div>
          </div>
          {/* Pending */}
          <div className="relative bg-slate-900 border border-yellow-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Pending</span>
              <span className="text-[25px] font-extrabold text-yellow-600 leading-none mt-1.5 text-center">{dashboardStats.reports?.SUBMITTED || 0}</span>
            </div>
          </div>
          {/* Approved */}
          <div className="relative bg-slate-900 border border-green-500 pl-12 pr-3 py-4 rounded-xl flex flex-col justify-center h-[90px] shadow-sm min-w-[125px] flex-1 text-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <CheckSquare className="h-4 w-4 text-red-500" />
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

      {/* Project Tasks Row */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-base font-extrabold text-black uppercase tracking-wider">Project Tasks Overview</h3>
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
              <CheckSquare className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-[11px] text-slate-200 font-normal uppercase tracking-wider block leading-tight text-center">Completed</span>
              <span className="text-[25px] font-extrabold text-green-600 leading-none mt-1.5 text-center">{dashboardStats.tasks?.COMPLETED || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Intern Progress Table */}
      <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-black border-b border-slate-900 pb-3">My Interns Training & Tasks Progress</h3>
        {dashboardStats.internProgress?.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">No interns currently assigned to you.</p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <table className="w-full min-w-[900px] text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5 text-left">Intern Name</th>
                  <th className="py-3 px-5 text-left">Department</th>
                  <th className="py-3 px-5 text-left">Training Completion</th>
                  <th className="py-3 px-5 text-left">Latest Report</th>
                  <th className="py-3 px-5 text-left">Task Stats (Pending/Completed)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {dashboardStats.internProgress?.map((intern, index) => (
                  <tr key={index} className="hover:bg-slate-950/20 text-slate-350 transition-colors align-middle">
                    <td className="py-3 px-5 font-semibold text-slate-200 whitespace-nowrap">{intern.name}</td>
                    <td className="py-3 px-5 whitespace-nowrap">{formatDepartment(intern.department)}</td>
                    <td className="py-3 px-5 align-top">
                      <div className="flex flex-col gap-1.5 min-w-[220px]">
                        <div className="w-[120px] bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900">
                          <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style={{ width: `${intern.progressPercentage}%` }}></div>
                        </div>
                        <span className="font-semibold text-slate-300 whitespace-nowrap text-[11px]">
                          {intern.progressString} ({intern.progressPercentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${intern.latestReportStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' :
                        intern.latestReportStatus === 'CHANGES_REQUESTED' ? 'bg-amber-950 text-amber-400 border-amber-800/20' :
                          intern.latestReportStatus === 'None Submitted' ? 'bg-slate-900 text-slate-400 border-slate-800/20' :
                            'bg-cyan-950 text-cyan-400 border-cyan-800/20'
                        }`}>
                        {intern.latestReportStatus}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-300 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold text-[11px]">
                        <span>{intern.pendingTasksCount}</span>
                        <span>Pending</span>
                      </span>
                      <span className="mx-1.5">•</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <span>{intern.completedTasksCount}</span>
                        <span>Completed</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="glass-panel p-6 bg-slate-900 border-slate-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-900 pb-3">Quick Supervisor Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/supervisor/projects')}
            className="p-4 rounded-xl text-left cursor-pointer transition-colors dashboard-card"
          >
            <span className="font-bold text-slate-950 block text-sm">Assign Tasks & Projects</span>
            <span className="text-slate-800 text-xs block mt-1">Create new milestones or assign custom tasks to your interns.</span>
          </button>
          <button
            onClick={() => navigate('/supervisor/review')}
            className="p-4 rounded-xl text-left cursor-pointer transition-colors dashboard-card"
          >
            <span className="font-bold text-slate-950 block text-sm">Review Reports</span>
            <span className="text-slate-800 text-xs block mt-1">Provide custom written feedback on submitted weekly progress reports.</span>
          </button>
          <button
            onClick={() => navigate('/supervisor/roadmap')}
            className="p-4 rounded-xl text-left cursor-pointer transition-colors dashboard-card"
          >
            <span className="font-bold text-slate-950 block text-sm">Manage Roadmaps</span>
            <span className="text-slate-800 text-xs block mt-1">Upload training files and PDFs for the department.</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
