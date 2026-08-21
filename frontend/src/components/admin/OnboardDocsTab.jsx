import React, { useState } from 'react';
import { formatDepartment } from '../../utils/formatDepartment';

const OnboardDocsTab = ({
  documents,
  groupDocsByIntern,
  expandedInterns,
  toggleExpandIntern,
  REQUIRED_DOC_TYPES,
  feedbackInputs,
  setFeedbackInputs,
  handleVerifyDoc
}) => {
  const [docsSearchQuery, setDocsSearchQuery] = useState('');

  const allGroups = groupDocsByIntern(documents);
  const filteredGroups = allGroups.filter(group => 
    `${group.intern.firstName} ${group.intern.lastName}`.toLowerCase().includes(docsSearchQuery.toLowerCase()) ||
    group.intern.email.toLowerCase().includes(docsSearchQuery.toLowerCase()) ||
    (group.intern.department || '').toLowerCase().includes(docsSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-2 border-b border-slate-900">
        <h3 className="text-xl font-bold text-slate-100">Onboarding Documents Review</h3>
        <input
          type="text"
          placeholder="Search intern by name, email, dept..."
          className="glass-input py-2 text-sm w-full sm:max-w-xs"
          value={docsSearchQuery}
          onChange={(e) => setDocsSearchQuery(e.target.value)}
        />
      </div>

      {allGroups.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No onboarding documents submitted.</p>
      ) : filteredGroups.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No matching onboarding documents found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => {
            const isExpanded = !!expandedInterns[group.intern.id];
            const allUploadedFiles = Object.values(group.uploadedDocs).flat();
            const uploadedCount = Object.keys(group.uploadedDocs).length;
            const verifiedCount = allUploadedFiles.filter(d => d.status === 'VERIFIED').length;
            const rejectedCount = allUploadedFiles.filter(d => d.status === 'REJECTED').length;
            const pendingReviewCount = allUploadedFiles.filter(d => d.status === 'UPLOADED').length;

            return (
              <div key={group.intern.id} className="glass-panel p-6 border-slate-900 bg-slate-900/30 flex flex-col justify-between h-fit">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-slate-200 font-bold text-base">{group.intern.firstName} {group.intern.lastName}</h4>
                      <span className="text-slate-500 text-xs block mt-0.5">{group.intern.email}</span>
                      <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider block mt-1">
                        Dept: {formatDepartment(group.intern.department)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-slate-400 font-medium">
                        Uploaded: <strong className="text-slate-200">{uploadedCount}/5</strong>
                      </span>
                      {verifiedCount > 0 && (
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/30 px-1.5 py-0.5 rounded font-semibold">
                          {verifiedCount} Verified
                        </span>
                      )}
                      {rejectedCount > 0 && (
                        <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded font-semibold">
                          {rejectedCount} Rejected
                        </span>
                      )}
                      {pendingReviewCount > 0 && (
                        <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/30 px-1.5 py-0.5 rounded font-semibold animate-pulse">
                          {pendingReviewCount} Pending Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => toggleExpandIntern(group.intern.id)}
                    className="btn-secondary w-full py-2 text-center text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Documents' : 'View & Manage Documents'}</span>
                    <span>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-900 space-y-4">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documents Status</h5>
                      {REQUIRED_DOC_TYPES.map((type) => {
                        const docs = group.uploadedDocs[type] || [];
                        const displayName = type.replace(/_/g, ' ');

                        if (docs.length > 0) {
                          return (
                            <div key={type} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{displayName}</span>
                                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-bold">
                                  {docs.length} file(s)
                                </span>
                              </div>
                              
                              <div className="space-y-4 divide-y divide-slate-900/50">
                                {docs.map((doc, idx) => (
                                  <div key={doc.id} className={`space-y-2 ${idx > 0 ? 'pt-4' : ''}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[11px] text-slate-400 font-semibold">File #{idx + 1}</span>
                                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${doc.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' : doc.status === 'REJECTED' ? 'bg-red-950 text-red-400 border-red-800/20' : 'bg-amber-950 text-amber-400 border-amber-800/20'}`}>
                                        {doc.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-550">Submitted on: {new Date(doc.createdAt).toLocaleString()}</p>

                                    {doc.feedback && (
                                      <p className="bg-slate-950/95 p-2 rounded border border-slate-900 text-red-400 text-[10px]">
                                        Rejection reason: "{doc.feedback}"
                                      </p>
                                    )}

                                    <div className="flex flex-col space-y-2 pt-1">
                                      <a
                                        href={`http://localhost:5000/api/onboarding/docs/download/${doc.id}?token=${localStorage.getItem('token')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-center text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold block py-1"
                                      >
                                        View File
                                      </a>

                                      {doc.status === 'UPLOADED' && (
                                        <div className="flex flex-col space-y-2 pt-2 border-t border-slate-900">
                                          <input
                                            type="text"
                                            placeholder="Rejection feedback (optional)..."
                                            className="glass-input py-1.5 px-2.5 text-xs text-slate-200"
                                            value={feedbackInputs[doc.id] || ''}
                                            onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [doc.id]: e.target.value }))}
                                          />
                                          <div className="flex space-x-2">
                                            <button
                                              onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')}
                                              className="btn-primary py-1.5 px-3 text-[11px] font-bold flex-1 rounded"
                                            >
                                              Verify
                                            </button>
                                            <button
                                              onClick={() => handleVerifyDoc(doc.id, 'REJECTED')}
                                              className="bg-red-700 hover:bg-red-600 text-slate-100 font-bold py-1.5 px-3 text-[11px] flex-1 rounded transition-colors cursor-pointer"
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={type} className="bg-slate-950/20 p-3 rounded-lg border border-slate-900/60 flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-500">{displayName}</span>
                              <span className="bg-slate-900/80 text-slate-500 border border-slate-950 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                                Pending
                              </span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnboardDocsTab;
