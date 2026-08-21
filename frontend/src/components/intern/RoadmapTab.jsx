import React, { useState } from 'react';
import { formatDepartment } from '../../utils/formatDepartment';
import { ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';

const RoadmapTab = ({ user, roadmaps }) => {
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubModules, setExpandedSubModules] = useState({});

  const toggleModule = (id) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSubModule = (id) => {
    setExpandedSubModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-900/20 border border-slate-900/60 rounded-2xl p-8 glass-panel text-center text-slate-500 text-sm">
        No roadmaps have been configured yet for your department by your supervisor.
      </div>
    );
  }

  const roadmap = roadmaps[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 text-left space-y-3 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h3 className="text-xl font-bold text-slate-100">{roadmap.title}</h3>
          <span className="bg-yellow-300 text-black border border-black/10 text-xs font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider shrink-0 w-fit">
            {formatDepartment(user.department)} Department
          </span>
        </div>
        <p className="text-slate-350 text-xs leading-relaxed font-medium">
          Follow this training curriculum designed by your supervisor. Submit task reports for each practical task under the Reports tab to track your completion progress.
        </p>
      </div>

      {/* Modules List Accordion */}
      <div className="space-y-4">
        {roadmap.modules.map((mod, modIdx) => {
          const hours = mod.subModules.reduce((s, sb) => s + sb.tasks.reduce((st, t) => st + t.durationHours, 0), 0);
          const isExpanded = expandedModules[mod.id] ?? true; // expanded by default

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

              {/* Module Sub-modules & Tasks Content */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-900 bg-slate-950/20 space-y-5 text-left">
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
                                  <p className="text-[12px] text-slate-350 italic mt-1 leading-relaxed">{sub.description}</p>
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

                            {/* Practical Tasks List */}
                            {isSubExpanded && (
                              <div className="pl-4 space-y-2">
                                {sub.tasks.length === 0 ? (
                                  <p className="text-slate-300 text-[10px] italic font-medium">No tasks listed.</p>
                                ) : (
                                  sub.tasks.map((task) => (
                                    <div key={task.id} className="bg-slate-950 border border-slate-500 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                      <div className="space-y-0.5">
                                        <span className="text-slate-200 text-[12px] font-semibold block">{task.title}</span>
                                        {task.description && (
                                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{task.description}</p>
                                        )}
                                      </div>
                                      <span className="flex items-center gap-1 bg-slate-900 border border-slate-600 text-slate-400 text-[12px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 self-start sm:self-center">
                                        <Clock className="h-4 w-4 text-red-500" /> {task.durationHours} hrs
                                      </span>
                                    </div>
                                  ))
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
    </div>
  );
};

export default RoadmapTab;
