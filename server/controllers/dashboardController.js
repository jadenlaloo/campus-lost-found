import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

// @desc    Get Admin Dashboard statistics and recent activity
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLostItems,
      totalFoundItems,
      totalPendingClaims,
      totalResolvedItems,
      recentItems,
      recentClaims,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ reportType: 'lost' }),
      Item.countDocuments({ reportType: 'found' }),
      Claim.countDocuments({ status: 'pending' }),
      Item.countDocuments({ status: 'returned' }),
      Item.find()
        .populate('submittedBy', 'fullName email')
        .sort('-createdAt')
        .limit(6),
      Claim.find()
        .populate('item', 'itemName category campusLocation reportType status')
        .populate('claimant', 'fullName email')
        .sort('-createdAt')
        .limit(6),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalLostItems,
        totalFoundItems,
        totalPendingClaims,
        totalResolvedItems,
        totalActiveReports: totalLostItems + totalFoundItems - totalResolvedItems,
      },
      recentItems,
      recentClaims,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard metrics.',
      error: error.message,
    });
  }
};

// @desc    Get User Dashboard statistics and recent items
// @route   GET /api/dashboard/user
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      myLostItemsCount,
      myFoundItemsCount,
      myPendingClaimsCount,
      myApprovedClaimsCount,
      myRejectedClaimsCount,
      myRecentItems,
      myRecentClaims,
      campusRecentItems,
    ] = await Promise.all([
      Item.countDocuments({ submittedBy: userId, reportType: 'lost' }),
      Item.countDocuments({ submittedBy: userId, reportType: 'found' }),
      Claim.countDocuments({ claimant: userId, status: 'pending' }),
      Claim.countDocuments({ claimant: userId, status: 'approved' }),
      Claim.countDocuments({ claimant: userId, status: 'rejected' }),
      Item.find({ submittedBy: userId }).sort('-createdAt').limit(4),
      Claim.find({ claimant: userId })
        .populate('item', 'itemName reportType category campusLocation status')
        .sort('-createdAt')
        .limit(4),
      Item.find({ status: { $in: ['unresolved', 'under_review'] } })
        .sort('-createdAt')
        .limit(6)
        .populate('submittedBy', 'fullName email'),
    ]);

    return res.json({
      success: true,
      stats: {
        myLostItemsCount,
        myFoundItemsCount,
        myTotalReports: myLostItemsCount + myFoundItemsCount,
        myClaims: {
          pending: myPendingClaimsCount,
          approved: myApprovedClaimsCount,
          rejected: myRejectedClaimsCount,
          total: myPendingClaimsCount + myApprovedClaimsCount + myRejectedClaimsCount,
        },
      },
      myRecentItems,
      myRecentClaims,
      campusRecentItems,
    });
  } catch (error) {
    console.error('User stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user dashboard metrics.',
      error: error.message,
    });
  }
};