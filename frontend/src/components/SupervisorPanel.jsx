import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Search,
  Users,
  ClipboardList,
  CheckSquare,
  Map,
  Briefcase,
  History,
  Bell,
  LayoutDashboard,
  Send,
  Clock,
  PlayCircle,
  FileText,
  Download
} from 'lucide-react';

import DashboardTab from './supervisor/DashboardTab';
import InternsTab from './supervisor/InternsTab';
import ReviewTab from './supervisor/ReviewTab';
import ProjectsTab from './supervisor/ProjectsTab';
import RoadmapTab from './supervisor/RoadmapTab';
import RecordsTab from './supervisor/RecordsTab';
import AlertsTab from './supervisor/AlertsTab';
import { formatDepartment } from '../utils/formatDepartment';

const SupervisorPanel = () => {
  const { tab: activeTab } = useParams();
  const navigate = useNavigate();
  const { notifications, markNotificationRead, fetchNotifications, user } = useAuth();

  // Interns list
  const [dashboardStats, setDashboardStats] = useState(null);
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [internProgress, setInternProgress] = useState(null);
  const [selectedProfileIntern, setSelectedProfileIntern] = useState(null);
  const [selectedProfileDetails, setSelectedProfileDetails] = useState(null);
  const [internPage, setInternPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [headerSearch, setHeaderSearch] = useState('');
  const [archiveForm, setArchiveForm] = useState({ completionStatus: 'Completed' });

  // Weekly Reports
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [expandedInternReports, setExpandedInternReports] = useState({});
  const [selectedReviewRoadmaps, setSelectedReviewRoadmaps] = useState({});
  const [completionStatuses, setCompletionStatuses] = useState({});

  // Project Management
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', referenceFile: null });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', dueTime: '', assignedToId: '' });
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [membersToAdd, setMembersToAdd] = useState([]);
  const [memberToAddId, setMemberToAddId] = useState('');

  // Group Management
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [groupMembers, setGroupMembers] = useState([]);

  // Training roadmap
  const [roadmapFile, setRoadmapFile] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [roadmapForm, setRoadmapForm] = useState({ title: '', durationWeeks: '' });
  const [editingRoadmap, setEditingRoadmap] = useState(null);

  // History search
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({ search: '', year: '', department: '' });
  const [archiveModal, setArchiveModal] = useState(null);
  const [membersModalProject, setMembersModalProject] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [dropdownOptions, setDropdownOptions] = useState({
    preferredDepartment: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await api.get('/dropdowns');
        setDropdownOptions(res.data.data);
      } catch (err) {
        console.error('Failed to load dropdown options in SupervisorPanel:', err);
      }
    };
    fetchOptions();
  }, []);

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
  }, [activeTab, historyFilters]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyFilters]);

  useEffect(() => {
    setInternPage(1);
    setReviewPage(1);
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
      } else if (activeTab === 'interns') {
        const response = await api.get('/onboarding/interns');
        setInterns(response.data.data);
        const reportsResponse = await api.get('/reports');
        setReports(reportsResponse.data.data);
        try {
          const roadmapResponse = await api.get('/training/roadmap');
          setRoadmaps(roadmapResponse.data.data || []);
        } catch (err) {
          setRoadmaps([]);
        }
      } else if (activeTab === 'review') {
        const response = await api.get('/reports');
        setReports(response.data.data);
        const internResponse = await api.get('/onboarding/interns');
        setInterns(internResponse.data.data);
        try {
          const roadmapResponse = await api.get('/training/roadmap');
          setRoadmaps(roadmapResponse.data.data || []);
        } catch (err) {
          setRoadmaps([]);
        }
      } else if (activeTab === 'projects') {
        const response = await api.get('/projects');
        setProjects(response.data.data);
        // Also load interns list to populate project assignment selector
        const internResponse = await api.get('/onboarding/interns');
        setInterns(internResponse.data.data);
      } else if (activeTab === 'roadmap') {
        try {
          const response = await api.get('/training/roadmap');
          setRoadmaps(response.data.data || []);
        } catch (err) {
          // 404 is acceptable if no roadmap is uploaded yet
          if (err.response?.status !== 404) throw err;
          setRoadmaps([]);
        }
      } else if (activeTab === 'records') {
        const query = new URLSearchParams(historyFilters).toString();
        const response = await api.get(`/records?${query}`);
        setHistoryRecords(response.data.data);
      } else if (activeTab === 'alerts') {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (!isBackground) {
        setErrorMsg('Failed to fetch data.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const handleFetchProgress = async (intern) => {
    setSelectedIntern(intern);
    setInternProgress(null);
    try {
      setLoading(true);
      const response = await api.get(`/reports/progress/${intern.id}`);
      setInternProgress(response.data.data);
    } catch (err) {
      setErrorMsg('Failed to calculate intern progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveIntern = async (e) => {
    e.preventDefault();
    if (!selectedIntern) return;

    try {
      setLoading(true);
      await api.post(`/records/archive/${selectedIntern.id}`, archiveForm);
      setSuccessMsg(`Intern ${selectedIntern.firstName} has been successfully archived. Portal access deactivated.`);
      setSelectedIntern(null);
      setInternProgress(null);
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to archive intern.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (report, status) => {
    try {
      setLoading(true);
      const feedback = feedbackInputs[report.id] || '';
      await api.patch(`/reports/${report.id}/review`, {
        status,
        feedback
      });
      setSuccessMsg(`Report for Week ${report.weekNumber} ${status.toLowerCase()} successfully.`);
      setFeedbackInputs(prev => {
        const copy = { ...prev };
        delete copy[report.id];
        return copy;
      });
      setSelectedReport(null);
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report review.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveInternInline = async (internId) => {
    try {
      setLoading(true);
      const completionStatus = completionStatuses[internId] || 'Completed';
      await api.post(`/records/archive/${internId}`, { completionStatus });
      setSuccessMsg('Intern successfully archived. Portal access deactivated.');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to archive intern.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandInternReports = (id) => {
    setExpandedInternReports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getInternProgress = (internId) => {
    const internReports = reports.filter(r => r.internId === internId);

    // Calculate progress per roadmap
    const roadmapProgress = roadmaps.map((r, index) => {
      const approvedCount = internReports.filter(
        (rep) => rep.roadmapId === r.id && rep.status === 'APPROVED'
      ).length;
      
      let totalTasks = 0;
      if (r.modules) {
        r.modules.forEach(mod => {
          if (mod.subModules) {
            mod.subModules.forEach(sub => {
              if (sub.tasks) {
                totalTasks += sub.tasks.length;
              }
            });
          }
        });
      }

      const total = totalTasks || 1;

      return {
        roadmapId: r.id,
        title: r.title,
        index: index + 1,
        approvedWeeks: approvedCount,
        totalWeeks: totalTasks,
        remainingWeeks: Math.max(0, totalTasks - approvedCount),
        progressPercentage: Math.min(Math.round((approvedCount / total) * 100), 100),
      };
    });

    if (roadmapProgress.length === 0) {
      const approvedCount = internReports.filter(
        (rep) => !rep.roadmapId && rep.status === 'APPROVED'
      ).length;
      roadmapProgress.push({
        roadmapId: null,
        title: "Default Training Roadmap",
        index: 1,
        approvedWeeks: approvedCount,
        totalWeeks: 0,
        remainingWeeks: 0,
        progressPercentage: 0,
      });
    }

    const sumApproved = roadmapProgress.reduce((sum, r) => sum + r.approvedWeeks, 0);
    const sumTotal = roadmapProgress.reduce((sum, r) => sum + r.totalWeeks, 0);

    return {
      percentage: sumTotal > 0 ? Math.min(Math.round((sumApproved / sumTotal) * 100), 100) : 0,
      progressString: `${sumApproved} / ${sumTotal} Tasks Completed`,
      remainingWeeks: Math.max(0, sumTotal - sumApproved),
      roadmapProgress,
    };
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append('name', projectForm.name);
      payload.append('description', projectForm.description);
      if (projectForm.referenceFile) {
        payload.append('referenceFile', projectForm.referenceFile);
      }

      const createRes = await api.post('/projects', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const createdProjectId = createRes.data?.data?.id;
      if (createdProjectId && membersToAdd.length > 0) {
        await api.post(`/projects/${createdProjectId}/members`, {
          memberIds: membersToAdd
        });
      }

      setSuccessMsg(createdProjectId && membersToAdd.length > 0
        ? 'Project created and members added successfully.'
        : 'Project created successfully.');
      setProjectForm({ name: '', description: '', referenceFile: null });
      setMembersToAdd([]);
      setMemberToAddId('');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = () => {
    if (!memberToAddId) {
      setErrorMsg('Please select an intern to add.');
      return;
    }

    if (membersToAdd.includes(memberToAddId)) {
      setErrorMsg('This intern is already selected.');
      return;
    }

    setMembersToAdd((prev) => [...prev, memberToAddId]);
    setMemberToAddId('');
    setErrorMsg('');
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      const payload = { ...taskForm };
      if (payload.dueDate) {
        const dueTime = payload.dueTime || '00:00';
        payload.dueDate = new Date(`${payload.dueDate}T${dueTime}`).toISOString();
      } else {
        delete payload.dueDate;
      }
      delete payload.dueTime;

      await api.post(`/projects/${selectedProjectId}/tasks`, payload);
      setSuccessMsg('Task assigned successfully.');
      setTaskForm({ title: '', description: '', dueDate: '', dueTime: '', assignedToId: '' });
      setSelectedProjectId('');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to assign task.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRoadmap = async (title, modules) => {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/training/roadmap', { title, modules });
      setSuccessMsg('Department training roadmap updated successfully.');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update roadmap.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;

    try {
      setLoading(true);
      await api.delete(`/training/roadmap/${id}`);
      setSuccessMsg('Roadmap deleted successfully.');
      fetchTabContent();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const PAGE_META = {
    dashboard: {
      icon: LayoutDashboard,
      title: 'Dashboard',
      tagline: 'Team overview, task status and weekly progress stats',
      searchPlaceholder: '',
    },
    interns: {
      icon: Users,
      title: 'My Interns',
      tagline: 'Manage and track your assigned interns and their progress',
      searchPlaceholder: 'Search by name or department...',
    },
    reports: {
      icon: ClipboardList,
      title: 'Weekly Reports',
      tagline: 'Review and provide feedback on intern progress reports',
      searchPlaceholder: 'Search reports...',
    },
    review: {
      icon: CheckSquare,
      title: 'Task Reviews',
      tagline: 'Evaluate and review intern task submissions and deliverables',
      searchPlaceholder: 'Search intern by name or email...',
    },
    roadmap: {
      icon: Map,
      title: 'Training Roadmaps',
      tagline: 'Create and manage structured training roadmaps for your interns',
      searchPlaceholder: 'Search modules, sub-modules, tasks...',
    },
    projects: {
      icon: Briefcase,
      title: 'Project Workspace',
      tagline: 'Create projects, assign members, and manage intern task delivery',
      searchPlaceholder: '',
    },
    records: {
      icon: History,
      title: 'Archived Interns',
      tagline: 'Browse records of past and archived internships under your supervision',
      searchPlaceholder: 'Search by name or department...',
    },
    alerts: {
      icon: Bell,
      title: 'Notifications',
      tagline: 'Review all system updates and alerts for your panel',
      searchPlaceholder: 'Search alerts...',
    },
  };

  const renderPageHeader = () => {
    const meta = PAGE_META[activeTab];
    if (!meta) return null;
    const Icon = meta.icon;
    const showSearch = ['interns', 'records', 'roadmap', 'review'].includes(activeTab);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center shadow-sm border border-indigo-100 shrink-0">
            <Icon className="h-6 w-6 text-indigo-600" />
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
                onChange={(e) => { setHeaderSearch(e.target.value); setInternPage(1); setHistoryPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
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
                            navigate('/supervisor/alerts');
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
                        navigate('/supervisor/alerts');
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
          <DashboardTab dashboardStats={dashboardStats} navigate={navigate} />
        )}

        {activeTab === 'interns' && (
          <InternsTab
            headerSearch={headerSearch}
            interns={interns}
            internPage={internPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            getInternProgress={getInternProgress}
            getDeptBadgeClass={getDeptBadgeClass}
            handleOpenInternProfile={handleOpenInternProfile}
            handleArchiveInternInline={handleArchiveInternInline}
            completionStatuses={completionStatuses}
            setCompletionStatuses={setCompletionStatuses}
            renderPagination={renderPagination}
            setInternPage={setInternPage}
          />
        )}        
        
        {activeTab === 'review' && (
          <ReviewTab
            reports={reports}
            interns={interns}
            getInternProgress={getInternProgress}
            selectedReviewRoadmaps={selectedReviewRoadmaps}
            setSelectedReviewRoadmaps={setSelectedReviewRoadmaps}
            setSelectedReport={setSelectedReport}
            roadmaps={roadmaps}
            searchQuery={headerSearch}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            handleCreateProject={handleCreateProject}
            projectForm={projectForm}
            setProjectForm={setProjectForm}
            memberToAddId={memberToAddId}
            setMemberToAddId={setMemberToAddId}
            interns={interns}
            membersToAdd={membersToAdd}
            setMembersToAdd={setMembersToAdd}
            handleAddMembers={handleAddMembers}
            handleAssignTask={handleAssignTask}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            projects={projects}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            membersModalProject={membersModalProject}
            setMembersModalProject={setMembersModalProject}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapTab
            handleUploadRoadmap={handleUploadRoadmap}
            loading={loading}
            roadmaps={roadmaps}
            handleDeleteRoadmap={handleDeleteRoadmap}
            user={user}
            searchQuery={headerSearch}
          />
        )}

        {activeTab === 'records' && (
          <RecordsTab
            historyFilters={historyFilters}
            setHistoryFilters={setHistoryFilters}
            historyRecords={historyRecords}
            historyPage={historyPage}
            setHistoryPage={setHistoryPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
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
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
            <div className="glass-panel p-8 w-full max-w-2xl bg-white border-slate-200 text-left relative flex flex-col my-8 shadow-2xl rounded-2xl">
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedReport(null);
                }}
                className="absolute top-2 right-4 cursor-pointer modal-close-btn select-none"
              >
                &times;
              </button>

              <h3 className="text-xl font-bold text-slate-950 mb-6 border-b border-slate-200 pb-3">Task Report Details</h3>

              <div className="space-y-6">
                {/* Header info */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cyan-800 font-extrabold text-lg">Task: {selectedReport.task.title}</span>
                    {selectedReport.roadmap && (
                      <span className="text-xs bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-md font-bold">
                        {selectedReport.roadmap.title}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-md text-xs font-extrabold border w-fit ${selectedReport.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : selectedReport.status === 'CHANGES_REQUESTED' ? 'bg-amber-50 text-amber-800 border-amber-300' : selectedReport.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                    {selectedReport.status}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <span className="text-slate-950 font-extrabold block text-sm mb-1">Work Completed</span>
                  <p className="text-slate-950 text-base leading-relaxed font-normal">{selectedReport.workCompleted}</p>
                </div>

                {selectedReport.challengesFaced && (
                  <div>
                    <span className="text-slate-950 font-extrabold block text-sm mb-1">Challenges Faced</span>
                    <p className="text-slate-950 text-base leading-relaxed font-normal">{selectedReport.challengesFaced}</p>
                  </div>
                )}

                {selectedReport.attachment && (
                  <div>
                    <span className="text-slate-950 font-extrabold block text-sm mb-1">Attachment</span>
                    <a
                      href={`http://localhost:5000/api/reports/download/${selectedReport.id}?token=${localStorage.getItem('token')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:underline font-extrabold text-sm mt-1"
                    >
                      <Download className="h-4 w-4 text-red-600" />
                      Download Attachment
                    </a>
                  </div>
                )}

                {/* Review feedback/actions */}
                {selectedReport.status === 'APPROVED' ? (
                  selectedReport.feedback && (
                    <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-cyan-900 text-sm font-bold mt-1">
                      Feedback: "{selectedReport.feedback}"
                    </div>
                  )
                ) : (
                  <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200">
                    <span className="text-slate-950 font-extrabold block text-sm">Feedback & Remarks</span>
                    <input
                      type="text"
                      placeholder="Supervisor review remarks / feedback..."
                      className="glass-input py-2.5 px-3 text-sm text-slate-950 placeholder:text-slate-500 border border-slate-300 bg-white"
                      value={feedbackInputs[selectedReport.id] || ''}
                      onChange={(e) => setFeedbackInputs(prev => ({ ...prev, [selectedReport.id]: e.target.value }))}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleReviewReport(selectedReport, 'APPROVED')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold py-2.5 px-4 text-sm flex-1 rounded-lg cursor-pointer transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewReport(selectedReport, 'CHANGES_REQUESTED')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-2.5 px-4 text-sm flex-1 rounded-lg cursor-pointer transition-colors"
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorPanel;
