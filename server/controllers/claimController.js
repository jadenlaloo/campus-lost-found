import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

// @desc    Submit a new ownership claim for an item
// @route   POST /api/claims
// @access  Private (Normal User & Admin)
export const createClaim = async (req, res) => {
  try {
    const { itemId, claimExplanation, privateProofDetails, supportingInfo } = req.body;

    if (!itemId || !claimExplanation || !privateProofDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item ID, claim explanation, and private proof details.',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    // Check if item is already resolved/returned
    if (item.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been marked as returned to its verified owner.',
      });
    }

    if (item.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'This item report has been withdrawn.',
      });
    }

    // User cannot claim their own submitted item
    if (item.submittedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim for an item that you reported.',
      });
    }

    // Check for existing pending claim by this user for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: 'pending',
    });
    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending claim for this item. Campus administration is reviewing it.',
      });
    }

    const newClaim = new Claim({
      item: itemId,
      claimant: req.user._id,
      claimExplanation: claimExplanation.trim(),
      privateProofDetails: privateProofDetails.trim(),
      supportingInfo: supportingInfo ? supportingInfo.trim() : '',
      status: 'pending',
    });

    await newClaim.save();

    // Optionally update item status to 'under_review' if it's currently unresolved
    if (item.status === 'unresolved') {
      item.status = 'under_review';
      await item.save();
    }

    await newClaim.populate('item');
    await newClaim.populate('claimant', 'fullName email department studentId phone');

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully! Campus Safety will review your ownership proof.',
      claim: newClaim,
    });
  } catch (error) {
    console.error('Create claim error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit claim.',
      error: error.message,
    });
  }
};

// @desc    Get claims submitted by the authenticated user
// @route   GET /api/claims/my-claims
// @access  Private
export const getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item')
      .populate('reviewedBy', 'fullName email department')
      .sort('-createdAt');
    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error('Get user claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your claims.',
      error: error.message,
    });
  }
};

// @desc    Get all claims (Admin only)
// @route   GET /api/claims/admin/all
// @access  Private (Admin)
export const getAdminClaims = async (req, res) => {
  try {
    const { status, itemId, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (itemId) {
      query.item = itemId;
    }

    const claims = await Claim.find(query)
      .populate('item')
      .populate('claimant', 'fullName email phone studentId department')
      .populate('reviewedBy', 'fullName email')
      .sort('-createdAt');

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error('Admin get claims error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch claim records.',
      error: error.message,
    });
  }
};

// @desc    Review a claim: Approve or Reject (Admin only)
// @route   PUT /api/claims/:id/review
// @access  Private (Admin)
export const reviewClaim = async (req, res) => {
  try {
    const { status, decisionNote, markItemReturned } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Claim status must be either "approved" or "rejected".',
      });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'fullName email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim record not found.',
      });
    }

    const item = await Item.findById(claim.item._id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Associated item not found.',
      });
    }

    // Safeguard: Check if this item already has an approved claim
    if (status === 'approved') {
      const alreadyApprovedClaim = await Claim.findOne({
        item: item._id,
        status: 'approved',
        _id: { $ne: claim._id },
      });
      if (alreadyApprovedClaim) {
        return res.status(409).json({
          success: false,
          message: 'Conflict: This item has already been claimed and approved for another claimant.',
        });
      }
    }

    claim.status = status;
    claim.decisionNote = decisionNote
      ? decisionNote.trim()
      : status === 'approved'
      ? 'Ownership verified by administration.'
      : 'Proof provided did not match item specifications.';
    claim.reviewedBy = req.user._id;
    await claim.save();

    if (status === 'approved') {
      // Mark item as returned or resolved
      if (markItemReturned !== false) {
        item.status = 'returned';
        await item.save();
      }

      // Automatically reject any other pending claims for this item
      await Claim.updateMany(
        {
          item: item._id,
          _id: { $ne: claim._id },
          status: 'pending',
        },
        {
          status: 'rejected',
          decisionNote: 'Item has been verified and returned to another claimant with confirmed ownership proof.',
          reviewedBy: req.user._id,
        }
      );
    } else if (status === 'rejected') {
      // If all claims for this item are rejected, reset item status back to unresolved
      const otherPendingClaims = await Claim.countDocuments({
        item: item._id,
        status: 'pending',
        _id: { $ne: claim._id },
      });
      if (otherPendingClaims === 0 && item.status === 'under_review') {
        item.status = 'unresolved';
        await item.save();
      }
    }
    return res.json({
      success: true,
      message: `Claim successfully ${status}!`,
      claim,
    });
  } catch (error) {
    console.error('Review claim error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process claim review.',
      error: error.message,
    });
  }
};