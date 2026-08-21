import express from 'express';
import * as trainingController from '../controllers/trainingController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Supervisor: Upload structured training roadmap (JSON body)
router.post('/roadmap', authMiddleware, restrictTo('SUPERVISOR'), trainingController.uploadRoadmap);

// Supervisor: Delete a roadmap
router.delete('/roadmap/:id', authMiddleware, restrictTo('SUPERVISOR'), trainingController.deleteRoadmap);

// All roles: Fetch department roadmap
router.get('/roadmap', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), trainingController.getRoadmap);
router.get('/roadmap/:department', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), trainingController.getRoadmap);

export default router;
