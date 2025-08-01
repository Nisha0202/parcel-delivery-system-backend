import mongoose from 'mongoose';

const statusLogSchema = new mongoose.Schema({
  status: { 
    type: String, 
    required: true },
  timestamp: { 
    type: Date,
     default: Date.now },
  location: { 
    type: String },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' },
  note: { 
    type: String }
}, { _id: false });

const parcelSchema = new mongoose.Schema({
  trackingId: { 
    type: String, 
    required: true, 
    unique: true },
  type: { 
    type: String,
     required: true },
  weight: { 
    type: Number, 
    required: true },
  sender: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
      required: true },
  pickupAddress: { 
    type: String, 
    required: true },
  deliveryAddress: { 
    type: String, 
    required: true },
  fee: { 
    type: Number, 
    required: true },
  couponCode: {
     type: String,
    default: null },
  discountAmount: {
     type: Number, 
     default: 0 },

  deliveryDate: { 
    type: Date },
  status: { 
    type: String, 
    enum: ['Requested', 'Approved', 'Dispatched', 'In Transit', 'Delivered', 'Canceled', 'Blocked'],
     default: 'Requested' },
  isBlocked: { 
    type: Boolean,
     default: false },
  trackingEvents: { 
    type: [statusLogSchema], 
    default: [] }
}, { timestamps: true });

export default mongoose.model('Parcel', parcelSchema);