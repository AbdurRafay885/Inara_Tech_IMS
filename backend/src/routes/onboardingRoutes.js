import express from 'express';
import * as onboardingController from '../controllers/onboardingController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';
import { uploadOnboarding } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createInterneeAccountSchema, verifyDocumentSchema, assignDepartmentSchema } from '../utils/schemas.js';

const router = express.Router();

// Intern-only: Upload onboarding documents
router.post('/upload-doc', authMiddleware, restrictTo('INTERN'), uploadOnboarding.single('document'), onboardingController.uploadDocument);

// Admin/Supervisor/Intern: View uploaded onboarding documents
router.get('/docs', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR', 'INTERN'), onboardingController.getDocuments);

// Admin/Supervisor: Get all interns (filtered by department for supervisors)
router.get('/interns', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR'), onboardingController.getInterns);

// Admin-only: Verify document status
router.patch('/docs/:id', authMiddleware, restrictTo('ADMIN'), validate(verifyDocumentSchema), onboardingController.verifyDocument);

// Admin-only: Assign internee department
router.patch('/interns/:id/department', authMiddleware, restrictTo('ADMIN'), validate(assignDepartmentSchema), onboardingController.assignDepartment);

// Admin/Supervisor/Intern: download onboarding document
router.get('/docs/download/:id', authMiddleware, restrictTo('ADMIN', 'SUPERVISOR', 'INTERN'), onboardingController.downloadDoc);

export default router;
