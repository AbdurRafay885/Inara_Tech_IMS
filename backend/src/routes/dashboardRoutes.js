import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR', 'INTERN'), getDashboardStats);

export default router;
