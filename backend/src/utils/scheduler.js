import { prisma } from '../db.js';
import { sendEmail } from './mailer.js';
import { notifyRoles } from './helpers.js';

export const checkInternshipsEndingTomorrow = async () => {
  try {
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const interns = await prisma.user.findMany({
      where: {
        role: 'INTERN',
        isActive: true,
        endDate: {
          gte: startOfTomorrow,
          lte: endOfTomorrow,
        },
      },
    });

    console.log(`[scheduler]: Found ${interns.length} internship(s) ending tomorrow.`);

    for (const intern of interns) {
      await sendEmail({
        to: intern.email,
        subject: 'Internship Ending Tomorrow - Inara Technologies',
        text: `Hello ${intern.firstName} ${intern.lastName},\n\nThis is to notify you that your internship at Inara Technologies is completing tomorrow, on ${new Date(intern.endDate).toLocaleDateString()}.\n\nThank you for your hard work, dedication, and valuable contributions throughout your duration!\n\nBest regards,\nHR Team\nInara Technologies`,
      });
    }
  } catch (error) {
    console.error('[scheduler ERROR]: Failed to check ending internships:', error);
  }
};

export const autoArchiveExpiredInternships = async () => {
  try {
    const now = new Date();
    const expiredInterns = await prisma.user.findMany({
      where: {
        role: 'INTERN',
        isActive: true,
        endDate: {
          lt: now
        }
      },
      include: {
        application: true,
        supervisor: true,
        documents: true,
        taskReports: {
          include: { supervisor: true, task: true },
        },
        projects: {
          include: {
            tasks: true
          }
        }
      }
    });

    console.log(`[scheduler]: Found ${expiredInterns.length} expired internship(s) to auto-archive.`);

    for (const intern of expiredInterns) {
      console.log(`[scheduler]: Auto-archiving expired internship for ${intern.firstName} ${intern.lastName} (ID: ${intern.id})`);

      const cvDoc = intern.documents.find((d) => d.type === 'CV');
      const cvFilename = cvDoc?.fileName || intern.application?.resumeFile || null;

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

      const projectsSnapshot = intern.projects.map((project) => ({
        projectName: project.name,
        description: project.description,
        tasks: project.tasks
          .filter((t) => t.assignedToId === intern.id)
          .map((task) => ({
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

      // 1. Create Historical Record
      await prisma.historicalRecord.create({
        data: {
          userId: intern.id,
          internName: `${intern.firstName} ${intern.lastName}`,
          internEmail: intern.email,
          internshipYear,
          department: intern.department,
          supervisorName,
          completionStatus: 'Completed',
          cv: cvFilename,
          weeklyReports: weeklyReportsSnapshot,
          projects: projectsSnapshot,
        },
      });

      // 2. Deactivate Portal Access (isActive: false)
      await prisma.user.update({
        where: { id: intern.id },
        data: { isActive: false },
      });

      // 3. Send email to the internee
      await sendEmail({
        to: intern.email,
        subject: 'Internship Completed & Portal Account Archived',
        text: `Hello ${intern.firstName} ${intern.lastName},\n\nYour internship at Inara Technologies has completed. Your portal account has been archived, and portal access has been deactivated.\n\nThank you for your dedication, hard work, and contributions!\n\nBest regards,\nHR Team\nInara Technologies`,
      });

      // 4. Send notification to admin
      await notifyRoles({
        roles: ['ADMIN'],
        title: 'Internship Auto-Archived',
        message: `Internship for ${intern.firstName} ${intern.lastName} has been automatically archived (end date passed). Portal access is deactivated.`,
        type: 'APPLICATION_STATUS_UPDATE',
      });
    }
  } catch (error) {
    console.error('[scheduler ERROR]: Failed to auto-archive expired internships:', error);
  }
};

// Start background scheduler
export const startScheduler = () => {
  // Run once immediately on startup (with a 5 second delay to let server initialize)
  setTimeout(() => {
    console.log('[scheduler]: Running initial check for internships ending tomorrow...');
    checkInternshipsEndingTomorrow();
    console.log('[scheduler]: Running initial check for expired internships...');
    autoArchiveExpiredInternships();
  }, 5000);

  // Then run every 24 hours
  setInterval(() => {
    console.log('[scheduler]: Running daily check for internships ending tomorrow...');
    checkInternshipsEndingTomorrow();
    console.log('[scheduler]: Running daily check for expired internships...');
    autoArchiveExpiredInternships();
  }, 24 * 60 * 60 * 1000);
};
