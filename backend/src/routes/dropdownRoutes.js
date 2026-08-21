import express from 'express';
import * as dropdownController from '../controllers/dropdownController.js';
import { authMiddleware, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public/Auth endpoint to fetch dropdown options for applicant form
router.get('/', dropdownController.getDropdowns);

// Admin-only endpoints to manage options
router.post('/', authMiddleware, restrictTo('ADMIN'), dropdownController.addDropdownOption);
router.delete('/:id', authMiddleware, restrictTo('ADMIN'), dropdownController.deleteDropdownOption);

export default router;
