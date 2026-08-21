import React from 'react';
import { User } from 'lucide-react';
import { formatDepartment } from '../../utils/formatDepartment';

const ProfileTab = ({ profileDetails, user }) => {
  if (!profileDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-slate-400 text-sm animate-pulse">Loading profile details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Overview Card */}
      <div className="glass-panel p-6 bg-white flex flex-col sm:flex-row items-center gap-6">
        <div className="h-24 w-24 rounded-full overflow-hidden border border-slate-800 bg-slate-100 flex items-center justify-center shrink-0 shadow-sm">
          {profileDetails.picture ? (
            <>
              <img
                src={`http://localhost:5000/uploads/pictures/${profileDetails.picture}`}
                alt={`${profileDetails.firstName} ${profileDetails.lastName}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none' }} className="h-full w-full bg-slate-100 flex items-center justify-center">
                <User className="h-10 w-10 text-slate-400" />
              </div>
            </>
          ) : (
            <div className="h-full w-full bg-slate-100 flex items-center justify-center">
              <User className="h-10 w-10 text-slate-400" />
            </div>
          )}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="text-2xl font-bold text-slate-100">{profileDetails.firstName} {profileDetails.lastName}</h4>
          <p className="text-cyan-400 font-semibold text-sm">
            {formatDepartment(user.department)} Intern
          </p>
          <div className="pt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${user.isActive ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' : 'bg-red-950 text-red-400 border-red-800/20'}`}>
              {user.isActive ? 'Active Intern' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Details Section */}
      <div className="glass-panel p-6 bg-white space-y-4">
        <h4 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Email Address</span>
            <span className="text-slate-100 font-medium">{profileDetails.email}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">CNIC / ID Number</span>
            <span className="text-slate-100 font-medium">{profileDetails.cnic || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Date of Birth</span>
            <span className="text-slate-100 font-medium">
              {new Date(profileDetails.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Gender</span>
            <span className="text-slate-100 font-medium capitalize">{profileDetails.gender?.toLowerCase()}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Nationality</span>
            <span className="text-slate-100 font-medium">{profileDetails.nationality}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Emergency Contact Number</span>
            <span className="text-slate-100 font-medium">{profileDetails.emergencyContact}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Home Address</span>
            <span className="text-slate-100 font-medium">{profileDetails.address}</span>
          </div>
        </div>
      </div>

      {/* Academic Profile */}
      <div className="glass-panel p-6 bg-white space-y-4">
        <h4 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Academic Profile</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Current Education</span>
            <span className="text-slate-100 font-medium">{profileDetails.currentEducation || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Institute Name</span>
            <span className="text-slate-100 font-medium">{profileDetails.instituteName || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Program Details Section */}
      <div className="glass-panel p-6 bg-white space-y-4">
        <h4 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">Internship Program Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Assigned Department</span>
            <span className="text-slate-100 font-medium">{formatDepartment(user.department)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Internship Mode</span>
            <span className="text-slate-100 font-medium capitalize">
              {profileDetails.internshipMode ? profileDetails.internshipMode.toLowerCase().replace('_', ' ') : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Internship Duration</span>
            <span className="text-slate-100 font-medium">
              {profileDetails.duration ? `${profileDetails.duration} Weeks` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Internship Start Date</span>
            <span className="text-slate-100 font-medium">
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1 font-semibold">Internship End Date</span>
            <span className="text-slate-100 font-medium">
              {user.endDate ? new Date(user.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
