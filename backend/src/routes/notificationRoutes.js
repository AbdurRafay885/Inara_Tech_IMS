import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get current user's notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

export default router;
