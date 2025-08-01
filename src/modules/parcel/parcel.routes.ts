import { Router } from 'express';
import {
  createParcel, listMyParcels, cancelParcel,
  incomingParcels, confirmDelivery,
  listAllParcels, blockParcel, updateParcelStatus,
  getParcelById, getParcelStatusLog, getParcelByTrackingId
} from './parcel.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRole } from '../../middlewares/role.middleware';

const router = Router();

// Sender
router.post('/', authenticate, authorizeRole('sender'), createParcel);
router.get('/me', authenticate, authorizeRole('sender'), listMyParcels);
router.patch('/:id/cancel', authenticate, authorizeRole('sender'), cancelParcel);

// Receiver
router.get('/received', authenticate, authorizeRole('receiver'), incomingParcels);
router.patch('/:id/confirm', authenticate, authorizeRole('receiver'), confirmDelivery);

// Admin
router.get('/', authenticate, authorizeRole('admin'), listAllParcels);
router.patch('/:id/block', authenticate, authorizeRole('admin'), blockParcel);
router.patch('/:id/status', authenticate, authorizeRole('admin'), updateParcelStatus);

// Shared
router.get('/:id', authenticate, getParcelById);
router.get('/:id/status-log', authenticate, getParcelStatusLog);
router.get('/track/:trackingId', getParcelByTrackingId);


export default router;