import { prisma } from '../db.js';

export const getDashboardStats = async (req, res) => {
  const { role, id: userId, department } = req.user;

  try {
    if (role === 'ADMIN') {
      // 1. Application stats by status
      const appStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'];
      const appCounts = await prisma.application.groupBy({
        by: ['status'],
        where: {
          isDeleted: false,
          NOT: {
            user: {
              OR: [
                { isActive: false },
                { historicalRecords: { some: {} } }
              ]
            }
          }
        },
        _count: { id: true }
      });
      const applications = {};
      appStatuses.forEach(status => {
        const found = appCounts.find(c => c.status === status);
        applications[status] = found ? found._count.id : 0;
      });
      applications.total = Object.values(applications).reduce((a, b) => a + b, 0);

      // 2. Active interns and active supervisors count
      const activeInterns = await prisma.user.count({
        where: { role: 'INTERN', isActive: true }
      });
      const activeSupervisors = await prisma.user.count({
        where: { role: 'SUPERVISOR', isActive: true }
      });

      // 3. Departments, their supervisors, and active intern count
      const dbDepts = await prisma.dropdownOption.findMany({
        where: { field: 'preferredDepartment' },
        select: { value: true }
      });
      const depts = dbDepts.length > 0 
        ? dbDepts.map(d => d.value) 
        : ['DEVELOPMENT', 'DEVOPS', 'AI_ML', 'SECURITY', 'NETWORKING'];

      const supervisors = await prisma.user.findMany({
        where: { role: 'SUPERVISOR', isActive: true }
      });
      const internCounts = await prisma.user.groupBy({
        by: ['department'],
        where: { role: 'INTERN', isActive: true },
        _count: { id: true }
      });

      const departmentDetails = depts.map(dept => {
        const supervisor = supervisors.find(s => s.department === dept);
        const internCount = internCounts.find(c => c.department === dept);
        return {
          department: dept,
          supervisorName: supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Unassigned',
          internCount: internCount ? internCount._count.id : 0
        };
      });

      // 4. Onboarding documents statuses
      const docStatuses = ['PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED'];
      const docCounts = await prisma.onboardingDocument.groupBy({
        by: ['status'],
        _count: { id: true }
      });
      const onboardingDocs = {};
      docStatuses.forEach(status => {
        const found = docCounts.find(c => c.status === status);
        onboardingDocs[status] = found ? found._count.id : 0;
      });

      // 5. Recent applications (latest 5)
      const recentApplications = await prisma.application.findMany({
        where: {
          isDeleted: false,
          NOT: {
            user: {
              OR: [
                { isActive: false },
                { historicalRecords: { some: {} } }
              ]
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // 6. Recent onboarding documents pending review
      const recentPendingDocs = await prisma.onboardingDocument.findMany({
        where: { status: 'UPLOADED' },
        include: {
          intern: {
            select: { firstName: true, lastName: true, department: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return res.status(200).json({
        status: 'success',
        data: {
          applications,
          activeInterns,
          activeSupervisors,
          departments: departmentDetails,
          onboardingDocs,
          recentApplications,
          recentPendingDocs
        }
      });
    }

    if (role === 'SUPERVISOR') {
      // 1. Total assigned interns
      const assignedInternsCount = await prisma.user.count({
        where: { department: department, role: 'INTERN', isActive: true }
      });

      // 2. Task reports counts by status for all interns in this supervisor's department
      const reportStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'];
      const reportCounts = await prisma.taskReport.groupBy({
        by: ['status'],
        where: {
          department: department
        },
        _count: { id: true }
      });
      const reports = {};
      reportStatuses.forEach(status => {
        const found = reportCounts.find(c => c.status === status);
        reports[status] = found ? found._count.id : 0;
      });
      reports.TOTAL = Object.values(reports).reduce((sum, count) => sum + Number(count || 0), 0);

      // 3. Projects and Tasks status breakdown
      const totalProjects = await prisma.project.count({
        where: { supervisorId: userId }
      });

      const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
      const taskCounts = await prisma.projectTask.groupBy({
        by: ['status'],
        where: {
          project: { supervisorId: userId }
        },
        _count: { id: true }
      });
      const tasks = {};
      taskStatuses.forEach(status => {
        const found = taskCounts.find(c => c.status === status);
        tasks[status] = found ? found._count.id : 0;
      });

      // 4. Intern progress list
      const internsList = await prisma.user.findMany({
        where: { department: department, role: 'INTERN', isActive: true },
        include: {
          taskReports: {
            where: { department: department },
            include: { roadmap: true }
          },
          assignedTasks: {
            where: { project: { supervisor: { department: department } } }
          },
          projects: {
            where: { supervisor: { department: department } }
          }
        }
      });

      const roadmaps = await prisma.trainingRoadmap.findMany({
        where: { department: department },
        include: {
          modules: {
            include: {
              subModules: {
                include: {
                  tasks: true
                }
              }
            }
          }
        }
      });

      const internProgress = internsList.map(intern => {
        const internReports = intern.taskReports;
        
        const roadmapProgress = roadmaps.map((r) => {
          const approvedCount = internReports.filter(
            (rep) => rep.roadmapId === r.id && rep.status === 'APPROVED'
          ).length;
          
          let totalTasks = 0;
          r.modules.forEach(mod => {
            mod.subModules.forEach(sub => {
              totalTasks += sub.tasks.length;
            });
          });

          return {
            title: r.title,
            approvedWeeks: approvedCount,
            totalWeeks: totalTasks,
            percentage: totalTasks > 0 ? Math.min(Math.round((approvedCount / totalTasks) * 100), 100) : 0
          };
        });

        if (roadmapProgress.length === 0) {
          const approvedCount = internReports.filter(
            (rep) => !rep.roadmapId && rep.status === 'APPROVED'
          ).length;
          roadmapProgress.push({
            title: "Default Training Roadmap",
            approvedWeeks: approvedCount,
            totalWeeks: 0,
            percentage: 0
          });
        }

        const sumApproved = roadmapProgress.reduce((sum, r) => sum + r.approvedWeeks, 0);
        const sumTotal = roadmapProgress.reduce((sum, r) => sum + r.totalWeeks, 0);
        const totalProgressPercentage = sumTotal > 0 ? Math.min(Math.round((sumApproved / sumTotal) * 100), 100) : 0;

        const latestReport = internReports.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || null;

        return {
          id: intern.id,
          name: `${intern.firstName} ${intern.lastName}`,
          department: intern.department,
          progressPercentage: totalProgressPercentage,
          progressString: `${sumApproved} / ${sumTotal} Tasks`,
          latestReportStatus: latestReport ? latestReport.status : 'None Submitted',
          pendingTasksCount: intern.assignedTasks.filter(t => t.status !== 'COMPLETED').length,
          completedTasksCount: intern.assignedTasks.filter(t => t.status === 'COMPLETED').length
        };
      });

      return res.status(200).json({
        status: 'success',
        data: {
          internsCount: assignedInternsCount,
          reports,
          totalProjects,
          tasks,
          internProgress
        }
      });
    }

    if (role === 'INTERN') {
      // 1. Department and Supervisor details
      let supervisorName = 'Unassigned';
      const supervisor = await prisma.user.findFirst({
        where: {
          role: 'SUPERVISOR',
          department: req.user.department,
          isActive: true
        },
        select: { firstName: true, lastName: true }
      });
      if (supervisor) {
        supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;
      }

      // 2. Onboarding documents status
      const requiredTypes = ['CV', 'ACADEMIC_TRANSCRIPT', 'EXPERIENCE_CERTIFICATE', 'CNIC_ID', 'PHOTO'];
      const docs = await prisma.onboardingDocument.findMany({
        where: { internId: userId }
      });
      const onboardingDocs = {};
      requiredTypes.forEach(type => {
        const found = docs.find(d => d.type === type);
        onboardingDocs[type] = found ? found.status : 'PENDING';
      });

      // 3. Task Reports status breakdown
      const reportStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'];
      const myReports = await prisma.taskReport.findMany({
        where: { internId: userId, department: department },
        include: { roadmap: true }
      });
      const reports = {};
      reportStatuses.forEach(status => {
        reports[status] = myReports.filter(r => r.status === status).length;
      });

      // 4. Roadmap progress metrics
      const roadmaps = await prisma.trainingRoadmap.findMany({
        where: { department: department },
        include: {
          modules: {
            include: {
              subModules: {
                include: {
                  tasks: true
                }
              }
            }
          }
        }
      });
      const roadmapProgress = roadmaps.map((r) => {
        const approvedCount = myReports.filter(
          (rep) => rep.roadmapId === r.id && rep.status === 'APPROVED'
        ).length;

        let totalTasks = 0;
        r.modules.forEach(mod => {
          mod.subModules.forEach(sub => {
            totalTasks += sub.tasks.length;
          });
        });

        return {
          title: r.title,
          approvedWeeks: approvedCount,
          totalWeeks: totalTasks,
          percentage: totalTasks > 0 ? Math.min(Math.round((approvedCount / totalTasks) * 100), 100) : 0
        };
      });

      if (roadmapProgress.length === 0) {
        const approvedCount = myReports.filter(
          (rep) => !rep.roadmapId && rep.status === 'APPROVED'
        ).length;
        roadmapProgress.push({
          title: "Default Training Roadmap",
          approvedWeeks: approvedCount,
          totalWeeks: 0,
          percentage: 0
        });
      }

      const sumApproved = roadmapProgress.reduce((sum, r) => sum + r.approvedWeeks, 0);
      const sumTotal = roadmapProgress.reduce((sum, r) => sum + r.totalWeeks, 0);
      const totalProgressPercentage = sumTotal > 0 ? Math.min(Math.round((sumApproved / sumTotal) * 100), 100) : 0;

      // 5. Assigned Tasks stats
      const myTasks = await prisma.projectTask.findMany({
        where: {
          assignedToId: userId,
          project: { supervisor: { department: department } }
        },
        include: { project: true }
      });
      const taskStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
      const tasks = {};
      taskStatuses.forEach(status => {
        tasks[status] = myTasks.filter(t => t.status === status).length;
      });

      // 6. Next urgent task due
      const incompleteTasks = myTasks
        .filter(t => t.status !== 'COMPLETED' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const nextTask = incompleteTasks[0] ? {
        title: incompleteTasks[0].title,
        projectName: incompleteTasks[0].project.name,
        dueDate: incompleteTasks[0].dueDate
      } : null;

      // 7. Recent supervisor feedback (latest 3 reports with non-null feedback)
      const recentFeedbackRaw = await prisma.taskReport.findMany({
        where: {
          internId: userId,
          feedback: { not: null },
          department: department
        },
        select: {
          feedback: true,
          updatedAt: true,
          task: {
            select: { title: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 3
      });

      const recentFeedback = recentFeedbackRaw.map(r => ({
        weekNumber: r.task?.title || 'Task Feedback',
        feedback: r.feedback,
        updatedAt: r.updatedAt
      }));

      return res.status(200).json({
        status: 'success',
        data: {
          department,
          supervisorName,
          onboardingDocs,
          reports,
          roadmapProgress: {
            progressPercentage: totalProgressPercentage,
            progressString: `${sumApproved} / ${sumTotal} Tasks`,
            details: roadmapProgress
          },
          tasks,
          nextTask,
          recentFeedback
        }
      });
    }

    return res.status(400).json({
      status: 'error',
      message: 'Invalid role for dashboard access.'
    });

  } catch (error) {
    console.error('[DASHBOARD STATS ERROR]:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};
