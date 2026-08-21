import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Search,
  LayoutDashboard,
  FileCheck,
  Building2,
  History,
  Bell,
  Users,
  ClipboardList,
  Send,
  Calendar,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

import DashboardTab from './admin/DashboardTab';
import ApplicationsTab from './admin/ApplicationsTab';
import OnboardDocsTab from './admin/OnboardDocsTab';
import DepartmentsTab from './admin/DepartmentsTab';
import InternsTab from './admin/InternsTab';
import HistoryTab from './admin/HistoryTab';
import AlertsTab from './admin/AlertsTab';
import SettingsTab from './admin/SettingsTab';
import { formatDepartment } from '../utils/formatDepartment';

const REQUIRED_DOC_TYPES = ['CV', 'ACADEMIC_TRANSCRIPT', 'EXPERIENCE_CERTIFICATE', 'CNIC_ID', 'PHOTO'];

const AdminPanel = () => {
  const { tab: activeTab } = useParams();
  const navigate = useNavigate();
  const { notifications, markNotificationRead, fetchNotifications } = useAuth();

  // Application states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allInterns, setAllInterns] = useState([]);
  const [selectedProfileIntern, setSelectedProfileIntern] = useState(null);
  const [selectedProfileDetails, setSelectedProfileDetails] = useState(null);
  const [appPage, setAppPage] = useState(1);
  const [internPage, setInternPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [headerSearch, setHeaderSearch] = useState('');
  const [appFilters, setAppFilters] = useState({ status: '', preferredDepartment: '', internshipMode: '', search: '' });
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', interviewDate: '', startDate: '' });

  // Verify docs states
  const [documents, setDocuments] = useState([]);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [expandedInterns, setExpandedInterns] = useState({});

  const groupDocsByIntern = (docs) => {
    const groups = {};
    docs.forEach(doc => {
      if (!doc.intern) return;
      const internId = doc.intern.id;
      if (!groups[internId]) {
        groups[internId] = {
          intern: doc.intern,
          uploadedDocs: {},
        };
      }
      if (!groups[internId].uploadedDocs[doc.type]) {
        groups[internId].uploadedDocs[doc.type] = [];
      }
      groups[internId].uploadedDocs[doc.type].push(doc);
    });
    return Object.values(groups);
  };

  const toggleExpandIntern = (internId) => {
    setExpandedInterns(prev => ({
      ...prev,
      [internId]: !prev[internId]
    }));
  };

  // Assign department states
  const [interns, setInterns] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [deptForm, setDeptForm] = useState('DEVELOPMENT');

  const [dropdownOptions, setDropdownOptions] = useState({
    preferredDepartment: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/dropdowns');
        setDropdownOptions(res.data.data);
      } catch (err) {
        console.error('Failed to load dropdown options in AdminPanel:', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (dropdownOptions.preferredDepartment.length > 0) {
      setDeptForm(dropdownOptions.preferredDepartment[0].value);
    }
  }, [dropdownOptions]);

  // History states
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({ department: '', year: '', supervisor: '', search: '' });
  const [archiveModal, setArchiveModal] = useState(null);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleOpenInternProfile = async (intern) => {
    setSelectedProfileIntern(intern);
    setSelectedProfileDetails(null);
    try {
      if (intern.applicationId) {
        const response = await api.get(`/applications/track/${intern.applicationId}`);
        setSelectedProfileDetails(response.data.data);
      } else {
        // Fallback for mock users/manually created users
        setSelectedProfileDetails({
          firstName: intern.firstName || intern.internName?.split(' ')[0] || 'Intern',
          lastName: intern.lastName || intern.internName?.split(' ')[1] || 'Profile',
          email: intern.email || intern.internEmail || 'N/A',
          phone: 'N/A',
          preferredDepartment: intern.department,
          internshipMode: 'N/A',
          dob: intern.createdAt,
          address: 'N/A',
          gender: 'N/A',
          nationality: 'N/A',
          emergencyContact: 'N/A',
          createdAt: intern.createdAt,
        });
      }
    } catch (err) {
      console.error("Failed to fetch intern profile details:", err);
    }
  };

  useEffect(() => {
    fetchTabContent();

    const interval = setInterval(() => {
      fetchTabContent(true);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab, appFilters, historyFilters]);

  useEffect(() => {
    setAppPage(1);
  }, [appFilters]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyFilters]);

  useEffect(() => {
    setAppPage(1);
    setInternPage(1);
    setHistoryPage(1);
  }, [activeTab]);

  const renderPagination = (currentPage, totalItems, onPageChange) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-200 mt-4 text-xs font-semibold gap-3">
        <span className="text-slate-500">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-600 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0"
            title="Previous Page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {pages.map((p) => {
            const isActive = p === currentPage;
            if (isActive) {
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className="text-white font-bold h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs select-none shrink-0"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444', borderStyle: 'solid', borderWidth: '1px' }}
                >
                  {p}
                </button>
              );
            } else {
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-600 font-bold h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-xs select-none shrink-0"
                >
                  {p}
                </button>
              );
            }
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-600 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0"
            title="Next Page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const getDeptBadgeClass = (dept) => {
    const d = dept?.toUpperCase() || 'UNASSIGNED';
    switch (d) {
      case 'DEVELOPMENT':
        return 'bg-green-100 text-black border border-green-400';
      case 'DEVOPS':
        return 'bg-cyan-100 text-black border border-cyan-400';
      case 'AI_ML':
        return 'bg-yellow-100 text-black border border-yellow-400';
      case 'SECURITY':
        return 'bg-rose-100 text-black border border-rose-400';
      case 'NETWORKING':
        return 'bg-indigo-100 text-black border border-indigo-400';
      default:
        let hash = 0;
        for (let i = 0; i < d.length; i++) {
          hash = d.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
          'bg-pink-100 text-pink-900 border-pink-300',
          'bg-purple-100 text-purple-900 border-purple-300',
          'bg-teal-100 text-teal-900 border-teal-300',
          'bg-orange-100 text-orange-900 border-orange-300',
          'bg-sky-100 text-sky-900 border-sky-300',
          'bg-emerald-100 text-emerald-900 border-emerald-300',
        ];
        return colors[Math.abs(hash) % colors.length];
    }
  };

  const getApplicationStatusClass = (status) => {
    const s = status?.toUpperCase() || '';
    switch (s) {
      case 'SELECTED':
      case 'APPROVED':
      case 'COMPLETED':
        return 'bg-green-100 text-black border border-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-black border border-red-400';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-black border border-purple-400';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-black border border-amber-400';
      case 'SUBMITTED':
        return 'bg-blue-100 text-black border border-blue-400';
      case 'UPLOADED':
        return 'bg-indigo-100 text-black border border-indigo-400';
      default:
        return 'bg-slate-100 text-black border border-slate-400';
    }
  };

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
      } else if (activeTab === 'applications') {
        const query = new URLSearchParams(appFilters).toString();
        const response = await api.get(`/applications?${query}`);
        setApplications(response.data.data);
      } else if (activeTab === 'interns') {
        const response = await api.get('/onboarding/interns');
        setAllInterns(response.data.data);
      } else if (activeTab === 'onboarddocs') {
        const response = await api.get('/onboarding/docs');
        const activeDocs = response.data.data.filter(doc => doc.intern?.isActive);
        setDocuments(activeDocs);
      } else if (activeTab === 'departments') {
        const response = await api.get('/onboarding/interns');
        const activeInterns = response.data.data.filter(intern => intern.isActive);
        setInterns(activeInterns);
      } else if (activeTab === 'history') {
        const query = new URLSearchParams(historyFilters).toString();
        const response = await api.get(`/records?${query}`);
        setHistoryRecords(response.data.data);
      } else if (activeTab === 'alerts') {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (!isBackground) {
        setErrorMsg('Failed to load dashboard content.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const handleUpdateAppStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setLoading(true);
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: statusForm.status,
        interviewDate: statusForm.interviewDate || null,
        startDate: statusForm.status === 'SELECTED' ? (statusForm.startDate || null) : null
      });
      setSuccessMsg('Application status updated and notification sent.');
      setSelectedApp(null);
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoc = async (docId, status) => {
    try {
      setLoading(true);
      const feedback = status === 'REJECTED' ? (feedbackInputs[docId] || '') : null;
      await api.patch(`/onboarding/docs/${docId}`, {
        status,
        feedback
      });
      setSuccessMsg(`Document ${status.toLowerCase()} successfully.`);
      setFeedbackInputs(prev => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to verify document.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDept = async (e) => {
    e.preventDefault();
    if (!selectedInternId) return;

    try {
      setLoading(true);
      await api.patch(`/onboarding/interns/${selectedInternId}/department`, {
        department: deptForm
      });
      setSuccessMsg('Intern assigned to department successfully.');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign department.');
    } finally {
      setLoading(false);
    }
  };

  const PAGE_META = {
    dashboard: {
      icon: LayoutDashboard,
      title: 'Dashboard',
      tagline: 'IMS Portal overview, statistics, and quick insights',
      searchPlaceholder: '',
    },
    applications: {
      icon: ClipboardList,
      title: 'Applications',
      tagline: 'Review and manage all submitted internship applications',
      searchPlaceholder: 'Search by name, email or department...',
    },
    interns: {
      icon: Users,
      title: 'Registered Interns',
      tagline: 'View and manage all currently active interns',
      searchPlaceholder: 'Search by name, email or department...',
    },
    onboarddocs: {
      icon: FileCheck,
      title: 'Onboarding Documents',
      tagline: 'Verify and manage intern onboarding document submissions',
      searchPlaceholder: 'Search interns...',
    },
    departments: {
      icon: Building2,
      title: 'Assign Departments',
      tagline: 'Assign interns and supervisors to their respective departments',
      searchPlaceholder: 'Search interns or supervisors...',
    },
    history: {
      icon: History,
      title: 'Archived Records',
      tagline: 'Browse completed and historical internship records',
      searchPlaceholder: 'Search by name, email or department...',
    },
    alerts: {
      icon: Bell,
      title: 'Alert Center',
      tagline: 'Review all system notifications and administrative alerts',
      searchPlaceholder: 'Search alerts...',
    },
    settings: {
      icon: Settings,
      title: 'Form Dropdown Settings',
      tagline: 'Configure registration select dropdown menus and supervisor accounts',
      searchPlaceholder: '',
    },
  };

  const renderPageHeader = () => {
    const meta = PAGE_META[activeTab];
    if (!meta) return null;
    const Icon = meta.icon;
    const showSearch = ['applications', 'interns', 'history'].includes(activeTab);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shadow-sm border border-red-100 shrink-0">
            <Icon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black leading-tight">{meta.title}</h2>
            <p className="text-slate-100 text-sm mt-0.5">{meta.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end w-full sm:w-auto">
          {showSearch && (
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={meta.searchPlaceholder}
                value={headerSearch}
                onChange={(e) => { setHeaderSearch(e.target.value); setAppPage(1); setInternPage(1); setHistoryPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
              />
            </div>
          )}

          {/* Header notification bell dropdown */}
          <div className={`relative ${showSearch ? '' : 'mr-6'}`}>
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
                            navigate('/admin/alerts');
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
                        navigate('/admin/alerts');
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
      </div>
    );
  };

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
      {errorMsg && (
        <div className="app-error-alert rounded-xl p-4 mb-6 text-sm font-semibold flex items-center space-x-2 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* Main Tab Views */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 pt-4">
        {activeTab === 'dashboard' && dashboardStats && (
          <DashboardTab
            dashboardStats={dashboardStats}
            navigate={navigate}
            getDeptBadgeClass={getDeptBadgeClass}
            getApplicationStatusClass={getApplicationStatusClass}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsTab
            appFilters={appFilters}
            setAppFilters={setAppFilters}
            applications={applications}
            appPage={appPage}
            setAppPage={setAppPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            headerSearch={headerSearch}
            getApplicationStatusClass={getApplicationStatusClass}
            getDeptBadgeClass={getDeptBadgeClass}
            setSelectedApp={setSelectedApp}
            setStatusForm={setStatusForm}
            selectedApp={selectedApp}
            statusForm={statusForm}
            handleUpdateStatus={handleUpdateAppStatus}
            renderPagination={renderPagination}
            fetchTabContent={fetchTabContent}
            departmentOptions={dropdownOptions.preferredDepartment}
          />
        )}

        {activeTab === 'onboarddocs' && (
          <OnboardDocsTab
            documents={documents}
            groupDocsByIntern={groupDocsByIntern}
            expandedInterns={expandedInterns}
            toggleExpandIntern={toggleExpandIntern}
            REQUIRED_DOC_TYPES={REQUIRED_DOC_TYPES}
            feedbackInputs={feedbackInputs}
            setFeedbackInputs={setFeedbackInputs}
            handleVerifyDoc={handleVerifyDoc}
          />
        )}

        {activeTab === 'departments' && (
          <DepartmentsTab
            loading={loading}
            handleAssignDept={handleAssignDept}
            selectedInternId={selectedInternId}
            setSelectedInternId={setSelectedInternId}
            interns={interns}
            deptForm={deptForm}
            setDeptForm={setDeptForm}
            departmentOptions={dropdownOptions.preferredDepartment}
          />
        )}

        {activeTab === 'interns' && (
          <InternsTab
            internPage={internPage}
            setInternPage={setInternPage}
            allInterns={allInterns}
            headerSearch={headerSearch}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getDeptBadgeClass={getDeptBadgeClass}
            handleOpenInternProfile={handleOpenInternProfile}
            renderPagination={renderPagination}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            historyFilters={historyFilters}
            setHistoryFilters={setHistoryFilters}
            historyRecords={historyRecords}
            historyPage={historyPage}
            setHistoryPage={setHistoryPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            headerSearch={headerSearch}
            handleOpenInternProfile={handleOpenInternProfile}
            archiveModal={archiveModal}
            setArchiveModal={setArchiveModal}
            renderPagination={renderPagination}
            departmentOptions={dropdownOptions.preferredDepartment}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            notifications={notifications}
            markNotificationRead={markNotificationRead}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
        {selectedProfileIntern && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
            <div className="glass-panel p-8 w-full max-w-2xl bg-white border-slate-800 text-left relative flex flex-col my-8">
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedProfileIntern(null);
                  setSelectedProfileDetails(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 cursor-pointer btn-icon"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-800 pb-3">Intern Profile Details</h3>

              {!selectedProfileDetails ? (
                <div className="flex items-center justify-center py-12">
                  <span className="text-slate-400 text-sm animate-pulse">Loading profile details...</span>
                </div>
              ) : (
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
                  {/* Profile Header */}
                  <div className="glass-panel p-6 bg-slate-100/50 border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-20 w-20 rounded-full overflow-hidden border border-slate-800 bg-slate-100 flex items-center justify-center shrink-0">
                      {selectedProfileDetails.picture ? (
                        <>
                          <img
                            src={`http://localhost:5000/uploads/pictures/${selectedProfileDetails.picture}`}
                            alt={`${selectedProfileDetails.firstName} ${selectedProfileDetails.lastName}`}
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
                      <h4 className="text-xl font-bold text-slate-100">{selectedProfileDetails.firstName} {selectedProfileDetails.lastName}</h4>
                      <p className="text-cyan-400 font-semibold text-sm">
                        {formatDepartment(selectedProfileIntern.department)} Intern
                      </p>
                      <div className="pt-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${selectedProfileIntern.isActive ? 'bg-emerald-950 text-emerald-400 border-emerald-800/20' : 'bg-red-950 text-red-400 border-red-800/20'}`}>
                          {selectedProfileIntern.isActive ? 'Active Intern' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="glass-panel p-5 bg-white border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block font-semibold">Email Address</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">CNIC / ID Number</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.cnic || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Date of Birth</span>
                        <span className="text-slate-100 font-medium">
                          {selectedProfileDetails.dob && selectedProfileDetails.dob !== 'N/A'
                            ? new Date(selectedProfileDetails.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Gender</span>
                        <span className="text-slate-100 font-medium capitalize">{selectedProfileDetails.gender?.toLowerCase()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Nationality</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.nationality}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Emergency Contact Number</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.emergencyContact}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-slate-500 block font-semibold">Home Address</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Profile */}
                  <div className="glass-panel p-5 bg-white border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Academic Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block font-semibold">Current Education</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.currentEducation || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Institute Name</span>
                        <span className="text-slate-100 font-medium">{selectedProfileDetails.instituteName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Program Details */}
                  <div className="glass-panel p-5 bg-white border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Internship Program Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block font-semibold">Assigned Department</span>
                        <span className="text-slate-100 font-medium">{formatDepartment(selectedProfileIntern.department)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Internship Mode</span>
                        <span className="text-slate-100 font-medium capitalize">
                          {selectedProfileDetails.internshipMode ? selectedProfileDetails.internshipMode.toLowerCase().replace('_', ' ') : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Internship Duration</span>
                        <span className="text-slate-100 font-medium">
                          {selectedProfileDetails.duration ? `${selectedProfileDetails.duration} Weeks` : '6 Weeks'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Internship Start Date</span>
                        <span className="text-slate-100 font-medium">
                          {selectedProfileIntern.createdAt && selectedProfileIntern.createdAt !== 'N/A'
                            ? new Date(selectedProfileIntern.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-semibold">Internship End Date</span>
                        <span className="text-slate-100 font-medium">
                          {selectedProfileIntern.endDate && selectedProfileIntern.endDate !== 'N/A'
                            ? new Date(selectedProfileIntern.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
