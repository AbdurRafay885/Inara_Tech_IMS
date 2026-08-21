import React from 'react';
import { formatDepartment } from '../../utils/formatDepartment';

const InternsTab = ({
  internPage,
  setInternPage,
  allInterns,
  headerSearch,
  ITEMS_PER_PAGE,
  getDeptBadgeClass,
  handleOpenInternProfile,
  renderPagination
}) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel overflow-x-auto border-slate-900 bg-slate-900/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-900">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Avatar</th>
              <th className="px-6 py-4 whitespace-nowrap">Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Email</th>
              <th className="px-6 py-4 whitespace-nowrap">Department</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {(() => {
              const q = headerSearch.trim().toLowerCase();
              const active = allInterns.filter(i => i.isActive);
              const filtered = q
                ? active.filter(i =>
                  `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) ||
                  i.email.toLowerCase().includes(q) ||
                  (i.department || '').toLowerCase().includes(q)
                )
                : active;
              if (filtered.length === 0) return (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No active interns registered yet.</td></tr>
              );
              return filtered.slice((internPage - 1) * ITEMS_PER_PAGE, (internPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE).map((intern) => (
                <tr
                  key={intern.id}
                  className="hover:bg-slate-900/30 cursor-pointer"
                  onClick={() => handleOpenInternProfile(intern)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0">
                      {intern.application?.picture ? (
                        <img
                          src={`http://localhost:5000/uploads/pictures/${intern.application.picture}`}
                          alt={`${intern.firstName} ${intern.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 uppercase font-bold">
                          {intern.firstName[0]}{intern.lastName[0]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-200 whitespace-nowrap">{intern.firstName} {intern.lastName}</td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{intern.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3.5 py-1 rounded-md text-xs font-bold border uppercase ${getDeptBadgeClass(intern.department)}`}>
                      {formatDepartment(intern.department)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3.5 py-1 rounded-md text-xs font-bold border bg-emerald-950 text-emerald-400 border-emerald-800/20 shrink-0">
                      Active
                    </span>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
      {renderPagination(internPage, (() => { const q = headerSearch.trim().toLowerCase(); const active = allInterns.filter(i => i.isActive); return q ? active.filter(i => `${i.firstName} ${i.lastName}`.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || (i.department || '').toLowerCase().includes(q)).length : active.length; })(), setInternPage)}
    </div>
  );
};

export default InternsTab;
