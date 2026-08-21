import React, { useState } from 'react';
import { formatDepartment } from '../../utils/formatDepartment';

const ReviewTab = ({
  reports,
  interns,
  getInternProgress,
  selectedReviewRoadmaps,
  setSelectedReviewRoadmaps,
  setSelectedReport,
  roadmaps,
  searchQuery
}) => {
  const [selectedModules, setSelectedModules] = useState({});
  const [selectedSubModules, setSelectedSubModules] = useState({});

  const filteredInterns = interns.filter(intern =>
    reports.some(r => r.internId === intern.id) &&
    (`${intern.firstName} ${intern.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-2 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-955">Review Weekly Reports</h3>
      </div>

      {reports.length === 0 ? (
        <p className="text-slate-700 text-center py-8 text-base font-semibold">No weekly reports submitted for review.</p>
      ) : filteredInterns.length === 0 ? (
        <p className="text-slate-500 text-center py-8 font-medium">No matching interns found.</p>
      ) : (
        <div className="space-y-6">
          {filteredInterns.map((intern) => {
            const progress = getInternProgress(intern.id);
            const internReports = reports.filter(r => r.internId === intern.id);
            const roadmapOptions = internReports.reduce((options, report) => {
              const roadmapId = report.roadmapId || null;
              if (options.some((roadmap) => roadmap.roadmapId === roadmapId)) return options;

              const progressRoadmap = progress.roadmapProgress.find((roadmap) => roadmap.roadmapId === roadmapId);
              return [
                ...options,
                {
                  roadmapId,
                  index: options.length + 1,
                  title: report.roadmap?.title || progressRoadmap?.title || 'Default Training Roadmap',
                  approvedWeeks: progressRoadmap?.approvedWeeks || 0,
                  totalWeeks: progressRoadmap?.totalWeeks || report.roadmap?.durationWeeks || 0,
                },
              ];
            }, []);
            const internRoadmap = roadmaps?.find(r => r.department === intern.department);
            const selectedReports = internRoadmap
              ? internReports.filter((report) => report.roadmapId === internRoadmap.id)
              : internReports;
            return (
              <div key={intern.id} className="glass-panel w-full p-6 border-slate-300 bg-white shadow-sm flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 mb-5 pb-4 border-b border-slate-200">
                    <div>
                      <h4 className="text-slate-950 font-semibold text-[16px]">{intern.firstName} {intern.lastName}</h4>
                      <p className="text-slate-400 text-[13px] font-medium">{intern.email}</p>
                    </div>
                    <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3.5 py-1.5 rounded-full text-sm font-semibold w-fit">
                      {formatDepartment(intern.department)}
                    </span>
                  </div>

                  {/* Progress timeline */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm mb-3 font-bold">
                      <span className="text-slate-900 text-[16px] font-medium">Internship Progress</span>
                      <span className="text-slate-600 font-medium">{progress.progressString} ({progress.percentage}%) • {progress.remainingWeeks} Tasks Remaining</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Reports log list */}
                  {(() => {
                    const internRoadmap = roadmaps?.find(r => r.department === intern.department);
                    if (internRoadmap && internRoadmap.modules && internRoadmap.modules.length > 0) {
                      const activeModId = selectedModules[intern.id] || internRoadmap.modules[0].id;
                      const activeModule = internRoadmap.modules.find(m => m.id === activeModId) || internRoadmap.modules[0];

                      const activeSubModId = selectedSubModules[intern.id] || (activeModule.subModules && activeModule.subModules[0]?.id) || null;
                      const activeSubModule = activeModule.subModules?.find(s => s.id === activeSubModId) || activeModule.subModules?.[0] || null;

                      return (
                        <div className="space-y-5 border-t border-slate-200 pt-5 mt-5">
                          {/* Module Tabs */}
                          <div>
                            <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">Modules</span>
                            <div className="flex flex-wrap gap-2.5">
                              {internRoadmap.modules.map((mod, index) => {
                                const isSelected = activeModId === mod.id;
                                return (
                                  <button
                                    key={mod.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedModules(prev => ({ ...prev, [intern.id]: mod.id }));
                                      const firstSubId = mod.subModules?.[0]?.id || null;
                                      setSelectedSubModules(prev => ({ ...prev, [intern.id]: firstSubId }));
                                    }}
                                    className="tab-btn px-5 py-3 rounded-xl text-left border transition-all cursor-pointer shadow-sm"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fff5f5', color: '#991b1b', borderColor: '#ef4444' }
                                        : { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' }
                                    }
                                  >
                                    <span className="block text-[10px] uppercase font-bold tracking-wider opacity-75">
                                      Module {index + 1}
                                    </span>
                                    <span className="block text-xs font-black mt-0.5">
                                      {mod.title}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Sub-modules List */}
                          {activeModule && activeModule.subModules && activeModule.subModules.length > 0 ? (
                            <div>
                              <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">Sub Modules</span>
                              <div className="flex flex-wrap gap-2 py-1">
                                {activeModule.subModules.map((sub) => {
                                  const isSelected = activeSubModId === sub.id;
                                  return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => setSelectedSubModules(prev => ({ ...prev, [intern.id]: sub.id }))}
                                      className="tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm"
                                      style={
                                        isSelected
                                          ? { backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }
                                          : { backgroundColor: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }
                                      }
                                    >
                                      {sub.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-500 text-xs italic">No sub-modules configured for this module.</p>
                          )}

                          {/* Tasks under Selected Sub-module */}
                          {activeSubModule && activeSubModule.tasks && activeSubModule.tasks.length > 0 ? (
                            <div className="space-y-2.5">
                              <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">Tasks & Reports</span>
                              {activeSubModule.tasks.map((task) => {
                                const report = selectedReports.find(r => r.taskId === task.id);
                                return (
                                  <div key={task.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center shadow-sm hover:border-slate-300 transition-colors">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      <span className="font-bold text-sm" style={{ color: '#0f172a' }}>Task: {task.title}</span>
                                      <span
                                        className="px-3 py-1 rounded-xl text-[10px] font-extrabold border uppercase tracking-wider"
                                        style={
                                          report
                                            ? report.status === 'APPROVED'
                                              ? { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }
                                              : report.status === 'CHANGES_REQUESTED'
                                                ? { backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }
                                                : { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }
                                            : { backgroundColor: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }
                                        }
                                      >
                                        {report ? report.status : 'PENDING'}
                                      </span>
                                    </div>
                                    {report && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedReport(report)}
                                        className="!bg-cyan-600 hover:!bg-cyan-500 !text-slate-950 font-extrabold py-1.5 px-4 text-[11px] rounded-lg cursor-pointer transition-colors border-0"
                                      >
                                        View
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            activeSubModule && <p className="text-slate-500 text-xs italic">No tasks configured for this sub-module.</p>
                          )}
                        </div>
                      );
                    }

                    // Fallback to original list layout if no roadmap metadata loaded
                    return (
                      <div className="space-y-4">
                        {selectedReports.length === 0 ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-700 text-base font-semibold">
                            No reports submitted for this roadmap yet.
                          </div>
                        ) : selectedReports.map(report => (
                          <div key={report.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center shadow-sm">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-cyan-800 font-bold text-sm">Task: {report.task?.title}</span>
                              {report.task?.subModule && (
                                <span className="text-[11px] bg-slate-55 border border-slate-250 text-slate-800 px-2 py-0.5 rounded font-bold">
                                  {report.task.subModule.title}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${report.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : report.status === 'CHANGES_REQUESTED' ? 'bg-amber-50 text-amber-800 border-amber-300' : report.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                                {report.status}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedReport(report)}
                              className="!bg-cyan-600 hover:!bg-cyan-500 !text-slate-950 font-extrabold py-1.5 px-4 text-[11px] rounded-lg cursor-pointer transition-colors border-0"
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewTab;
