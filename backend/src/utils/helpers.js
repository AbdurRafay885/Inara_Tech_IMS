import { prisma } from '../db.js';
import { sendEmail } from './mailer.js';

/**
 * Creates an in-app system notification and sends an email copy to the user.
 */
export const createNotification = async ({ userId, title, message, type }) => {
  try {
    // 1. Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Silent fail so primary controller actions aren't interrupted
    return null;
  }
};

/**
 * Broadcasts a notification to multiple roles (INTERN, SUPERVISOR, ADMIN).
 * - ADMIN: Notifies all administrators.
 * - SUPERVISOR: Notifies the specific supervisor of the given userId (if any),
 *               and/or all supervisors in the given department.
 * - INTERN: Notifies the specific intern (userId), and/or all interns in the given department.
 */
export const notifyRoles = async ({ roles, department, userId, title, message, type, excludeUserId }) => {
  try {
    const userIdsToNotify = new Set();

    for (const role of roles) {
      if (role === 'ADMIN') {
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });
        admins.forEach((admin) => userIdsToNotify.add(admin.id));
      } else if (role === 'SUPERVISOR') {
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { supervisorId: true, department: true },
          });
          if (user?.supervisorId) {
            userIdsToNotify.add(user.supervisorId);
          }
          if (user?.department) {
            const supervisors = await prisma.user.findMany({
              where: { role: 'SUPERVISOR', department: user.department },
              select: { id: true },
            });
            supervisors.forEach((sup) => userIdsToNotify.add(sup.id));
          }
        }
        if (department) {
          const supervisors = await prisma.user.findMany({
            where: { role: 'SUPERVISOR', department },
            select: { id: true },
          });
          supervisors.forEach((sup) => userIdsToNotify.add(sup.id));
        }
      } else if (role === 'INTERN') {
        if (userId) {
          // Verify if user is an intern
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          if (user && user.role === 'INTERN') {
            userIdsToNotify.add(userId);
          }
        }
        if (department) {
          const interns = await prisma.user.findMany({
            where: { role: 'INTERN', department },
            select: { id: true },
          });
          interns.forEach((int) => userIdsToNotify.add(int.id));
        }
      }
    }

    if (excludeUserId) {
      userIdsToNotify.delete(excludeUserId);
    }

    const promises = Array.from(userIdsToNotify).map((id) =>
      createNotification({ userId: id, title, message, type })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error broadcasting notifications:', error);
  }
};
