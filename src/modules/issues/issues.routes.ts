import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
} from './issues.controller';

const router = Router();

router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.post('/', authenticate, createIssue);
router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, requireRole('maintainer'), deleteIssue);

export default router;
