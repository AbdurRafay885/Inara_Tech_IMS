import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/inara_logo.png';
import formBg from '../assets/form_bg.png';

const PublicTrack = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();

  const getCoolOffInfo = (updatedAt) => {
    if (!updatedAt) return { active: false, remainingMonths: 0, message: "" };
    const rejectionDate = new Date(updatedAt);
    const eligibleDate = new Date(rejectionDate);
    eligibleDate.setMonth(eligibleDate.getMonth() + 6);

    const now = new Date();
    const remainingMs = eligibleDate.getTime() - now.getTime();

    if (remainingMs <= 0) {
      return { active: false, remainingMonths: 0, message: "" };
    }

    const remainingMonths = (remainingMs / (30 * 24 * 60 * 60 * 1000)).toFixed(1);

    let message = "";
    const totalDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    if (totalDays > 30) {
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      message = `${months} month${months > 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      message = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
    }

    return {
      active: true,
      remainingMonths: parseFloat(remainingMonths),
      readableTime: message,
      eligibleDate
    };
  };

  useEffect(() => {
    if (user && user.applicationId) {
      setTrackingId(user.applicationId);
      fetchStatus(user.applicationId);
    } else {
      const id = searchParams.get('id');
      if (id) {
        setTrackingId(id);
        fetchStatus(id);
      }
    }
  }, [searchParams, user]);

  const fetchStatus = async (idToFetch) => {
    setError('');
    setApplication(null);
    setLoading(true);

    try {
      const response = await api.get(`/applications/track/${idToFetch}`);
      setApplication(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found. Please verify your Tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      fetchStatus(trackingId.trim());
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-500 text-white border-blue-400';
      case 'UNDER_REVIEW':
        return 'bg-amber-500 text-white border-amber-400';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-500 text-white border-purple-400';
      case 'SELECTED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800/30';
      case 'REJECTED':
        return 'bg-red-950 text-red-400 border-red-800/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-3">
            <img src={logo} alt="Inara Technologies Logo" className="h-24 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="text-3xl font-bold text-slate-100">Track Application Progress</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your Tracking ID to view the live review status</p>
        </div>

        {/* Search Panel */}
        <div className="glass-panel p-6 mb-8 auth-card bg-slate-900/40">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              className="glass-input flex-1"
              placeholder="Enter your Tracking ID (CNIC)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-6 shrink-0 font-semibold"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 text-center text-red-400 text-sm mb-8">
            {error}
          </div>
        )}

        {/* Results Panel */}
        {application && (
          <div className="glass-panel p-8 auth-card bg-slate-900/30 animate-fadeIn">
            <h3 className="text-xl font-bold text-slate-100 mb-6 pb-4 border-b border-slate-900">
              Live Progress Details
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-slate-500 text-xs uppercase font-semibold tracking-wider block">Candidate Name</span>
                  <span className="text-slate-200 text-lg font-medium">{application.firstName} {application.lastName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-xs uppercase font-semibold tracking-wider block">Live Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)} mt-1`}>
                    {application.status}
                  </span>
                </div>
              </div>
              {application.status === 'SUBMITTED' && (
                <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-blue-900 text-sm">
                  <div className="font-bold text-blue-900 mb-1">Application Submitted</div>
                  We have successfully received your application. Our team will review your application shortly.
                </div>
              )}

              {application.status === 'UNDER_REVIEW' && (
                <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-amber-900 text-sm">
                  <div className="font-bold text-amber-900 mb-1">Application Under Review</div>
                  Our recruitment team is currently reviewing your profile. We will update your status as soon as a decision is made.
                </div>
              )}

              {application.status === 'INTERVIEW_SCHEDULED' && application.interviewDate && (
                <div className="bg-purple-100 border border-purple-300 rounded-xl p-4 text-purple-900 text-sm">
                  <div className="font-bold mb-1">Interview Scheduled!</div>
                  Your interview has been scheduled for: <span className="font-bold text-black">{new Date(application.interviewDate).toLocaleString()}</span>. Please check your email for the invitation details.
                </div>
              )}

              {application.status === 'SELECTED' && (
                <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4 text-emerald-900 text-sm space-y-4">
                  <div>
                    <div className="font-bold mb-1">Congratulations! You are Selected!</div>
                    The Admin has approved your application and upgraded your account to an Intern profile. You can now log in using your existing email and password to access the Intern Portal.
                  </div>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = '/login';
                      }}
                      className="btn-primary px-6 py-2.5 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Log In to Intern Portal
                    </button>
                  </div>
                </div>
              )}

              {application.status === 'REJECTED' && (() => {
                const coolOff = getCoolOffInfo(application.updatedAt);
                return (
                  <div className="bg-red-100 border border-red-300 rounded-xl p-5 text-red-900 text-sm space-y-4">
                    <div>
                      <div className="font-bold mb-1">Application Update: Not Selected</div>
                      We appreciate your interest in Inara Technologies. Unfortunately, we did not select your application for the internship program at this time.
                    </div>

                    {coolOff.active ? (
                      <div className="bg-white/80 border border-red-300 rounded-lg p-3 text-red-950 text-xs space-y-1">
                        <span className="block font-semibold text-red-900">Cool-off Period Restriction</span>
                        <span>You can apply again after a 6-month cool-off period.</span>
                        <span className="block font-bold text-black pt-3 mt-3">
                          Remaining time: {coolOff.readableTime} ({coolOff.remainingMonths} months)
                        </span>
                        <span className="block text-[12px] text-black">
                          Eligible to re-apply on: {coolOff.eligibleDate.toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white/80 border border-emerald-300 rounded-lg p-3 text-emerald-900 text-xs">
                          <span className="block font-semibold text-emerald-800">Cool-off Period Expired!</span>
                          <span>Your 6-month cool-off period has completed. You are now eligible to submit a new application.</span>
                        </div>
                        <Link
                          to="/apply?reapply=true"
                          className="btn-primary px-6 py-2.5 text-xs font-semibold rounded-lg block text-center cursor-pointer font-semibold mx-auto"
                        >
                          Submit New Application
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                <div>
                  <span className="text-slate-500 text-xs uppercase font-semibold block">Date Applied</span>
                  <span className="text-slate-300 font-medium">{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase font-semibold block">Tracking Reference (CNIC)</span>
                  <span className="font-mono text-slate-300 text-sm truncate block">{application.cnic}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-6 flex flex-col items-center space-y-3">
          <Link to="/home" className="text-blue-800 hover:text-blue-955 font-extrabold text-sm hover:underline">
            &larr; Back to Home
          </Link>
          {user && (
            <button
              onClick={() => {
                logout();
                window.location.href = '/home';
              }}
              className="btn-icon text-red-500 hover:text-red-600 text-xs font-semibold hover:underline cursor-pointer"
            >
              Sign Out from Candidate Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTrack;
