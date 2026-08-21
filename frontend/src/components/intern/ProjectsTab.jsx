import React, { useState } from 'react';
import { Download, Link } from 'lucide-react';

const ProjectsTab = ({
  user,
  assignedProjects,
  selectedTaskId,
  setSelectedTaskId,
  deliverableFile,
  setDeliverableFile,
  deliverableLink,
  setDeliverableLink,
  isDeliverableModalOpen,
  setIsDeliverableModalOpen,
  handleUploadDeliverable,
  handleUpdateTaskStatus,
  errorMsg
}) => {
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const filteredProjects = assignedProjects.filter(proj => 
    proj.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    (proj.description && proj.description.toLowerCase().includes(projectSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-6">
        {/* Header containing search bar on left and upload button on right */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pb-4 border-b border-slate-900 w-full">
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search projects..."
              className="glass-input py-2 text-sm w-full"
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={() => setIsDeliverableModalOpen(true)}
              className="btn-primary px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer whitespace-nowrap"
            >
              + Upload Project Deliverable
            </button>
          </div>
        </div>

        {isDeliverableModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-sm font-extrabold text-black uppercase tracking-wider pb-2 border-b border-slate-800">Upload Project Deliverable</h4>
              {errorMsg && (
                <div className="app-error-alert rounded-xl p-3.5 text-xs font-semibold flex items-center space-x-2 shadow-sm">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleUploadDeliverable} className="space-y-4">
                <div>
                  <label className="block text-black font-extrabold text-xs uppercase tracking-wider mb-1.5" htmlFor="taskId">Select Assigned Task</label>
                  <select
                    id="taskId"
                    required
                    className="glass-input py-2 pl-4 pr-10 text-sm cursor-pointer"
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                  >
                    <option className="bg-slate-950" value="">Choose Task</option>
                    {assignedProjects.flatMap(proj => proj.tasks).filter(task => task.assignedToId === user.id && task.status !== 'COMPLETED').map(task => (
                      <option className="bg-slate-950" key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-black font-extrabold text-xs uppercase tracking-wider mb-1.5">Select Deliverable File (PDF - Optional)</label>
                  <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-xl px-4 py-6 text-center hover:border-cyan-500/50 transition-all duration-200 relative cursor-pointer">
                    <input
                      type="file"
                      onChange={(e) => setDeliverableFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {deliverableFile ? (
                      <span className="text-cyan-400 text-xs truncate block">{deliverableFile.name}</span>
                    ) : (
                      <span className="text-slate-500 text-xs">Choose PDF file</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-black font-extrabold text-xs uppercase tracking-wider mb-1.5" htmlFor="deliverableLink">Project URL / GitHub Link (Optional)</label>
                  <input
                    id="deliverableLink"
                    type="url"
                    className="glass-input py-2 text-sm"
                    placeholder="https://github.com/..."
                    value={deliverableLink}
                    onChange={(e) => setDeliverableLink(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3 pt-4 border-t border-slate-800">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-lg cursor-pointer">Upload Deliverable</button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliverableFile(null);
                      setDeliverableLink('');
                      setSelectedTaskId('');
                      setIsDeliverableModalOpen(false);
                    }}
                    className="btn-secondary flex-1 py-2.5 text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>

        {/* Projects List */}
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 space-y-6 w-full">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Assigned Projects & Tasks</h4>
          {assignedProjects.length === 0 ? (
            <p className="text-slate-500 text-xs">No projects assigned yet.</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-slate-500 text-xs">No matching projects found.</p>
          ) : (
            <div className="space-y-6">
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="bg-slate-950/40 p-5 rounded-xl border border-slate-900 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-slate-400 text-xs uppercase tracking-wider block font-extrabold">PROJECT</span>
                    <h5 className="text-black font-extrabold text-lg mt-1">{proj.name}</h5>
                    <p className="text-slate-200 text-sm mt-2">{proj.description}</p>
                    {proj.referenceFile && (
                      <div className="mt-3">
                        <a
                          href={`http://localhost:5000/api/projects/download-reference/${proj.id}?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-600 font-bold inline-flex items-center gap-2 text-xs uppercase tracking-wider"
                        >
                          <Download className="h-4 w-4 text-red-500" />
                          Download Project Description
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Tasks assigned specifically to the user */}
                  <div className="space-y-4">
                    <span className="text-slate-400 text-xs uppercase tracking-wider block font-extrabold">MY TASKS</span>
                    {proj.tasks.filter(t => t.assignedToId === user.id).length === 0 ? (
                      <span className="text-slate-500 text-xs">No tasks assigned to you on this project.</span>
                    ) : (
                      proj.tasks.filter(t => t.assignedToId === user.id).map((task) => (
                        <div key={task.id} className="bg-slate-950 p-5 rounded-xl border border-slate-900 flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 w-full">
                          <div>
                            <h6 className="font-extrabold text-black text-sm">{task.title}</h6>
                            <p className="text-slate-300 text-xs mt-1.5 font-medium">Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p>
                          </div>
                          <div className="flex items-center space-x-8 shrink-0">
                            {task.status !== 'COMPLETED' ? (
                              <select
                                className="glass-input py-1.5 pl-3 pr-10 text-xs bg-slate-950 w-32 cursor-pointer font-bold rounded-md"
                                value={task.status}
                                onChange={(e) => {
                                  if (e.target.value === 'COMPLETED') {
                                    setSelectedTaskId(task.id);
                                    setIsDeliverableModalOpen(true);
                                  } else {
                                    handleUpdateTaskStatus(task.id, e.target.value);
                                  }
                                }}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            ) : (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/20 px-3.5 py-1.5 rounded-md text-xs font-bold shrink-0">
                                Completed
                              </span>
                            )}
                            <div className="flex flex-col gap-2 items-end">
                              {task.deliverable && (
                                <a
                                  href={`http://localhost:5000/api/projects/tasks/download/${task.id}?token=${localStorage.getItem('token')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:text-red-600 text-xs font-bold hover:underline inline-flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                                >
                                  <Download className="h-4 w-4 text-red-500" />
                                  View Deliverable File
                                </a>
                              )}
                              {task.deliverableLink && (
                                <a
                                  href={task.deliverableLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:text-red-600 text-xs font-bold hover:underline inline-flex items-center gap-2 uppercase tracking-wider cursor-pointer"
                                >
                                  <Link className="h-4 w-4 text-red-500" />
                                  View Deliverable Link
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default ProjectsTab;
