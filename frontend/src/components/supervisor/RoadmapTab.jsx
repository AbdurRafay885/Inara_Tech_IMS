import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Clock, BookOpen, Layers, CheckSquare, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDuration } from '../../utils/formatDuration';
import { formatDepartment } from '../../utils/formatDepartment';

const RoadmapTab = ({
  handleUploadRoadmap,
  loading,
  roadmaps,
  handleDeleteRoadmap,
  user,
  searchQuery
}) => {
  const [modules, setModules] = useState([]);
  const [loadedRoadmapId, setLoadedRoadmapId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSubModules, setExpandedSubModules] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const getFilteredModules = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return modules.map((mod, modIdx) => ({
        ...mod,
        originalIndex: modIdx,
        subModules: mod.subModules.map((sub, subIdx) => ({
          ...sub,
          originalIndex: subIdx,
          tasks: sub.tasks.map((task, taskIdx) => ({
            ...task,
            originalIndex: taskIdx
          }))
        }))
      }));
    }

    return modules
      .map((mod, modIdx) => {
        const modTitleMatch = mod.title.toLowerCase().includes(query);

        const filteredSubModules = mod.subModules
          .map((sub, subIdx) => {
            const subTitleMatch = sub.title.toLowerCase().includes(query);
            const subDescMatch = sub.description?.toLowerCase().includes(query);

            const filteredTasks = sub.tasks
              .map((task, taskIdx) => ({ ...task, originalIndex: taskIdx }))
              .filter(
                (task) =>
                  task.title.toLowerCase().includes(query) ||
                  task.description?.toLowerCase().includes(query)
              );

            const hasMatchingTasks = filteredTasks.length > 0;

            if (subTitleMatch || subDescMatch || hasMatchingTasks) {
              return {
                ...sub,
                originalIndex: subIdx,
                tasks: subTitleMatch || subDescMatch
                  ? sub.tasks.map((task, taskIdx) => ({ ...task, originalIndex: taskIdx }))
                  : filteredTasks
              };
            }
            return null;
          })
          .filter(Boolean);

        const hasMatchingSubModules = filteredSubModules.length > 0;

        if (modTitleMatch || hasMatchingSubModules) {
          return {
            ...mod,
            originalIndex: modIdx,
            subModules: modTitleMatch
              ? mod.subModules.map((sub, subIdx) => ({
                  ...sub,
                  originalIndex: subIdx,
                  tasks: sub.tasks.map((task, taskIdx) => ({ ...task, originalIndex: taskIdx }))
                }))
              : filteredSubModules
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const getFilteredRoadmapModules = (roadmapModules) => {
    if (!roadmapModules) return [];
    if (!searchQuery.trim()) return roadmapModules;

    const query = searchQuery.toLowerCase().trim();

    return roadmapModules
      .map((mod) => {
        const modTitleMatch = mod.title.toLowerCase().includes(query);

        const filteredSubModules = mod.subModules
          .map((sub) => {
            const subTitleMatch = sub.title.toLowerCase().includes(query);
            const subDescMatch = sub.description?.toLowerCase().includes(query);

            const filteredTasks = sub.tasks.filter(
              (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
            );

            if (subTitleMatch || subDescMatch || filteredTasks.length > 0) {
              return {
                ...sub,
                tasks: subTitleMatch || subDescMatch ? sub.tasks : filteredTasks
              };
            }
            return null;
          })
          .filter(Boolean);

        if (modTitleMatch || filteredSubModules.length > 0) {
          return {
            ...mod,
            subModules: modTitleMatch ? mod.subModules : filteredSubModules
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredModules = getFilteredModules();

  const activeRoadmapId = roadmaps && roadmaps.length > 0 ? roadmaps[0].id : null;

  // Load existing roadmap modules if they exist or if the active ID changes
  useEffect(() => {
    if (activeRoadmapId !== loadedRoadmapId) {
      if (roadmaps && roadmaps.length > 0) {
        const active = roadmaps[0];
        setModules(active.modules.map(mod => ({
          title: mod.title,
          subModules: mod.subModules.map(sub => ({
            title: sub.title,
            description: sub.description || '',
            tasks: sub.tasks.map(task => ({
              title: task.title,
              description: task.description || '',
              durationHours: task.durationHours || 0
            }))
          }))
        })));
      } else {
        setModules([]);
      }
      setLoadedRoadmapId(activeRoadmapId);
    }
  }, [roadmaps, activeRoadmapId, loadedRoadmapId]);

  const getSubmoduleHours = (sub) => {
    return sub.tasks.reduce((sum, t) => sum + (parseInt(t.durationHours, 10) || 0), 0);
  };

  const getModuleHours = (mod) => {
    return mod.subModules.reduce((sum, s) => sum + getSubmoduleHours(s), 0);
  };

  const toggleModule = (idx) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleSubModule = (modIdx, subIdx) => {
    const key = `${modIdx}-${subIdx}`;
    setExpandedSubModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addModule = () => {
    setModules([...modules, {
      title: `Module ${modules.length + 1}`,
      subModules: []
    }]);
    setIsEditing(true);
  };

  const deleteModule = (modIdx) => {
    const filtered = modules.filter((_, idx) => idx !== modIdx);
    setModules(filtered);
  };

  const updateModuleTitle = (modIdx, val) => {
    const updated = [...modules];
    updated[modIdx].title = val;
    setModules(updated);
  };

  const addSubmodule = (modIdx) => {
    const updated = [...modules];
    updated[modIdx].subModules.push({
      title: '',
      description: '',
      tasks: []
    });
    setModules(updated);
  };

  const deleteSubmodule = (modIdx, subIdx) => {
    const updated = [...modules];
    updated[modIdx].subModules = updated[modIdx].subModules.filter((_, idx) => idx !== subIdx);
    setModules(updated);
  };

  const updateSubmodule = (modIdx, subIdx, field, val) => {
    const updated = [...modules];
    updated[modIdx].subModules[subIdx][field] = val;
    setModules(updated);
  };

  const addTask = (modIdx, subIdx) => {
    const updated = [...modules];
    updated[modIdx].subModules[subIdx].tasks.push({
      title: '',
      description: '',
      durationHours: 8
    });
    setModules(updated);
  };

  const deleteTask = (modIdx, subIdx, taskIdx) => {
    const updated = [...modules];
    updated[modIdx].subModules[subIdx].tasks = updated[modIdx].subModules[subIdx].tasks.filter((_, idx) => idx !== taskIdx);
    setModules(updated);
  };

  const updateTask = (modIdx, subIdx, taskIdx, field, val) => {
    const updated = [...modules];
    if (field === 'durationHours') {
      const intVal = parseInt(val, 10);
      updated[modIdx].subModules[subIdx].tasks[taskIdx][field] = isNaN(intVal) ? 0 : intVal;
    } else {
      updated[modIdx].subModules[subIdx].tasks[taskIdx][field] = val;
    }
    setModules(updated);
  };

  const onSave = async (e) => {
    e.preventDefault();
    const resolvedTitle = `${formatDepartment(user?.department)} Training Roadmap`;
    try {
      await handleUploadRoadmap(resolvedTitle, modules);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const departmentLabel = formatDepartment(user?.department);

  return (
    <div className="w-full space-y-6">
      {/* Header Title Card */}
      <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl">
        <div>
          <h4 className="text-xl font-bold text-slate-100">{departmentLabel} Training Roadmap</h4>
          <p className="text-xs text-slate-400 mt-1">Configure curriculum modules, sub-modules, and practical tasks vertically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="bg-white border border-black/40 hover:bg-red-50 text-slate-955 text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shrink-0"
          >
            <Eye className="h-4 w-4 text-red-500" /> Preview Curriculum
          </button>
          {roadmaps && roadmaps.length > 0 && (
            <button
              type="button"
              onClick={() => handleDeleteRoadmap(roadmaps[0].id)}
              className="bg-red-600 hover:bg-red-700 text-white border-0 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm shrink-0"
            >
              Reset Roadmap
            </button>
          )}
        </div>
      </div>

      {/* Full-width Editor */}
      <form onSubmit={onSave} className="space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border-0"
              >
                <Save className="h-4 w-4" /> Save Roadmap
              </button>
              <button
                type="button"
                onClick={addModule}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border-0"
              >
                <Plus className="h-4 w-4" /> Add Module
              </button>
              <button
                type="button"
                onClick={() => {
                  if (roadmaps && roadmaps.length > 0) {
                    const active = roadmaps[0];
                    setModules(active.modules.map(mod => ({
                      title: mod.title,
                      subModules: mod.subModules.map(sub => ({
                        title: sub.title,
                        description: sub.description || '',
                        tasks: sub.tasks.map(task => ({
                          title: task.title,
                          description: task.description || '',
                          durationHours: task.durationHours || 0
                        }))
                      }))
                    })));
                  } else {
                    setModules([]);
                  }
                  setIsEditing(false);
                }}
                className="bg-white border border-red-600 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider px-4 py-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border-0"
            >
              <Layers className="h-4 w-4 text-white" /> Edit Roadmap
            </button>
          )}
        </div>

        <div className="space-y-6">
          {modules.length === 0 ? (
            <div className="glass-panel p-8 border-slate-900 bg-slate-900/10 rounded-2xl text-center text-slate-500 space-y-3">
              <p className="text-sm font-medium">No modules added yet. Start building your department roadmap.</p>
              <button
                type="button"
                onClick={addModule}
                className="mx-auto bg-white border border-red-600 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="h-4 w-4 text-red-600" /> Add First Module
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredModules.map((mod) => {
                const modIdx = mod.originalIndex;
                const moduleHours = getModuleHours(mod);
                const isExpanded = expandedModules[modIdx] ?? true; // expanded by default
                return (
                  <div key={modIdx} className="bg-slate-955/60 border border-red-500 rounded-2xl overflow-hidden shadow-sm mb-6 text-left">
                    {/* Module Header Bar */}
                    <div
                      role="button"
                      onClick={() => toggleModule(modIdx)}
                      className="w-full flex justify-between items-center p-5 text-left bg-rose-100/90 hover:bg-rose-200/95 transition-all border-b border-rose-200 focus:outline-none cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-rose-200/60 text-rose-800 p-2 rounded-xl border border-rose-300/80 shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 pr-4" onClick={(e) => e.stopPropagation()}>
                          <span className="text-black text-sm font-black shrink-0">Module {modIdx + 1}:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              required
                              placeholder="Module Title (e.g. Node.js Basics)"
                              className="flex-1 bg-white text-black border border-slate-400 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:border-red-500 transition-all w-full"
                              value={mod.title}
                              onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                            />
                          ) : (
                            <span className="text-black text-sm font-bold py-1.5 leading-relaxed">{mod.title || 'Untitled Module'}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="bg-white/90 text-rose-850 border border-black text-[12px] px-2.5 py-1 rounded-lg font-black">
                          {formatDuration(moduleHours)}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteModule(modIdx);
                            }}
                            className="bg-red-650/10 border border-red-900/20 hover:bg-red-650/20 text-red-700 p-2 rounded-xl transition-all cursor-pointer"
                            title="Delete Module"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-rose-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-rose-600" />
                        )}
                      </div>
                    </div>

                    {/* Module Sub-modules & Tasks Content */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-900 bg-slate-955/20 space-y-5 text-left">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-slate-400" /> Sub-modules ({mod.subModules.length})
                          </span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => addSubmodule(modIdx)}
                              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Plus className="h-3 w-3" /> Add Sub-module
                            </button>
                          )}
                        </div>

                        {mod.subModules.length === 0 ? (
                          <p className="text-slate-300 text-xs italic">No sub-modules added yet.</p>
                        ) : (
                          <div className="space-y-6">
                            {mod.subModules.map((sub) => {
                              const subIdx = sub.originalIndex;
                              const isSubExpanded = expandedSubModules[`${modIdx}-${subIdx}`] ?? true;
                              const subHours = getSubmoduleHours(sub);
                              return (
                                <div key={subIdx} className="bg-slate-955 border border-slate-900 p-5 rounded-2xl space-y-4">
                                  {/* Sub-module Header */}
                                  <div
                                    role="button"
                                    onClick={() => toggleSubModule(modIdx, subIdx)}
                                    className="flex justify-between items-center cursor-pointer select-none pb-2 border-b border-slate-900 hover:bg-slate-900/5 px-1 rounded gap-4"
                                  >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                                      {isEditing ? (
                                        <>
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-100 text-sm font-extrabold shrink-0">{modIdx + 1}.{subIdx + 1}</span>
                                            <input
                                              type="text"
                                              required
                                              placeholder="Sub-module Title"
                                              className="w-full bg-white text-black border border-slate-400 rounded-lg px-2.5 py-1.5 text-sm font-semibold focus:outline-none"
                                              value={sub.title}
                                              onChange={(e) => updateSubmodule(modIdx, subIdx, 'title', e.target.value)}
                                            />
                                          </div>
                                          <input
                                            type="text"
                                            placeholder="Description/Concept summary"
                                            className="w-full bg-white text-black border border-slate-400 rounded-lg px-2.5 py-1.5 text-sm font-semibold focus:outline-none"
                                            value={sub.description}
                                            onChange={(e) => updateSubmodule(modIdx, subIdx, 'description', e.target.value)}
                                          />
                                        </>
                                      ) : (
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 py-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-100 text-sm font-extrabold shrink-0">{modIdx + 1}.{subIdx + 1}</span>
                                            <span className="text-slate-100 text-sm font-semibold">{sub.title || 'Untitled Sub-module'}</span>
                                          </div>
                                          {sub.description && (
                                            <span className="text-slate-300 text-xs italic font-normal ml-0 md:ml-4 leading-relaxed">{sub.description}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="flex items-center gap-1 bg-slate-900 border border-slate-600 text-slate-400 text-[12px] font-mono px-2 py-0.5 rounded-md font-bold">
                                        <Clock className="h-4 w-4 text-red-500" /> {formatDuration(subHours)}
                                      </span>
                                      {isEditing && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSubmodule(modIdx, subIdx);
                                          }}
                                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg cursor-pointer transition-all border-0 bg-transparent"
                                          title="Delete Sub-module"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                      {isSubExpanded ? (
                                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Practical Tasks List */}
                                  {isSubExpanded && (
                                    <div className="pl-4 border-l border-slate-800 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                          <CheckSquare className="h-3.5 w-3.5" /> Practical Tasks
                                        </span>
                                        {isEditing && (
                                          <button
                                            type="button"
                                            onClick={() => addTask(modIdx, subIdx)}
                                            className="text-red-500 hover:text-red-650 text-[11px] font-extrabold flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                                          >
                                            <Plus className="h-3 w-3" /> Add Task
                                          </button>
                                        )}
                                      </div>

                                      {sub.tasks.length === 0 ? (
                                        <p className="text-slate-355 text-[10px] italic font-medium">No tasks added yet.</p>
                                      ) : (
                                        <div className="space-y-2.5">
                                          {sub.tasks.map((task) => {
                                            const taskIdx = task.originalIndex;
                                            return (
                                              <div key={taskIdx}>
                                                {isEditing ? (
                                                  <div className="bg-slate-955 border border-slate-500 p-3 rounded-xl flex flex-col md:flex-row items-center gap-3">
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                                                      <input
                                                        type="text"
                                                        required
                                                        placeholder="Task Title"
                                                        className="w-full bg-white text-black border border-slate-400 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none font-bold"
                                                        value={task.title}
                                                        onChange={(e) => updateTask(modIdx, subIdx, taskIdx, 'title', e.target.value)}
                                                      />
                                                      <input
                                                        type="text"
                                                        placeholder="Task details/challenges"
                                                        className="w-full bg-white text-black border border-slate-400 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none"
                                                        value={task.description}
                                                        onChange={(e) => updateTask(modIdx, subIdx, taskIdx, 'description', e.target.value)}
                                                      />
                                                      <div className="flex items-center gap-1.5">
                                                        <input
                                                          type="number"
                                                          required
                                                          min="1"
                                                          placeholder="Hours"
                                                          className="w-16 bg-white text-black border border-slate-400 rounded-lg px-2 py-1.5 text-sm focus:outline-none text-center font-bold"
                                                          value={task.durationHours || ''}
                                                          onChange={(e) => updateTask(modIdx, subIdx, taskIdx, 'durationHours', e.target.value)}
                                                        />
                                                        <span className="text-xs text-slate-400 font-mono font-bold">hours</span>
                                                      </div>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => deleteTask(modIdx, subIdx, taskIdx)}
                                                      className="text-slate-400 hover:text-red-500 p-1 rounded cursor-pointer transition-all border-0 bg-transparent mt-1 md:mt-0"
                                                      title="Delete Task"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div className="bg-slate-955/40 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                                        <span className="text-slate-200 text-sm font-bold truncate">{task.title || 'Untitled Task'}</span>
                                                      </div>
                                                      {task.description && (
                                                        <p className="text-xs text-slate-455 mt-1 pl-3.5 leading-relaxed">{task.description}</p>
                                                      )}
                                                    </div>
                                                    <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 text-xs px-2.5 py-1 rounded-lg font-mono font-semibold shrink-0">
                                                      {task.durationHours || 0} hrs
                                                    </span>
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
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </form>

      {/* Modal dialog for Active Curriculum Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-955/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-black p-6 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh] shadow-xl text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <h4 className="text-lg font-bold text-slate-100">Active Curriculum Preview</h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-455 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 mt-4 pr-1 space-y-4">
              {roadmaps.length === 0 ? (
                <p className="text-slate-500 text-xs py-6 text-center">No active roadmap configured. Create and save one first.</p>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="text-blue-700 font-extrabold text-sm uppercase tracking-wider block">{roadmaps[0].title}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Last updated: {new Date(roadmaps[0].updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-4">
                    {getFilteredRoadmapModules(roadmaps[0].modules).map((mod, modIdx) => {
                      const hours = mod.subModules.reduce((s, sb) => s + sb.tasks.reduce((st, t) => st + t.durationHours, 0), 0);
                      return (
                        <div key={mod.id} className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2 gap-2">
                            <span className="text-slate-200 text-xs font-extrabold uppercase tracking-wide block truncate">{modIdx + 1}. {mod.title}</span>
                            <span className="bg-yellow-300 text-black border border-yellow-400 text-[9px] px-2 py-0.5 rounded font-black shrink-0">
                              {formatDuration(hours)}
                            </span>
                          </div>

                          {mod.subModules.length > 0 && (
                            <div className="pl-3 border-l border-slate-900 space-y-4 -mt-3 pt-3">
                              {mod.subModules.map((sub, subIdx) => {
                                const subHours = sub.tasks.reduce((st, t) => st + t.durationHours, 0);
                                return (
                                  <div key={sub.id} className="space-y-2">
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="text-slate-355 text-xs font-bold block truncate">{modIdx + 1}.{subIdx + 1} {sub.title}</span>
                                      <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[9px] px-2 py-0.5 rounded font-black shrink-0">
                                        {formatDuration(subHours)}
                                      </span>
                                    </div>
                                    {sub.description && (
                                      <p className="text-[10px] text-slate-500 italic leading-relaxed">{sub.description}</p>
                                    )}

                                    <div className="pl-3 space-y-1.5">
                                      {sub.tasks.map((task) => (
                                        <div key={task.id} className="flex justify-between items-center text-[10px] gap-2">
                                          <span className="text-slate-455 font-medium truncate">-{task.title}</span>
                                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] px-2 py-0.5 rounded font-semibold shrink-0 font-mono">
                                            {task.durationHours} hrs
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapTab;
