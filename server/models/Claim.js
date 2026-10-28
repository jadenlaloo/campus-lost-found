import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Associated item reference is required'],
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
    },
    claimExplanation: {
      type: String,
      required: [true, 'Please explain why this item belongs to you'],
      trim: true,
      minlength: [10, 'Explanation must be at least 10 characters'],
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
    },
    privateProofDetails: {
      type: String,
      required: [true, 'Private distinguishing details are required for ownership verification'],
      trim: true,
      minlength: [5, 'Private proof details must be at least 5 characters'],
      maxlength: [1000, 'Proof details cannot exceed 1000 characters'],
    },
    supportingInfo: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decisionNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;