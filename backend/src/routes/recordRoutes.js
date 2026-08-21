import express from 'express';
import * as recordController from '../controllers/recordController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { archiveInternSchema } from '../utils/schemas.js';

const router = express.Router();

// Admin/Supervisor: Archive finished/completed internship and deactivate portal access
router.post('/archive/:internId', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR'), validate(archiveInternSchema), recordController.archiveIntern);

// Admin/Supervisor: Search and view historical completed internship records
router.get('/', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR'), recordController.getRecords);

export default router;
