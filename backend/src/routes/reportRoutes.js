import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';
import { uploadReportAttachment } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { submitTaskReportSchema, reviewReportSchema } from '../utils/schemas.js';

const router = express.Router();

// Submit task report (intern only)
router.post('/', authMiddleware, restrictTo('INTERN'), uploadReportAttachment.single('attachment'), validate(submitTaskReportSchema), reportController.submitReport);

// Get reports (filtered based on roles)
router.get('/', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), reportController.getReports);

// Review/Feedback on weekly reports (supervisor only)
router.patch('/:id/review', authMiddleware, restrictTo('SUPERVISOR'), validate(reviewReportSchema), reportController.reviewReport);

// View internship progress and timeline details
router.get('/progress', authMiddleware, restrictTo('INTERN'), reportController.getProgress);
router.get('/progress/:internId', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), reportController.getProgress);

// Download report attachments with custom filename
router.get('/download/:id', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), reportController.downloadReport);

export default router;
