import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';
import { uploadApplicationDocs } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { applySchema, updateApplicationStatusSchema } from '../utils/schemas.js';

const router = express.Router();

// Protected endpoints
router.post(
  '/apply',
  authMiddleware,
  uploadApplicationDocs.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'picture', maxCount: 1 },
  ]),
  validate(applySchema),
  applicationController.apply
);
router.get('/track/:id', applicationController.trackApplication);

// Admin-only endpoints
router.get('/', authMiddleware, restrictTo('ADMIN'), applicationController.getApplications);
router.post('/delete', authMiddleware, restrictTo('ADMIN'), applicationController.deleteApplications);
router.patch('/:id/status', authMiddleware, restrictTo('ADMIN'), validate(updateApplicationStatusSchema), applicationController.updateStatus);
router.get('/download/:id', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR'), applicationController.downloadCV);

export default router;
