import React from 'react';

const OnboardingTab = ({
  allDocsVerified,
  handleUploadDoc,
  uploadForm,
  setUploadForm,
  docsList
}) => {
  return (
    <div className={`grid grid-cols-1 ${allDocsVerified ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-8`}>
      {/* Upload Document Panel */}
      {!allDocsVerified && (
        <div className="glass-panel p-6 border-slate-900 bg-slate-900/30">
          <h4 className="text-lg font-bold text-slate-100 mb-4">Upload New Document</h4>
          <form onSubmit={handleUploadDoc} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1" htmlFor="type">Document Type</label>
              <select
                id="type"
                className="glass-input py-2 pl-4 pr-10 text-sm cursor-pointer"
                value={uploadForm.type}
                onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <option className="bg-slate-950" value="CV">CV / Resume</option>
                <option className="bg-slate-950" value="ACADEMIC_TRANSCRIPT">Academic Transcript</option>
                <option className="bg-slate-950" value="EXPERIENCE_CERTIFICATE">Experience Certificates</option>
                <option className="bg-slate-950" value="CNIC_ID">CNIC / ID Card</option>
                <option className="bg-slate-950" value="PHOTO">Passport Size Photo</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Select File</label>
              <div className="bg-slate-950/50 border border-slate-800 border-dashed rounded-xl px-4 py-6 text-center hover:border-cyan-500/50 transition-all duration-200 relative cursor-pointer">
                <input
                  type="file"
                  required
                  accept={uploadForm.type === 'CNIC_ID' || uploadForm.type === 'PHOTO' ? ".pdf,.png,.jpg,.jpeg" : ".pdf"}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, document: e.target.files[0] }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploadForm.document ? (
                  <span className="text-cyan-400 text-xs truncate block">{uploadForm.document.name}</span>
                ) : (
                  <span className="text-slate-500 text-xs">Choose document file</span>
                )}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2.5 text-sm font-semibold rounded-lg">
              Upload Document
            </button>
          </form>
        </div>
      )}

      {/* Documents List */}
      <div className={`glass-panel p-6 border-slate-900 bg-slate-900/30 ${allDocsVerified ? '' : 'lg:col-span-2'} space-y-4`}>
        <h4 className="text-lg font-bold text-slate-100 mb-4">Onboarding Documents Directory</h4>
        <div className="grid grid-cols-1 gap-4">
          {['CV', 'ACADEMIC_TRANSCRIPT', 'EXPERIENCE_CERTIFICATE', 'CNIC_ID', 'PHOTO'].map((type) => {
            const docs = docsList.filter(doc => doc.type === type);
            const displayName = type.replace(/_/g, ' ');

            return (
              <div key={type} className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl flex flex-col justify-between min-h-[140px] space-y-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-200 font-bold text-xs uppercase tracking-wider block">
                    {displayName}
                  </span>
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {docs.length} file(s)
                  </span>
                </div>

                {docs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold">No file uploaded yet</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold border bg-slate-900 text-slate-400 border-slate-800/20">
                      PENDING
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3.5 divide-y divide-slate-900/40 flex-1">
                    {docs.map((doc, idx) => (
                      <div key={doc.id} className={`space-y-1.5 ${idx > 0 ? 'pt-3' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-semibold">File #{idx + 1}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border block ${doc.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' : doc.status === 'REJECTED' ? 'bg-red-950 text-red-400 border-red-800/20' : 'bg-slate-900 text-slate-400 border-slate-800/20'}`}>
                            {doc.status}
                          </span>
                        </div>
                        
                        {doc.feedback && (
                          <div className="bg-slate-900 p-2 rounded border border-slate-850 text-red-400 text-[10px]">
                            Feedback: "{doc.feedback}"
                          </div>
                        )}

                        <a
                          href={`http://localhost:5000/api/onboarding/docs/download/${doc.id}?token=${localStorage.getItem('token')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline text-[11px] font-semibold block w-fit pt-1"
                        >
                          View File &rarr;
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTab;
