import { Request, Response } from 'express';
import Parcel from './parcel.model';
import User from '../user/user.model';
import { generateTrackingId } from '../../utils/generateTrackingId';

// Helper: Fee calculation (flat rate)
function calculateFee(weight: number) {
  return Math.max(50, weight * 20); 
}

// Sender: Create Parcel
export const createParcel = async (req: any, res: Response) => {
  const { type, weight, receiverId, pickupAddress, deliveryAddress, deliveryDate } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver || receiver.role !== 'receiver') {
    return res.status(404).json({ success: false, message: 'Receiver not found or invalid' });
  }

  const trackingId = generateTrackingId();
  const fee = calculateFee(weight);

  const parcel = await Parcel.create({
    trackingId,
    type,
    weight,
    sender: req.user._id,
    receiver: receiverId,
    pickupAddress,
    deliveryAddress,
    deliveryDate,
    fee,
    status: 'Requested',
    trackingEvents: [{
      status: 'Requested',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Parcel requested'
    }]
  });

  res.status(201).json({ success: true, data: parcel });
};

// Sender: List My Parcels
export const listMyParcels = async (req: any, res: Response) => {
  const parcels = await Parcel.find({ sender: req.user._id });
  res.json({ success: true, data: parcels });
};

// Sender: Cancel Parcel (if not dispatched)
export const cancelParcel = async (req: any, res: Response) => {
  const parcel = await Parcel.findOne({ _id: req.params.id, sender: req.user._id });
  if (!parcel) return res.status(404).json({ success: false, message: 'Parcel not found' });
  if (['Dispatched', 'In Transit', 'Delivered', 'Canceled', 'Blocked'].includes(parcel.status)) {
    return res.status(422).json({ success: false, message: 'Cannot cancel dispatched/delivered/blocked parcel' });
  }
  parcel.status = 'Canceled';
  parcel.trackingEvents.push({
    status: 'Canceled',
    timestamp: new Date(),
    updatedBy: req.user._id,
    note: 'Sender canceled'
  });
  await parcel.save();
  res.json({ success: true, data: parcel });
};

// Receiver: View Incoming Parcels
export const incomingParcels = async (req: any, res: Response) => {
  const parcels = await Parcel.find({ receiver: req.user._id });
  res.json({ success: true, data: parcels });
};

// Receiver: Confirm Delivery
export const confirmDelivery = async (req: any, res: Response) => {
  const parcel = await Parcel.findOne({ _id: req.params.id, receiver: req.user._id });
  if (!parcel) 
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  if (parcel.status !== 'In Transit') {
    return res.status(422).json({ success: false, message: 'Parcel not ready for delivery confirmation' });
  }
  parcel.status = 'Delivered';
  parcel.trackingEvents.push({
    status: 'Delivered',
    timestamp: new Date(),
    updatedBy: req.user._id,
    note: 'Receiver confirmed delivery'
  });
  await parcel.save();
  res.json({ success: true, data: parcel });
};

// Admin: List All Parcels (filterable)
export const listAllParcels = async (req: Request, res: Response) => {
  const { status, from, to } = req.query;
  const q: any = {};
  if (status) q.status = status;
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from as string);
    if (to) q.createdAt.$lte = new Date(to as string);
  }
  const parcels = await Parcel.find(q);
  res.json({ success: true, data: parcels });
};

// Admin: Block Parcel
export const blockParcel = async (req: Request, res: Response) => {
  const parcel = await Parcel.findByIdAndUpdate(req.params.id, { isBlocked: true, status: 'Blocked' }, { new: true });
  if (!parcel) 
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  parcel.trackingEvents.push({
    status: 'Blocked',
    timestamp: new Date(),
    updatedBy: (req as any).user._id,
    note: 'Admin blocked parcel'
  });
  await parcel.save();
  res.json({ success: true, data: parcel });
};

// Admin: Update Parcel Status
export const updateParcelStatus = async (req: any, res: Response) => {
  const { status, location, note } = req.body;
  const allowedStatus = ['Approved', 'Dispatched', 'In Transit'];
  if (!allowedStatus.includes(status)) {
    return res.status(422).json({ success: false, message: 'Invalid status update' });
  }
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ success: false, message: 'Parcel not found' });
  if (parcel.isBlocked || parcel.status === 'Canceled' || parcel.status === 'Delivered') {
    return res.status(422).json({ success: false, message: 'Cannot update status for blocked/canceled/delivered parcel' });
  }
  parcel.status = status;
  parcel.trackingEvents.push({
    status,
    timestamp: new Date(),
    location,
    updatedBy: req.user._id,
    note
  });
  await parcel.save();
  res.json({ success: true, data: parcel });
};

// Shared: Get Parcel by ID
export const getParcelById = async (req: any, res: Response) => {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) 
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  if (parcel.isBlocked) 
    return res.status(403).json({ success: false, message: 'Parcel is blocked' });
  // Only sender, receiver, or admin can view
  if (
    req.user.role === 'admin' ||
    parcel.sender.equals(req.user._id) ||
    parcel.receiver.equals(req.user._id)
  ) {
    return res.json({ success: true, data: parcel });
  }
  return res.status(403).json({ success: false, message: 'Forbidden: Not authorized' });
};

// Shared: Get Status Log
export const getParcelStatusLog = async (req: any, res: Response) => {
  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) 
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  if (
    req.user.role === 'admin' ||
    parcel.sender.equals(req.user._id) ||
    parcel.receiver.equals(req.user._id)
  ) {
    return res.json({ success: true, data: parcel.trackingEvents });
  }
  return res.status(403).json({ success: false, message: 'Forbidden: Not authorized' });
};

export const getParcelByTrackingId = async (req: Request, res: Response) => {
  const parcel = await Parcel.findOne({ trackingId: req.params.trackingId });
  if (!parcel || parcel.isBlocked || parcel.status === 'Canceled') {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }

  res.json({
    success: true,
    data: {
      trackingId: parcel.trackingId,
      currentStatus: parcel.status,
      history: parcel.trackingEvents.map(event => ({
        status: event.status,
        timestamp: event.timestamp,
        note: event.note,
        location: event.location || ''
      }))
    }
  });
};
