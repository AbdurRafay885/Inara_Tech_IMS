import React from 'react';
import { formatDepartment } from '../../utils/formatDepartment';

const RecordsTab = ({
  historyFilters,
  setHistoryFilters,
  historyRecords,
  historyPage,
  setHistoryPage,
  ITEMS_PER_PAGE,
  handleOpenInternProfile,
  archiveModal,
  setArchiveModal,
  renderPagination,
  departmentOptions = []
}) => {
  if (historyRecords.length === 0) {
    return <p className="text-slate-500 text-center py-8">No historical internship records found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search name/email..."
          className="glass-input py-2 text-sm"
          value={historyFilters.search}
          onChange={(e) => setHistoryFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Year (e.g. 2026)..."
          className="glass-input py-2 text-sm"
          value={historyFilters.year}
          onChange={(e) => setHistoryFilters(prev => ({ ...prev, year: e.target.value }))}
        />
        <select
          className="glass-input py-2 text-sm"
          value={historyFilters.department}
          onChange={(e) => setHistoryFilters(prev => ({ ...prev, department: e.target.value }))}
        >
          <option className="bg-slate-950" value="">All Departments</option>
          {departmentOptions.map(opt => (
            <option className="bg-slate-950" key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-6">
        {historyRecords.slice((historyPage - 1) * ITEMS_PER_PAGE, (historyPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map((record) => (
          <div key={record.id} className="glass-panel p-6 border-slate-900 bg-slate-900/30">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-900 mb-4 gap-2">
              <div>
                <h4 className="text-slate-100 font-bold text-lg">{record.internName}</h4>
                <p className="text-slate-500 text-sm">{record.internEmail} &bull; Year: {record.internshipYear}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-800/20 px-3 py-1 rounded-full text-xs font-semibold">
                  {formatDepartment(record.department)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.completionStatus === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/20' : 'bg-red-950 text-red-400 border-red-800/20'}`}>
                  {record.completionStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[15px] mb-5">
              <div>
                <span className="text-slate-500 text-[12px] block mb-1 font-semibold uppercase tracking-wide">Supervisor</span>
                <span className="text-slate-300 text-[15px]">{record.supervisorName || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[12px] block mb-1 font-semibold uppercase tracking-wide">Original CV Snapshot</span>
                {record.cv ? (
                  <a
                    href={`http://localhost:5000/uploads/resumes/${record.cv}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline text-[15px]"
                  >
                    Download CV File
                  </a>
                ) : (
                  <span className="text-slate-500 text-[15px]">Not recorded</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 flex flex-wrap justify-end items-center gap-2.5">
              {record.user?.applicationId ? (
                <button
                  onClick={() => handleOpenInternProfile({ ...record.user, firstName: record.internName.split(' ')[0], lastName: record.internName.split(' ')[1] || '', email: record.internEmail, department: record.department })}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
                >
                  View Profile
                </button>
              ) : (
                <button
                  onClick={() => handleOpenInternProfile({ firstName: record.internName.split(' ')[0], lastName: record.internName.split(' ')[1] || '', email: record.internEmail, department: record.department, createdAt: record.createdAt })}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
                >
                  View Profile
                </button>
              )}
              <button
                onClick={() => setArchiveModal({ type: 'reports', record })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
              >
                View Reports Log
              </button>
              <button
                onClick={() => setArchiveModal({ type: 'projects', record })}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer"
              >
                View Projects
              </button>
            </div>
          </div>
        ))}
        {archiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold uppercase tracking-wider text-slate-100">
                  {archiveModal.type === 'reports' ? 'Weekly Reports Logs' : 'Projects Summary'}
                </h3>
                <button
                  onClick={() => setArchiveModal(null)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {archiveModal.type === 'reports' ? (
                archiveModal.record.weeklyReports.length === 0 ? (
                  <p className="text-slate-500 text-sm">No reports submitted.</p>
                ) : (
                  <div className="space-y-4">
                    {archiveModal.record.weeklyReports.map((r, index) => (
                      <div key={index} className="rounded-xl border border-slate-900 bg-slate-950/60 p-4 text-[14px] text-slate-400 leading-relaxed">
                        <span className="font-bold text-slate-200">Week {r.weekNumber}</span> ({r.status}):
                        <p className="mt-1">Work: "{r.workCompleted}"</p>
                        {r.feedback && <p className="text-cyan-400 mt-1">&rarr; Feedback: "{r.feedback}"</p>}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                archiveModal.record.projects.length === 0 ? (
                  <p className="text-slate-500 text-sm">No projects assigned.</p>
                ) : (
                  <div className="space-y-4">
                    {archiveModal.record.projects.map((p, index) => (
                      <div key={index} className="rounded-xl border border-slate-900 bg-slate-950/60 p-4 text-[14px] text-slate-400 leading-relaxed">
                        <span className="font-bold text-slate-200">{p.projectName}</span>:
                        <ul className="list-disc pl-5 mt-2 space-y-1.5">
                          {p.tasks.map((t, idx) => (
                            <li key={idx}>
                              {t.title} ({t.status}) {t.deliverable && <span className="text-indigo-400">&bull; Deliverable attached</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {renderPagination(historyPage, historyRecords.length, setHistoryPage)}
      </div>
    </div>
  );
};

export default RecordsTab;
