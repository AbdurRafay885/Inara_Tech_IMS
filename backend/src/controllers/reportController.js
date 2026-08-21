import { prisma } from '../db.js';
import { notifyRoles } from '../utils/helpers.js';
import path from 'path';

export const submitReport = async (req, res) => {
  const { taskId, workCompleted, challengesFaced } = req.body;
  const internId = req.user.id;

  try {
    // 1. Fetch internee profile and task details
    const internee = await prisma.user.findUnique({
      where: { id: internId },
      select: { firstName: true, lastName: true, department: true, supervisorId: true },
    });

    if (!internee) {
      return res.status(404).json({
        status: 'error',
        message: 'Intern profile not found.',
      });
    }

    const task = await prisma.practicalTask.findUnique({
      where: { id: taskId },
      include: {
        subModule: {
          include: {
            module: {
              include: {
                roadmap: true
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Practical task not found.',
      });
    }

    const roadmap = task.subModule.module.roadmap;

    // 2. Check if a report for this task already exists
    const existingReport = await prisma.taskReport.findFirst({
      where: {
        internId,
        taskId,
      },
    });

    const attachmentFilename = req.file ? req.file.filename : (existingReport ? existingReport.attachment : null);

    if (!attachmentFilename) {
      return res.status(400).json({
        status: 'error',
        message: 'Uploading an attachment report file (PDF/Doc) is mandatory for this task.',
      });
    }

    if (existingReport) {
      if (existingReport.status !== 'CHANGES_REQUESTED') {
        return res.status(400).json({
          status: 'error',
          message: `You have already submitted a report for the task "${task.title}".`,
        });
      }

      const updatedReport = await prisma.taskReport.update({
        where: { id: existingReport.id },
        data: {
          workCompleted,
          challengesFaced,
          attachment: attachmentFilename,
          status: 'SUBMITTED',
          department: internee.department,
        },
      });

      // Notify intern and supervisor of the update
      await notifyRoles({
        roles: ['SUPERVISOR', 'INTERN'],
        userId: internId,
        department: internee.department,
        title: 'Task Report Resubmitted',
        message: `Intern ${internee.firstName} ${internee.lastName} resubmitted report for task: "${task.title}".`,
        type: 'WEEKLY_REPORT_FEEDBACK',
        excludeUserId: req.user?.id,
      });

      return res.status(200).json({
        status: 'success',
        message: 'Task report updated and resubmitted successfully.',
        data: updatedReport,
      });
    }

    // 3. Create the task report
    const report = await prisma.taskReport.create({
      data: {
        workCompleted,
        challengesFaced,
        attachment: attachmentFilename,
        status: 'SUBMITTED',
        internId,
        supervisorId: internee.supervisorId || null,
        roadmapId: roadmap.id,
        taskId,
        department: internee.department,
      },
    });

    // Notify intern and supervisor
    await notifyRoles({
      roles: ['SUPERVISOR', 'INTERN'],
      userId: internId,
      department: internee.department,
      title: 'New Task Report Submitted',
      message: `Intern ${internee.firstName} ${internee.lastName} submitted report for task: "${task.title}".`,
      type: 'WEEKLY_REPORT_FEEDBACK',
      excludeUserId: req.user?.id,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Task report submitted successfully.',
      data: report,
    });
  } catch (error) {
    console.error('Submit report error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while submitting the task report.',
    });
  }
};

export const getReports = async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;
  const { internId, status } = req.query;

  try {
    const where = {};
    if (status) where.status = status;

    if (role === 'INTERN') {
      where.internId = userId;
    } else {
      where.intern = { isActive: true };
      if (role === 'SUPERVISOR') {
        if (internId) {
          where.internId = internId;
        }
        where.department = req.user.department;
      } else if (role === 'ADMIN') {
        if (internId) where.internId = internId;
      }
    }

    const reports = await prisma.taskReport.findMany({
      where,
      include: {
        intern: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            durationHours: true,
            subModule: {
              select: {
                title: true,
                module: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        },
        roadmap: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching reports.',
    });
  }
};

export const reviewReport = async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  try {
    const report = await prisma.taskReport.findUnique({
      where: { id },
      include: {
        task: { select: { title: true } }
      }
    });
    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Task report not found.',
      });
    }

    const updatedReport = await prisma.taskReport.update({
      where: { id },
      data: {
        status,
        feedback,
      },
    });

    // Notify the intern of feedback
    const message = status === 'APPROVED'
      ? `Your report for task "${report.task.title}" has been approved by your supervisor.`
      : `Your report for task "${report.task.title}" requires modifications. Feedback: ${feedback || 'No comments'}`;

    await notifyRoles({
      roles: ['SUPERVISOR', 'INTERN'],
      userId: report.internId,
      title: `Task Report: ${status}`,
      message,
      type: 'WEEKLY_REPORT_FEEDBACK',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Report review submitted successfully.',
      data: updatedReport,
    });
  } catch (error) {
    console.error('Review report error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while reviewing the report.',
    });
  }
};

export const getProgress = async (req, res) => {
  let internId = req.params.internId;

  if (!internId && req.user.role === 'INTERN') {
    internId = req.user.id;
  }

  if (!internId) {
    return res.status(400).json({
      status: 'error',
      message: 'Intern ID is required.',
    });
  }

  try {
    const intern = await prisma.user.findUnique({
      where: { id: internId },
      select: { department: true }
    });

    if (!intern || !intern.department) {
      return res.status(404).json({
        status: 'error',
        message: 'Intern has no assigned department.',
      });
    }

    // Get the dynamic roadmap for this department
    const roadmap = await prisma.trainingRoadmap.findFirst({
      where: { department: intern.department },
      include: {
        modules: {
          include: {
            subModules: {
              include: {
                tasks: {
                  orderBy: { createdAt: 'asc' }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!roadmap) {
      return res.status(200).json({
        status: 'success',
        data: {
          internId,
          roadmapProgress: [],
          approvedWeeks: 0,
          totalWeeks: 0,
          remainingWeeks: 0,
          progressPercentage: 0,
          progressString: '0 / 0 Tasks Completed',
          remarks: [],
        }
      });
    }

    // Fetch task reports for this intern
    const reports = await prisma.taskReport.findMany({
      where: { internId },
      include: {
        task: true
      }
    });

    const approvedReports = reports.filter(r => r.status === 'APPROVED');
    const approvedTasksCount = approvedReports.length;

    // Extract all tasks
    const allTasks = [];
    const roadmapProgress = [];

    let totalWeeksExpected = 0;
    
    roadmap.modules.forEach((mod, modIdx) => {
      let moduleHours = 0;
      let moduleApprovedCount = 0;
      let moduleTotalTasks = 0;

      mod.subModules.forEach((sub) => {
        sub.tasks.forEach((task) => {
          allTasks.push(task);
          moduleHours += task.durationHours;
          moduleTotalTasks += 1;
          
          const isApproved = approvedReports.some(r => r.taskId === task.id);
          if (isApproved) {
            moduleApprovedCount += 1;
          }
        });
      });

      // Calculate modules display duration in weeks: 40 hours = 1 week
      const moduleWeeks = Math.max(0.5, Math.round((moduleHours / 40) * 10) / 10);
      totalWeeksExpected += moduleWeeks;

      roadmapProgress.push({
        roadmapId: roadmap.id,
        index: modIdx + 1,
        title: mod.title,
        approvedWeeks: moduleApprovedCount, // map approved count to frontend expectations
        totalWeeks: moduleTotalTasks,       // map total count to frontend expectations
        weeksExpected: moduleWeeks,
        remainingWeeks: Math.max(0, moduleTotalTasks - moduleApprovedCount),
        progressPercentage: moduleTotalTasks > 0 ? Math.min(Math.round((moduleApprovedCount / moduleTotalTasks) * 100), 100) : 0,
      });
    });

    const totalTasksCount = allTasks.length;
    const progressPercentage = totalTasksCount > 0 ? Math.min(Math.round((approvedTasksCount / totalTasksCount) * 100), 100) : 0;

    // Fetch supervisor feedback comments
    const reportsWithFeedback = reports.filter(r => r.feedback !== null);

    return res.status(200).json({
      status: 'success',
      data: {
        internId,
        roadmapProgress,
        approvedWeeks: approvedTasksCount, // mapping approvedTasksCount for backward compatibility
        totalWeeks: totalTasksCount,
        remainingWeeks: Math.max(0, totalTasksCount - approvedTasksCount),
        progressPercentage,
        progressString: `${approvedTasksCount} / ${totalTasksCount} Tasks Completed`,
        remarks: reportsWithFeedback.map(r => ({
          weekNumber: r.task.title, // map task name to weekNumber field for compatibility
          feedback: r.feedback,
          status: r.status,
          updatedAt: r.updatedAt,
          supervisor: r.supervisor
        })),
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching internship progress.',
    });
  }
};

export const downloadReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await prisma.taskReport.findUnique({
      where: { id },
      include: {
        intern: { select: { firstName: true, lastName: true } },
        task: { select: { title: true } }
      },
    });

    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Task report not found.',
      });
    }

    if (req.user.role === 'INTERN' && report.internId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only download your own reports.',
      });
    }

    if (!report.attachment) {
      return res.status(404).json({
        status: 'error',
        message: 'No attachment found for this report.',
      });
    }

    const ext = path.extname(report.attachment) || '.pdf';
    const fullName = `${report.intern.firstName}_${report.intern.lastName}`;
    const cleanName = fullName.replace(/\s+/g, '_');
    const taskName = report.task.title.replace(/\s+/g, '_');
    const customFileName = `${cleanName}_Task_${taskName}_Report${ext}`;

    const filePath = path.join(process.cwd(), 'uploads', 'reports', report.attachment);
    return res.download(filePath, customFileName);
  } catch (error) {
    console.error('Download report error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while downloading the report.',
    });
  }
};
