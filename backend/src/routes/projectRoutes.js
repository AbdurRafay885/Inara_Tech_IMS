import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';
import { uploadDeliverable, uploadProjectReference } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  projectMembersSchema,
  assignProjectTaskSchema,
  updateTaskStatusSchema,
} from '../utils/schemas.js';

const router = express.Router();

// Supervisor: Create new project (with optional referenceFile upload)
router.post('/', authMiddleware, restrictTo('SUPERVISOR'), uploadProjectReference.single('referenceFile'), validate(createProjectSchema), projectController.createProject);

// Supervisor: Add members to project
router.post('/:id/members', authMiddleware, restrictTo('SUPERVISOR'), validate(projectMembersSchema), projectController.addProjectMembers);

// Supervisor: Assign tasks under project
router.post('/:id/tasks', authMiddleware, restrictTo('SUPERVISOR'), validate(assignProjectTaskSchema), projectController.assignTask);

// Intern: Update task status
router.patch('/tasks/:id/status', authMiddleware, restrictTo('INTERN'), validate(updateTaskStatusSchema), projectController.updateTaskStatus);

// Intern: Upload task deliverable file
router.post('/tasks/:id/deliverable', authMiddleware, restrictTo('INTERN'), uploadDeliverable.single('deliverable'), projectController.uploadTaskDeliverable);

// All roles: Get projects list
router.get('/', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), projectController.getProjects);

// All roles: Download project task deliverable
router.get('/tasks/download/:id', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), projectController.downloadDeliverable);

// All roles: Download project reference file
router.get('/download-reference/:id', authMiddleware, restrictTo('INTERN', 'SUPERVISOR', 'ADMIN'), projectController.downloadReference);

export default router;
