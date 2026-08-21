import React from 'react';

const DepartmentsTab = ({
  loading,
  handleAssignDept,
  selectedInternId,
  setSelectedInternId,
  interns,
  deptForm,
  setDeptForm,
  departmentOptions = []
}) => {
  return (
    <div className="max-w-lg mx-auto bg-slate-900/20 border border-slate-900/60 rounded-2xl p-8 glass-panel">
      <h3 className="text-xl font-bold text-slate-100 mb-6">Assign Department</h3>
      <form onSubmit={handleAssignDept} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="intern">
            Select Intern
          </label>
          <select
            id="intern"
            required
            className="glass-input cursor-pointer py-2 pl-4 pr-10 text-sm"
            value={selectedInternId}
            onChange={(e) => setSelectedInternId(e.target.value)}
          >
            <option className="bg-slate-950" value="">Select Intern</option>
            {interns.map(intern => (
              <option className="bg-slate-950" key={intern.id} value={intern.id}>
                {intern.firstName} {intern.lastName} ({intern.department || 'No department'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="dept">
            Assign Department
          </label>
          <select
            id="dept"
            className="glass-input cursor-pointer py-2 pl-4 pr-10 text-sm"
            value={deptForm}
            onChange={(e) => setDeptForm(e.target.value)}
          >
            {departmentOptions.map(opt => (
              <option className="bg-slate-950" key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 font-semibold">
          {loading ? 'Assigning...' : 'Assign Department'}
        </button>
      </form>
    </div>
  );
};

export default DepartmentsTab;
