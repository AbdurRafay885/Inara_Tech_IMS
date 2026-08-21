import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Map,
  ClipboardList,
  Briefcase,
  Bell,
  User,
  LayoutDashboard,
  Search,
  Clock,
  PlayCircle,
  Send,
  Calendar,
  XCircle,
  FileCheck,
  Download,
  Link
} from 'lucide-react';

import DashboardTab from './intern/DashboardTab';
import OnboardingTab from './intern/OnboardingTab';
import RoadmapTab from './intern/RoadmapTab';
import ReportsTab from './intern/ReportsTab';
import ProjectsTab from './intern/ProjectsTab';
import ProfileTab from './intern/ProfileTab';
import AlertsTab from './intern/AlertsTab';

const InternPanel = () => {
  const { tab: activeTab } = useParams();
  const navigate = useNavigate();
  const { user, notifications, markNotificationRead, fetchNotifications } = useAuth();

  // Onboarding Docs
  const [docsList, setDocsList] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  const [uploadForm, setUploadForm] = useState({ type: 'CV', document: null });

  // Roadmap
  const [roadmaps, setRoadmaps] = useState([]);

  // Weekly Reports
  const [reportForm, setReportForm] = useState({ weekNumber: '', workCompleted: '', challengesFaced: '', attachment: null, roadmapId: '' });
  const [activeSubmitRoadmapId, setActiveSubmitRoadmapId] = useState(null);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [progressDetails, setProgressDetails] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  // Projects & Tasks
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [deliverableLink, setDeliverableLink] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // UI state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchTabContent();

    const interval = setInterval(() => {
      fetchTabContent(true);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchTabContent = async (isBackground = false) => {
    if (!isBackground) {
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(true);
    }

    try {
      if (activeTab === 'dashboard') {
        const response = await api.get('/dashboard/stats');
        setDashboardStats(response.data.data);
      } else if (activeTab === 'profile') {
        if (user?.applicationId) {
          const response = await api.get(`/applications/track/${user.applicationId}`);
          setProfileDetails(response.data.data);
        } else {
          // Fallback details if no application link is present (e.g. manually created / legacy users)
          setProfileDetails({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: 'N/A',
            preferredDepartment: user.department,
            internshipMode: 'N/A',
            dob: user.createdAt,
            address: 'N/A',
            gender: 'N/A',
            nationality: 'N/A',
            emergencyContact: 'N/A',
            duration: 6,
            createdAt: user.createdAt,
          });
        }
      } else if (activeTab === 'onboarding') {
        const response = await api.get('/onboarding/docs');
        // Filter onboarding documents specifically for the logged-in intern
        const myDocs = response.data.data.filter(doc => doc.internId === user.id);
        setDocsList(myDocs);
      } else if (activeTab === 'roadmap') {
        try {
          const response = await api.get('/training/roadmap');
          setRoadmaps(response.data.data || []);
        } catch (err) {
          if (err.response?.status !== 404) throw err;
          setRoadmaps([]);
        }
      } else if (activeTab === 'reports') {
        // Fetch progress metrics
        const progressResponse = await api.get('/reports/progress');
        setProgressDetails(progressResponse.data.data);

        // Fetch reports
        const reportsResponse = await api.get('/reports');
        setSubmittedReports(reportsResponse.data.data);

        // Fetch roadmaps
        try {
          const response = await api.get('/training/roadmap');
          setRoadmaps(response.data.data || []);
        } catch (err) {
          setRoadmaps([]);
        }
      } else if (activeTab === 'projects') {
        const response = await api.get('/projects');
        setAssignedProjects(response.data.data);
      } else if (activeTab === 'alerts') {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (!isBackground) {
        setErrorMsg('Failed to retrieve dashboard data.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadForm.document) {
      setErrorMsg('Please select a document file to upload.');
      return;
    }

    const payload = new FormData();
    payload.append('type', uploadForm.type);
    payload.append('document', uploadForm.document);

    try {
      setLoading(true);
      await api.post('/onboarding/upload-doc', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(`Document (${uploadForm.type}) uploaded successfully.`);
      setUploadForm({ type: 'CV', document: null });
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!editingReport && !reportForm.attachment) {
      setErrorMsg('Uploading an attachment report file (PDF/Doc) is mandatory.');
      return;
    }

    setLoading(true);

    const payload = new FormData();
    payload.append('taskId', reportForm.taskId);
    payload.append('workCompleted', reportForm.workCompleted);
    payload.append('challengesFaced', reportForm.challengesFaced);
    if (reportForm.attachment) {
      payload.append('attachment', reportForm.attachment);
    }

    try {
      await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(editingReport ? 'Task report updated and resubmitted successfully.' : 'Task report submitted successfully.');
      setReportForm({ taskId: '', workCompleted: '', challengesFaced: '', attachment: null });
      setEditingReport(null);
      setActiveSubmitRoadmapId(null);
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (report) => {
    setEditingReport(report);
    setReportForm({
      taskId: report.taskId,
      workCompleted: report.workCompleted,
      challengesFaced: report.challengesFaced,
      attachment: null,
    });
    setActiveSubmitRoadmapId(report.taskId);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/projects/tasks/${taskId}/status`, { status: newStatus });
      setSuccessMsg('Task status updated successfully.');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setErrorMsg('Please select a task.');
      return;
    }

    if (!deliverableFile && (!deliverableLink || deliverableLink.trim() === '')) {
      setErrorMsg('Please select a PDF file or provide a deliverable link.');
      return;
    }

    const payload = new FormData();
    if (deliverableFile) {
      payload.append('deliverable', deliverableFile);
    }
    if (deliverableLink) {
      payload.append('deliverableLink', deliverableLink);
    }

    try {
      setLoading(true);
      await api.post(`/projects/tasks/${selectedTaskId}/deliverable`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Project deliverable uploaded successfully.');
      setDeliverableFile(null);
      setDeliverableLink('');
      setSelectedTaskId('');
      setIsDeliverableModalOpen(false);
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload deliverable.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <span className="text-slate-400 text-sm animate-pulse">Initializing user session...</span>
      </div>
    );
  }

  const PAGE_META = {
    dashboard: {
      icon: LayoutDashboard,
      title: 'Dashboard',
      tagline: 'Track your onboarding, training roadmap, and project milestones',
    },
    profile: {
      icon: User,
      title: 'My Profile',
      tagline: 'View and manage your personal internship profile and information',
    },
    onboarding: {
      icon: FileText,
      title: 'Onboarding Documents',
      tagline: 'Upload and track your required onboarding document submissions',
    },
    roadmap: {
      icon: Map,
      title: 'Training Roadmap',
      tagline: 'Follow your structured training plan and track milestones',
    },
    reports: {
      icon: ClipboardList,
      title: 'Weekly Reports',
      tagline: 'Submit your weekly progress reports and view feedback from your supervisor',
    },
    projects: {
      icon: Briefcase,
      title: 'My Projects',
      tagline: 'View assigned projects and submit your task deliverables',
    },
    alerts: {
      icon: Bell,
      title: 'Notifications',
      tagline: 'Stay up to date with all alerts and updates from your panel',
    },
  };

  const renderPageHeader = () => {
    const meta = PAGE_META[activeTab];
    if (!meta) return null;
    const Icon = meta.icon;
    return (
      <div className="flex items-center justify-between mb-2 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center shadow-sm border border-cyan-100 shrink-0">
            <Icon className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black leading-tight">{meta.title}</h2>
            <p className="text-slate-100 text-sm mt-0.5">{meta.tagline}</p>
          </div>
        </div>

        {/* Header notification bell dropdown */}
        <div className="relative mr-6">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-full hover:bg-slate-100/10 active:scale-95 transition-all cursor-pointer bg-transparent border-0 flex items-center justify-center"
          >
            <Bell className="h-6 w-6 text-red-500 fill-red-500/10" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-[11px] text-white font-black ring-2 ring-white select-none">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-45"
                onClick={() => setShowNotifDropdown(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-extrabold text-black uppercase tracking-wider">Recent Alerts</span>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <button
                      onClick={async () => {
                        for (const n of notifications.filter(n => !n.isRead)) {
                          await markNotificationRead(n.id);
                        }
                      }}
                      className="text-[10px] text-white hover:text-slate-100 bg-red-600 hover:bg-red-700 font-bold uppercase tracking-wider px-2.5 py-1 rounded-md cursor-pointer transition-colors border-0 shrink-0 select-none whitespace-nowrap"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {notifications.filter(n => !n.isRead).length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">No unread notifications.</p>
                  ) : (
                    notifications.filter(n => !n.isRead).slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.isRead) markNotificationRead(n.id);
                          setShowNotifDropdown(false);
                          navigate('/intern/alerts');
                        }}
                        className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${n.isRead
                          ? 'bg-slate-950/20 border-slate-950/50 hover:bg-slate-950/40'
                          : 'bg-slate-950 border-red-500/10 hover:border-red-500/20 hover:bg-slate-950/80'
                          }`}
                      >
                        <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-400 font-medium' : 'text-slate-200 font-bold'}`}>
                          {n.message}
                        </p>
                        <span className="text-[9px] text-slate-500 block mt-1.5 font-medium">
                          {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(false);
                      navigate('/intern/alerts');
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase tracking-wider py-2 rounded-xl cursor-pointer text-xs transition-colors border-0"
                  >
                    See All Alerts &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const allDocsVerified = ['CV', 'ACADEMIC_TRANSCRIPT', 'EXPERIENCE_CERTIFICATE', 'CNIC_ID', 'PHOTO'].every(type =>
    docsList.some(doc => doc.type === type && doc.status === 'VERIFIED')
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        {renderPageHeader()}
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-4 mb-6 text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && !isDeliverableModalOpen && !activeSubmitRoadmapId && (
        <div className="app-error-alert rounded-xl p-4 mb-6 text-sm font-semibold flex items-center space-x-2 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Main Tab Views */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 pt-4">
        {activeTab === 'dashboard' && dashboardStats && (
          <DashboardTab dashboardStats={dashboardStats} navigate={navigate} />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingTab
            allDocsVerified={allDocsVerified}
            handleUploadDoc={handleUploadDoc}
            uploadForm={uploadForm}
            setUploadForm={setUploadForm}
            docsList={docsList}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapTab user={user} roadmaps={roadmaps} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            progressDetails={progressDetails}
            submittedReports={submittedReports}
            activeSubmitRoadmapId={activeSubmitRoadmapId}
            setActiveSubmitRoadmapId={setActiveSubmitRoadmapId}
            setEditingReport={setEditingReport}
            editingReport={editingReport}
            reportForm={reportForm}
            setReportForm={setReportForm}
            handleSubmitReport={handleSubmitReport}
            handleStartEdit={handleStartEdit}
            roadmaps={roadmaps}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            user={user}
            assignedProjects={assignedProjects}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={setSelectedTaskId}
            deliverableFile={deliverableFile}
            setDeliverableFile={setDeliverableFile}
            deliverableLink={deliverableLink}
            setDeliverableLink={setDeliverableLink}
            isDeliverableModalOpen={isDeliverableModalOpen}
            setIsDeliverableModalOpen={setIsDeliverableModalOpen}
            handleUploadDeliverable={handleUploadDeliverable}
            handleUpdateTaskStatus={handleUpdateTaskStatus}
            errorMsg={errorMsg}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab profileDetails={profileDetails} user={user} />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            notifications={notifications}
            markNotificationRead={markNotificationRead}
          />
        )}
      </div>
    </div>
  );
};

export default InternPanel;
