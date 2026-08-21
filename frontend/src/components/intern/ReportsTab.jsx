import React, { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

const ReportsTab = ({
  progressDetails,
  submittedReports,
  activeSubmitRoadmapId,
  setActiveSubmitRoadmapId,
  setEditingReport,
  editingReport,
  reportForm,
  setReportForm,
  handleSubmitReport,
  handleStartEdit,
  roadmaps,
  errorMsg,
  setErrorMsg
}) => {
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubModules, setExpandedSubModules] = useState({});

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubModule = (id) => {
    setExpandedSubModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress Metrics Bar */}
      {progressDetails && (
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 text-left">
          <div className="flex flex-col sm:flex-row justify-between text-sm mb-3 font-semibold gap-1">
            <span className="text-slate-400">Total Training Progress • <span className="text-blue-755 font-extrabold">{progressDetails.remainingWeeks} Tasks Remaining</span></span>
            <span className="text-blue-750 font-extrabold">{progressDetails.progressString} ({progressDetails.progressPercentage}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressDetails.progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Task Submission Dashboard */}
      <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 space-y-6 rounded-2xl">
        <div className="border-b border-slate-900 pb-4 text-left">
          <h4 className="text-lg font-bold text-slate-100">Training Task Reports Directory</h4>
          <p className="text-xs text-slate-400 mt-1">Submit reports for each task separately. Your supervisor will review and approve them.</p>
        </div>        {roadmaps && roadmaps.length > 0 ? (
          <div className="space-y-6 text-left">
            {roadmaps[0].modules.map((mod, modIdx) => {
              const hours = mod.subModules.reduce((s, sb) => s + sb.tasks.reduce((st, t) => st + t.durationHours, 0), 0);
              const isExpanded = expandedModules[mod.id] ?? true;

              return (
                <div key={mod.id} className="bg-slate-950/60 border border-red-500 rounded-2xl overflow-hidden shadow-sm mb-10">
                  {/* Module Header Bar */}
                  <div
                    role="button"
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex justify-between items-center p-5 text-left bg-rose-100/90 hover:bg-rose-200/95 transition-all border-b border-rose-200 focus:outline-none cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-200/60 text-rose-800 p-2 rounded-xl border border-rose-300/80">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-100 text-[16px] font-extrabold block">{modIdx + 1}. {mod.title}</span>
                        <span className="text-[12px] text-slate-300 font-bold block mt-0.5">{mod.subModules.length} Sub-modules</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-white/90 text-rose-850 border border-black text-[12px] px-2.5 py-1 rounded-lg font-black shrink-0">
                        {formatDuration(hours)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-rose-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-rose-600" />
                      )}
                    </div>
                  </div>

                  {/* Sub-modules & Tasks inside Module */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-900 bg-slate-950/20 space-y-10 text-left">
                      {mod.subModules.length === 0 ? (
                        <p className="text-slate-300 text-xs italic">No content configured for this module.</p>
                      ) : (
                        <div className="space-y-10">
                          {mod.subModules.map((sub, subIdx) => {
                            const isSubExpanded = expandedSubModules[sub.id] ?? true;
                            const subHours = sub.tasks.reduce((sum, task) => sum + (task.durationHours || 0), 0);

                            return (
                              <div key={sub.id} className="space-y-3">
                                <div
                                  role="button"
                                  onClick={() => toggleSubModule(sub.id)}
                                  className="border-b border-slate-900 pb-2 flex justify-between items-center cursor-pointer select-none hover:bg-slate-900/5 transition-all px-1 rounded"
                                >
                                  <div>
                                    <span className="text-slate-100 text-[14px] font-bold block">{modIdx + 1}.{subIdx + 1} {sub.title}</span>
                                    {sub.description && (
                                      <p className="text-[12px] text-slate-355 italic mt-1 leading-relaxed">{sub.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="flex items-center gap-1 bg-slate-900 border border-slate-600 text-slate-400 text-[12px] font-mono px-2 py-0.5 rounded-md font-bold">
                                      <Clock className="h-4 w-4 text-red-500" /> {formatDuration(subHours)}
                                    </span>
                                    <div className="text-slate-400 hover:text-slate-200 transition-colors">
                                      {isSubExpanded ? (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Tasks of this Sub-module */}
                                {isSubExpanded && (
                                  <div className="pl-4 space-y-2">
                                    {sub.tasks.length === 0 ? (
                                      <p className="text-slate-300 text-[10px] italic font-medium">No tasks listed.</p>
                                    ) : (
                                      sub.tasks.map((task) => {
                                        const report = submittedReports.find(r => r.taskId === task.id);
                                        const isFormActive = activeSubmitRoadmapId === task.id;

                                        return (
                                          <div key={task.id} className="bg-slate-950 border border-slate-500 p-3 rounded-xl space-y-3">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                              <div>
                                                <span className="text-slate-200 text-[12px] font-semibold block">{task.title}</span>
                                                {task.description && (
                                                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium mt-0.5">{task.description}</p>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                                {/* Duration Badge */}
                                                <span className="flex items-center gap-1 bg-slate-900 border border-slate-600 text-slate-400 text-[12px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0">
                                                  <Clock className="h-4 w-4 text-red-500" /> {task.durationHours} hrs
                                                </span>

                                                {/* Status badge and trigger buttons */}
                                                <div className="flex items-center gap-2">
                                                  {report ? (
                                                    <>
                                                      <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold border uppercase tracking-wider ${report.status === 'APPROVED'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                        : report.status === 'CHANGES_REQUESTED'
                                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                          : 'bg-blue-50 text-blue-800 border-blue-300'
                                                        }`}>
                                                        {report.status}
                                                      </span>
                                                      {report.status === 'CHANGES_REQUESTED' && (
                                                        <button
                                                          onClick={() => handleStartEdit(report)}
                                                          className="bg-red-650 hover:bg-red-750 text-white text-xs font-extrabold px-5 py-2 rounded-xl cursor-pointer transition-colors border-0 shadow-sm"
                                                        >
                                                          Resolve & Submit
                                                        </button>
                                                      )}
                                                      {report.status === 'SUBMITTED' && (
                                                        <button
                                                          onClick={() => handleStartEdit(report)}
                                                          className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-extrabold px-5 py-2 rounded-xl cursor-pointer transition-colors border-0 shadow-sm"
                                                        >
                                                          Edit
                                                        </button>
                                                      )}
                                                    </>
                                                  ) : (
                                                    <>
                                                      <span className="bg-slate-50 text-slate-900 border border-slate-300 px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider">
                                                        Pending
                                                      </span>
                                                      <button
                                                        onClick={() => {
                                                          setEditingReport(null);
                                                          setReportForm({
                                                            taskId: task.id,
                                                            workCompleted: '',
                                                            challengesFaced: '',
                                                            attachment: null
                                                          });
                                                          setActiveSubmitRoadmapId(task.id);
                                                        }}
                                                        className="bg-red-650 hover:bg-red-750 text-white text-xs font-extrabold px-5 py-2 rounded-xl cursor-pointer transition-colors border-0 shadow-sm"
                                                      >
                                                        Submit Report
                                                      </button>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {report && report.attachment && (
                                              <div className="pt-1 text-left">
                                                <a
                                                  href={`http://localhost:5000/api/reports/download/${report.id}?token=${localStorage.getItem('token')}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-red-500 hover:text-red-650 font-bold inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
                                                >
                                                  <Download className="h-3 w-3" /> Download Uploaded Attachment
                                                </a>
                                              </div>
                                            )}

                                            {report && report.feedback && (
                                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 text-xs text-left">
                                                <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">Supervisor Remarks</span>
                                                <p className="text-slate-300 italic">"{report.feedback}"</p>
                                              </div>
                                            )}

                                            {/* Modal Dialog overlay */}
                                            {isFormActive && (
                                              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                                <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-xl">
                                                  <div className="text-[16px] font-black text-slate-100 uppercase tracking-wider pb-2.5 border-b border-slate-300 text-left">
                                                    {!editingReport
                                                      ? 'Submit Task Report'
                                                      : editingReport.status === 'CHANGES_REQUESTED'
                                                        ? 'Resolve Changes & Re-submit'
                                                        : 'Edit Task Report'}
                                                  </div>
                                                  <form onSubmit={handleSubmitReport} className="space-y-4 text-left">
                                                    <div>
                                                      <label className="block text-slate-300 font-extrabold text-[11px] uppercase tracking-wider mb-1.5">Task Title</label>
                                                      <input
                                                        type="text"
                                                        readOnly
                                                        className="w-full bg-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none cursor-default"
                                                        value={task.title}
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="block text-slate-300 font-extrabold text-[11px] uppercase tracking-wider mb-1.5" htmlFor="workCompleted">Work Completed</label>
                                                      <textarea
                                                        id="workCompleted"
                                                        required
                                                        className="w-full bg-white text-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                                        placeholder="Summarize the work you completed for this task..."
                                                        rows="4"
                                                        value={reportForm.workCompleted}
                                                        onChange={(e) => setReportForm(prev => ({ ...prev, workCompleted: e.target.value }))}
                                                      ></textarea>
                                                    </div>
                                                    <div>
                                                      <label className="block text-slate-300 font-extrabold text-[11px] uppercase tracking-wider mb-1.5" htmlFor="challengesFaced">Blockers & Challenges</label>
                                                      <textarea
                                                        id="challengesFaced"
                                                        required
                                                        className="w-full bg-white text-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                                                        placeholder="Describe any challenges or blockers faced..."
                                                        rows="3"
                                                        value={reportForm.challengesFaced}
                                                        onChange={(e) => setReportForm(prev => ({ ...prev, challengesFaced: e.target.value }))}
                                                      ></textarea>
                                                    </div>
                                                    <div>
                                                      <label className="block text-slate-300 font-extrabold text-[11px] uppercase tracking-wider mb-1.5">
                                                        {editingReport ? 'New Attachment File (Optional)' : 'Attachment File (Mandatory)'}
                                                      </label>
                                                      <div className="bg-white border border-slate-300 border-dashed rounded-xl px-4 py-4 text-center hover:border-blue-500 transition-all duration-200 relative cursor-pointer">
                                                        <input
                                                          type="file"
                                                          accept=".pdf,.doc,.docx"
                                                          onChange={(e) => setReportForm(prev => ({ ...prev, attachment: e.target.files[0] }))}
                                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        {reportForm.attachment ? (
                                                          <span className="text-blue-600 text-xs font-bold truncate block">{reportForm.attachment.name}</span>
                                                        ) : (
                                                          <span className="text-slate-100 text-xs font-bold">Choose document file (PDF/Doc)</span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {errorMsg && (
                                                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold text-left">
                                                        {errorMsg}
                                                      </div>
                                                    )}
                                                    <div className="flex space-x-3 pt-4 border-t border-slate-300">
                                                      <button type="submit" className="!bg-blue-600 hover:!bg-blue-700 !text-white flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all border-0 shadow-sm">
                                                        {editingReport ? 'Save Changes' : 'Submit Report'}
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setEditingReport(null);
                                                          setReportForm({ taskId: '', workCompleted: '', challengesFaced: '', attachment: null });
                                                          setActiveSubmitRoadmapId(null);
                                                          if (setErrorMsg) setErrorMsg('');
                                                        }}
                                                        className="!bg-slate-200 hover:!bg-slate-300 !text-slate-700 flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition-all border-0"
                                                      >
                                                        Cancel
                                                      </button>
                                                    </div>
                                                  </form>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-900 p-8 rounded-2xl text-center text-slate-500 text-sm">
            No training roadmap configured. Please contact your supervisor.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
