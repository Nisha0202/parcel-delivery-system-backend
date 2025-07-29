import { Router } from 'express';
import { getAllUsers, blockUser, unblockUser } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRole } from '../../middlewares/role.middleware';

const router = Router();

router.get('/', authenticate, authorizeRole('admin'), getAllUsers);
router.patch('/:id/block', authenticate, authorizeRole('admin'), blockUser);
router.patch('/:id/unblock', authenticate, authorizeRole('admin'), unblockUser);

export default router;