import React, { useState } from 'react';
import { Download, ExternalLink, X } from 'lucide-react';

const ProjectsTab = ({
  handleCreateProject,
  projectForm,
  setProjectForm,
  memberToAddId,
  setMemberToAddId,
  interns,
  membersToAdd,
  setMembersToAdd,
  handleAddMembers,
  handleAssignTask,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  taskForm,
  setTaskForm,
  membersModalProject,
  setMembersModalProject
}) => {
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const filteredProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
    (proj.description && proj.description.toLowerCase().includes(projectSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Create Project Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Create New Project</h4>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="name">Project Name</label>
              <input id="name" type="text" required className="glass-input py-2 text-sm" placeholder="e.g. Chat Application" value={projectForm.name} onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="description">Description</label>
              <textarea id="description" className="glass-input py-2 text-sm resize-none" placeholder="Details of the project..." rows="3" value={projectForm.description} onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
            </div>
            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-1">Helping/Reference Material (PDF - Optional)</label>
              <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-xl px-4 py-3 text-center hover:border-cyan-500/50 transition-all duration-200 relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setProjectForm(prev => ({ ...prev, referenceFile: e.target.files[0] }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {projectForm.referenceFile ? (
                  <span className="text-cyan-400 text-xs truncate block">{projectForm.referenceFile.name}</span>
                ) : (
                  <span className="text-slate-500 text-xs">Choose PDF file</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
              <h5 className="text-sm font-bold text-slate-100">Add Members</h5>
              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="memberIds">Select Members (Interns)</label>
                <select
                  id="memberIds"
                  className="glass-input py-2 text-sm cursor-pointer"
                  value={memberToAddId}
                  onChange={(e) => setMemberToAddId(e.target.value)}
                >
                  <option className="bg-slate-950" value="">Choose Intern</option>
                  {interns.map((intern) => (
                    <option className="bg-slate-950" key={intern.id} value={intern.id}>{intern.firstName} {intern.lastName}</option>
                  ))}
                </select>
              </div>

              {membersToAdd.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 pb-1">
                  {membersToAdd.map((memberId) => {
                    const intern = interns.find(i => i.id === memberId);
                    if (!intern) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-red-500 border border-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                      >
                        <span>{intern.firstName} {intern.lastName}</span>
                        <button
                          type="button"
                          onClick={() => setMembersToAdd(prev => prev.filter(id => id !== memberId))}
                          className="text-red-500 hover:text-red-700 cursor-pointer p-0.5 rounded-full hover:bg-red-500/10 transition-colors inline-flex items-center justify-center focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-[11px] text-slate-400">Selected members: {membersToAdd.length}</p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddMembers}
                  className="btn-secondary py-2 px-4 text-xs rounded-lg text-cyan-400 font-semibold whitespace-nowrap"
                >
                  Add Members
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary w-full py-2.5 text-sm font-semibold rounded-lg">Create Project</button>
            </div>
          </form>
        </div>

        {/* Assign Tasks Panel */}
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30 lg:col-span-2">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Assign Project Task</h4>
          <form onSubmit={handleAssignTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="projId">Select Project</label>
                <select
                  id="projId"
                  required
                  className="glass-input py-2 text-sm cursor-pointer"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                  }}
                >
                  <option className="bg-slate-950" value="">Choose Project</option>
                  {projects.map(proj => (
                    <option className="bg-slate-950" key={proj.id} value={proj.id}>{proj.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="assignedToId">Assign Member (Intern)</label>
                <select
                  id="assignedToId"
                  className="glass-input py-2 text-sm cursor-pointer"
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, assignedToId: e.target.value }))}
                >
                  <option className="bg-slate-950" value="">Select Member</option>
                  {interns.map(intern => (
                    <option className="bg-slate-950" key={intern.id} value={intern.id}>{intern.firstName} {intern.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="title">Task Title</label>
              <input id="title" type="text" required className="glass-input py-2 text-sm" placeholder="Develop authentication flow" value={taskForm.title} onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="dueDate">Due Date</label>
                <input id="dueDate" type="date" className="glass-input py-2 text-sm" value={taskForm.dueDate} onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="dueTime">Due Time</label>
                <input
                  id="dueTime"
                  type="time"
                  className="glass-input py-2 text-sm"
                  value={taskForm.dueTime}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, dueTime: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-200 text-xs font-semibold mb-1" htmlFor="taskDesc">Task Description</label>
              <textarea id="taskDesc" className="glass-input py-2 text-sm resize-none" placeholder="Task requirements..." rows="2" value={taskForm.description} onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary py-2.5 text-sm font-semibold rounded-lg px-8">Assign Task</button>
            </div>
          </form>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-b border-slate-900 pb-4">
          <h4 className="text-lg font-bold text-slate-100">Project Workspace Overview</h4>
          <input
            type="text"
            placeholder="Search projects by name..."
            className="glass-input py-2 text-sm w-full sm:max-w-xs"
            value={projectSearchQuery}
            onChange={(e) => setProjectSearchQuery(e.target.value)}
          />
        </div>
        {filteredProjects.length === 0 ? (
          <p className="text-slate-500 text-center py-6">No matching projects found.</p>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((proj) => (
              <div key={proj.id} className="glass-panel p-6 border-slate-900 bg-slate-900/30">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start pb-4 border-b border-slate-900 mb-4 gap-2">
                  <div>
                    <h4 className="text-slate-100 font-bold text-lg">{proj.name}</h4>
                    <p className="text-slate-400 text-sm mt-1">{proj.description}</p>
                    {proj.referenceFile && (
                      <div className="mt-2.5">
                        <a
                          href={`http://localhost:5000/api/projects/download-reference/${proj.id}?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5 text-red-600" />
                          <span>Download Project Description ({proj.name}.pdf)</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setMembersModalProject(proj)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                  >
                    View Members
                  </button>
                </div>

                {/* Project Tasks */}
                <div className="space-y-4">
                  <div className="font-semibold text-slate-300 text-xs mb-2 uppercase tracking-wider">Project Tasks & Deliverables</div>
                  {proj.tasks.length === 0 ? (
                    <span className="text-slate-500 text-xs">No tasks assigned to this project yet.</span>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {proj.tasks.map((task) => (
                        <div key={task.id} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-slate-200 font-bold text-sm">{task.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' : task.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-400 border-blue-800/20' : 'bg-slate-900 text-slate-400 border-slate-800/20'}`}>
                                {task.status}
                              </span>
                            </div>
                            <p className="text-slate-700 text-xs mb-3">{task.description}</p>
                            {task.assignedTo && (
                              <p className="text-slate-750 text-xs mb-3">Assigned to: <span className="text-slate-900 font-semibold">{task.assignedTo.firstName} {task.assignedTo.lastName}</span></p>
                            )}
                          </div>
                          <div className="border-t border-slate-900 pt-3 mt-3 flex justify-between items-center text-xs">
                            <span className="text-slate-750 font-semibold">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                            <div className="flex flex-col gap-1 items-end">
                              {task.deliverable && (
                                <a
                                  href={`http://localhost:5000/api/projects/tasks/download/${task.id}?token=${localStorage.getItem('token')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Download className="h-3.5 w-3.5 text-red-600" />
                                  <span>Download Deliverable File</span>
                                </a>
                              )}
                              {task.deliverableLink && (
                                <a
                                  href={task.deliverableLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-red-600" />
                                  <span>View Deliverable Link</span>
                                </a>
                              )}
                              {!task.deliverable && !task.deliverableLink && (
                                <span className="text-slate-750 font-semibold">No deliverable yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {membersModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 className="text-sm font-extrabold text-black uppercase tracking-wider">
                {membersModalProject.name} - Members
              </h5>
              <button
                type="button"
                onClick={() => setMembersModalProject(null)}
                className="rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            {membersModalProject.members && membersModalProject.members.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {membersModalProject.members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-200">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No members added to this project yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
