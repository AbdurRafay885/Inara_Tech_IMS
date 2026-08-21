import { prisma } from '../db.js';
import { notifyRoles } from '../utils/helpers.js';

export const archiveIntern = async (req, res) => {
  const { internId } = req.params;
  const { completionStatus } = req.body;

  try {
    // 1. Fetch complete internee profile, including relations
    const intern = await prisma.user.findUnique({
      where: { id: internId },
      include: {
        application: true,
        supervisor: true,
        documents: true,
        taskReports: {
          include: { supervisor: true, task: true },
        },
        projects: {
          include: {
            tasks: {
              where: { assignedToId: internId },
            },
          },
        },
      },
    });

    if (!intern || intern.role !== 'INTERN') {
      return res.status(404).json({
        status: 'error',
        message: 'Intern user profile not found.',
      });
    }

    if (!intern.department) {
      return res.status(400).json({
        status: 'error',
        message: 'Intern must be assigned to a department before archiving.',
      });
    }

    // 2. Extract CV (either from onboarding docs or application)
    const cvDoc = intern.documents.find((d) => d.type === 'CV');
    const cvFilename = cvDoc?.fileName || intern.application?.resumeFile || null;

    // 3. Serialize Task Reports
    const weeklyReportsSnapshot = intern.taskReports.map((report) => ({
      taskTitle: report.task.title,
      workCompleted: report.workCompleted,
      challengesFaced: report.challengesFaced,
      attachment: report.attachment,
      status: report.status,
      feedback: report.feedback,
      reviewedBy: report.supervisor
        ? `${report.supervisor.firstName} ${report.supervisor.lastName}`
        : null,
      submittedAt: report.createdAt,
    }));

    // 4. Serialize Projects and Tasks
    const projectsSnapshot = intern.projects.map((project) => ({
      projectName: project.name,
      description: project.description,
      tasks: project.tasks.map((task) => ({
        title: task.title,
        description: task.description,
        status: task.status,
        deliverable: task.deliverable,
        dueDate: task.dueDate,
      })),
    }));

    const internshipYear = new Date(intern.createdAt).getFullYear();
    const supervisorName = intern.supervisor
      ? `${intern.supervisor.firstName} ${intern.supervisor.lastName}`
      : null;

    // 5. Create Historical Record
    const record = await prisma.historicalRecord.create({
      data: {
        userId: internId,
        internName: `${intern.firstName} ${intern.lastName}`,
        internEmail: intern.email,
        internshipYear,
        department: intern.department,
        supervisorName,
        completionStatus,
        cv: cvFilename,
        weeklyReports: weeklyReportsSnapshot,
        projects: projectsSnapshot,
      },
    });

    // 6. Deactivate Portal Access (Business Rule)
    await prisma.user.update({
      where: { id: internId },
      data: { isActive: false },
    });

    // Notify intern, supervisor, and admins
    await notifyRoles({
      roles: ['ADMIN', 'SUPERVISOR', 'INTERN'],
      userId: internId,
      title: 'Internship Archived',
      message: `Internship for ${intern.firstName} ${intern.lastName} has been archived with status "${completionStatus}". Portal access is deactivated.`,
      type: 'APPLICATION_STATUS_UPDATE',
      excludeUserId: req.user?.id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Intern successfully archived. Portal access deactivated.',
      data: record,
    });
  } catch (error) {
    console.error('Archive intern error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while archiving the intern.',
    });
  }
};

export const getRecords = async (req, res) => {
  const { role, department: userDepartment } = req.user;
  const { department, year, supervisor, search } = req.query;

  try {
    const where = {};

    // Supervisors can only access archived records from their own department.
    if (role === 'SUPERVISOR') {
      where.department = userDepartment;
    }

    if (role === 'ADMIN' && department) where.department = department;
    if (year) where.internshipYear = parseInt(year);
    if (supervisor) {
      where.supervisorName = { contains: supervisor };
    }

    if (search) {
      where.OR = [
        { internName: { contains: search } },
        { internEmail: { contains: search } },
      ];
    }

    const records = await prisma.historicalRecord.findMany({
      where,
      include: {
        user: {
          select: {
            applicationId: true,
            createdAt: true,
            endDate: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      results: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Get historical records error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while fetching historical records.',
    });
  }
};
