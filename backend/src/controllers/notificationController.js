import { prisma } from '../db.js';

export const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while retrieving notifications.',
    });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found.',
      });
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own notifications.',
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
      data: updatedNotification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong while updating notification status.',
    });
  }
};
