import React from 'react';
import { formatDepartment } from '../../utils/formatDepartment';

const InternsTab = ({
  headerSearch,
  interns,
  internPage,
  ITEMS_PER_PAGE,
  getInternProgress,
  getDeptBadgeClass,
  handleOpenInternProfile,
  handleArchiveInternInline,
  completionStatuses,
  setCompletionStatuses,
  renderPagination,
  setInternPage
}) => {
  const q = headerSearch.trim().toLowerCase();
  const filtered = q
    ? interns.filter(i =>
      `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) ||
      (i.department || '').toLowerCase().includes(q)
    )
    : interns;

  if (filtered.length === 0) {
    return <p className="text-slate-500 text-center py-8">No interns currently assigned to you.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {filtered.slice((internPage - 1) * ITEMS_PER_PAGE, (internPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map((intern) => {
          const progress = getInternProgress(intern.id);
          return (
            <div key={intern.id} className="glass-panel p-8 border-slate-200 bg-white flex flex-col justify-between shadow-sm space-y-6 w-full">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-slate-100 font-bold text-xl hover:text-gray-600 cursor-pointer transition-colors" onClick={() => handleOpenInternProfile(intern)}>
                      {intern.firstName} {intern.lastName}
                    </h4>
                    <p className="text-slate-300 text-sm mt-0.5">{intern.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <span className={`px-3.5 py-1 rounded-md text-xs font-bold border uppercase ${getDeptBadgeClass(intern.department)}`}>
                      {formatDepartment(intern.department)}
                    </span>
                    <button
                      onClick={() => handleOpenInternProfile(intern)}
                      className="text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-red-700 transition-colors inline-block mt-1"
                    >
                      View Profile &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Progress timeline */}
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-sm h-full">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">Internship Progress</span>
                      <span className="text-cyan-600">{progress.progressString} ({progress.percentage}%) • {progress.remainingWeeks} Weeks Remaining</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-slate-300">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Archive form */}
                  {intern.isActive ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleArchiveInternInline(intern.id);
                      }}
                      className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm h-full"
                    >
                      <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">Archive Internship</div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          className="glass-input py-2 pr-12 text-xs bg-white border border-slate-200 cursor-pointer flex-1"
                          value={completionStatuses[intern.id] || 'Completed'}
                          onChange={(e) => setCompletionStatuses(prev => ({ ...prev, [intern.id]: e.target.value }))}
                        >
                          <option className="bg-white text-slate-700 text-xs" value="Completed">Completed Successfully</option>
                          <option className="bg-white text-slate-700 text-xs" value="Terminated">Terminated / Incomplete</option>
                        </select>
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm"
                        >
                          Archive Intern
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center text-slate-400 text-sm font-semibold shadow-sm h-full flex items-center justify-center">
                      Archived (Inactive)
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {renderPagination(internPage, filtered.length, setInternPage)}
    </div>
  );
};

export default InternsTab;
