import React, { useState } from 'react';
import api from '../../services/api';
import { formatDepartment } from '../../utils/formatDepartment';

const ApplicationsTab = ({
  appFilters,
  setAppFilters,
  applications,
  appPage,
  setAppPage,
  ITEMS_PER_PAGE,
  headerSearch,
  getApplicationStatusClass,
  getDeptBadgeClass,
  setSelectedApp,
  setStatusForm,
  selectedApp,
  statusForm,
  handleUpdateStatus,
  renderPagination,
  loading,
  fetchTabContent,
  departmentOptions = []
}) => {
  const dateVal = statusForm?.interviewDate ? statusForm.interviewDate.split('T')[0] : '';
  const timeVal = statusForm?.interviewDate ? statusForm.interviewDate.split('T')[1]?.slice(0, 5) : '';

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDateChange = (val) => {
    const t = timeVal || '12:00';
    setStatusForm(prev => ({ ...prev, interviewDate: `${val}T${t}` }));
  };

  const handleTimeChange = (val) => {
    const d = dateVal || new Date().toISOString().split('T')[0];
    setStatusForm(prev => ({ ...prev, interviewDate: `${d}T${val}` }));
  };

  const STATUS_ORDER = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'];

  // Compute filtered applications
  const q = headerSearch.trim().toLowerCase();
  const filtered = q
    ? applications.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.preferredDepartment || '').toLowerCase().includes(q) ||
      (a.internshipMode || '').toLowerCase().includes(q)
    )
    : applications;

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} application(s)?`)) return;

    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.post('/applications/delete', { ids: selectedIds });
      setSelectedIds([]);
      if (fetchTabContent) {
        await fetchTabContent();
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete applications.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search name/email..."
          className="glass-input py-2 text-sm"
          value={appFilters.search}
          onChange={(e) => setAppFilters(prev => ({ ...prev, search: e.target.value }))}
        />
        <select
          className="glass-input py-2 text-sm cursor-pointer"
          value={appFilters.status}
          onChange={(e) => setAppFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option className="bg-slate-950" value="">All Statuses</option>
          <option className="bg-slate-950" value="SUBMITTED">Submitted</option>
          <option className="bg-slate-950" value="UNDER_REVIEW">Under Review</option>
          <option className="bg-slate-950" value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option className="bg-slate-950" value="SELECTED">Selected</option>
          <option className="bg-slate-950" value="REJECTED">Rejected</option>
        </select>
        <select
          className="glass-input py-2 text-sm cursor-pointer"
          value={appFilters.preferredDepartment}
          onChange={(e) => setAppFilters(prev => ({ ...prev, preferredDepartment: e.target.value }))}
        >
          <option className="bg-slate-950" value="">All Departments</option>
          {departmentOptions.map(opt => (
            <option className="bg-slate-950" key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="glass-input py-2 text-sm cursor-pointer"
          value={appFilters.internshipMode}
          onChange={(e) => setAppFilters(prev => ({ ...prev, internshipMode: e.target.value }))}
        >
          <option className="bg-slate-950" value="">All Modes</option>
          <option className="bg-slate-950" value="REMOTE">Remote</option>
          <option className="bg-slate-950" value="HYBRID">Hybrid</option>
          <option className="bg-slate-950" value="ON_SITE">On-site</option>
        </select>
      </div>

      {/* Bulk Delete Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm gap-3">
        <div className="text-slate-300 text-xs font-semibold">
          {selectedIds.length > 0 ? `${selectedIds.length} application(s) selected` : 'Select rows below to delete'}
        </div>
        <div className="flex items-center space-x-3">
          {deleteError && (
            <span className="text-red-600 text-xs font-semibold">{deleteError}</span>
          )}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0 || deleteLoading}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 ${selectedIds.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white border border-red-600 active:scale-[0.98]'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            <span>{deleteLoading ? 'Deleting...' : `Delete Applications (${selectedIds.length})`}</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-panel overflow-x-auto border-slate-900 bg-slate-900/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-900">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 bg-white text-red-600 focus:ring-red-500 cursor-pointer h-4 w-4"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 whitespace-nowrap">Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Email</th>
              <th className="px-6 py-4 whitespace-nowrap">Department</th>
              <th className="px-6 py-4 whitespace-nowrap">Mode</th>
              <th className="px-6 py-4 whitespace-nowrap">CV</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {(() => {
              if (filtered.length === 0) return (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">No applications found.</td></tr>
              );
              return filtered.slice((appPage - 1) * ITEMS_PER_PAGE, (appPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/30">
                  <td className="px-6 py-4 whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 bg-white text-red-600 focus:ring-red-500 cursor-pointer h-4 w-4"
                      checked={selectedIds.includes(app.id)}
                      onChange={() => handleSelectOne(app.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200 whitespace-nowrap">{app.firstName} {app.lastName}</td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{app.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3.5 py-1 rounded-md text-xs font-bold border uppercase ${getDeptBadgeClass(app.preferredDepartment)}`}>
                      {formatDepartment(app.preferredDepartment)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{app.internshipMode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`http://localhost:5000/api/applications/download/${app.id}?token=${localStorage.getItem('token')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Download CV</span>
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap uppercase tracking-wider ${getApplicationStatusClass(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {app.status === 'SELECTED' || app.status === 'REJECTED' ? (
                      <span className="text-slate-500 font-semibold text-sm select-none">
                        Finalized
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setStatusForm({ status: app.status, interviewDate: app.interviewDate ? app.interviewDate.slice(0, 16) : '', startDate: '' });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap cursor-pointer transition-colors border border-red-700 shadow-sm inline-block"
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
      {renderPagination(appPage, (() => { const q = headerSearch.trim().toLowerCase(); return q ? applications.filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || (a.preferredDepartment || '').toLowerCase().includes(q) || (a.internshipMode || '').toLowerCase().includes(q)).length : applications.length; })(), setAppPage)}

      {/* Modal for App Status Update */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="glass-panel p-8 w-full max-w-md bg-white border-slate-200 relative flex flex-col max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer btn-icon"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-6 pb-2 border-b border-slate-250 shrink-0">Update Application Status</h3>
            <form onSubmit={(e) => handleUpdateStatus(e, selectedApp.id)} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto pr-2 space-y-6 min-h-0 mb-6 scrollbar-thin">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Applicant Name</label>
                  <input
                    type="text"
                    disabled
                    className="w-full text-black border border-blue-200 rounded-lg px-3 py-2 text-sm font-semibold cursor-not-allowed"
                    style={{ backgroundColor: '#eff6ff', color: '#000000' }}
                    value={`${selectedApp.firstName} ${selectedApp.lastName}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white border border-slate-200 rounded-xl p-4 text-xs" style={{ backgroundColor: '#ffffff' }}>
                  <div className="col-span-2 font-extrabold text-slate-955 uppercase tracking-wider text-xs mb-1">Candidate Profile Info</div>

                  {selectedApp.picture && (
                    <div className="col-span-2 flex items-center space-x-4 border-b border-slate-200 pb-3 mb-1">
                      <img
                        src={`http://localhost:5000/uploads/pictures/${selectedApp.picture}`}
                        alt={`${selectedApp.firstName}'s photo`}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div>
                        <span className="text-slate-700 block font-bold text-[10px] uppercase">Candidate Photograph</span>
                        <a
                          href={`http://localhost:5000/uploads/pictures/${selectedApp.picture}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 hover:underline font-semibold text-[11px]"
                        >
                          Open Full Image &rarr;
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Phone</span>
                    <span className="text-slate-950 text-xs font-semibold">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">CNIC / ID Number</span>
                    <span className="text-slate-950 text-xs font-semibold">{selectedApp.cnic || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Date of Birth</span>
                    <span className="text-slate-955 text-xs font-semibold">
                      {selectedApp.dob ? new Date(selectedApp.dob).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Gender</span>
                    <span className="text-slate-955 text-xs font-semibold capitalize">{selectedApp.gender || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Nationality</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.nationality || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Requested Duration</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.duration ? `${selectedApp.duration} Weeks` : 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Current Education</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.currentEducation || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Institute Name</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.instituteName || 'N/A'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Emergency Contact No.</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.emergencyContact || 'N/A'}</span>
                  </div>

                  <div className="col-span-2 mt-1">
                    <span className="text-slate-700 block font-bold text-[11px] uppercase tracking-wide">Home Address</span>
                    <span className="text-slate-955 text-xs font-semibold">{selectedApp.address || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="status">Application Status</label>
                  <select
                    id="status"
                    className="w-full bg-white text-slate-950 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 cursor-pointer font-bold text-sm focus:outline-none focus:border-red-500 transition-all duration-200"
                    style={{ backgroundColor: '#ffffff', color: '#090d16' }}
                    value={statusForm.status}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="SUBMITTED" disabled={STATUS_ORDER.indexOf('SUBMITTED') < STATUS_ORDER.indexOf(selectedApp.status)}>Submitted</option>
                    <option value="UNDER_REVIEW" disabled={STATUS_ORDER.indexOf('UNDER_REVIEW') < STATUS_ORDER.indexOf(selectedApp.status)}>Under Review</option>
                    <option value="INTERVIEW_SCHEDULED" disabled={STATUS_ORDER.indexOf('INTERVIEW_SCHEDULED') < STATUS_ORDER.indexOf(selectedApp.status)}>Interview Scheduled</option>
                    <option value="SELECTED" disabled={STATUS_ORDER.indexOf('SELECTED') < STATUS_ORDER.indexOf(selectedApp.status)}>Selected</option>
                    <option value="REJECTED" disabled={STATUS_ORDER.indexOf('REJECTED') < STATUS_ORDER.indexOf(selectedApp.status)}>Rejected</option>
                  </select>
                </div>

                {statusForm.status === 'INTERVIEW_SCHEDULED' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="interviewDateOnly">Interview Date</label>
                      <input
                        id="interviewDateOnly"
                        type="date"
                        required
                        className="w-full bg-white text-slate-955 border border-slate-300 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-red-500 transition-all duration-200"
                        style={{ backgroundColor: '#ffffff', color: '#090d16' }}
                        value={dateVal}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="interviewTimeOnly">Interview Time</label>
                      <input
                        id="interviewTimeOnly"
                        type="time"
                        required
                        className="w-full bg-white text-slate-955 border border-slate-300 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-red-500 transition-all duration-200"
                        style={{ backgroundColor: '#ffffff', color: '#090d16' }}
                        value={timeVal}
                        onChange={(e) => handleTimeChange(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {statusForm.status === 'SELECTED' && (
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="startDate">Internship Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white text-slate-955 border border-slate-300 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#090d16' }}
                      value={statusForm.startDate || ''}
                      onChange={(e) => setStatusForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white border border-red-650 flex-1 py-3 text-sm font-bold rounded-xl cursor-pointer transition-colors text-center"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-600 flex-1 py-3 text-sm font-bold rounded-xl cursor-pointer transition-colors text-center"
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
};

export default ApplicationsTab;
