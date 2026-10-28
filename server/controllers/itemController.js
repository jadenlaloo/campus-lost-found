import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

// @desc    Create a new lost or found item report
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const {
      itemName,
      description,
      category,
      reportType,
      dateLostOrFound,
      campusLocation,
      specificLocationDetails,
      imageUrl,
      identifyingCharacteristics,
      storageLocation,
      contactInfo,
    } = req.body;

    if (!itemName || !description || !category || !reportType || !campusLocation) {
      return res.status(400).json({
        success: false,
        message: 'Item name, description, category, report type, and campus location are required.',
      });
    }

    if (!['lost', 'found'].includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Report type must be either "lost" or "found".',
      });
    }

    const newItem = new Item({
      itemName: itemName.trim(),
      description: description.trim(),
      category,
      reportType,
      dateLostOrFound: dateLostOrFound ? new Date(dateLostOrFound) : new Date(),
      campusLocation,
      specificLocationDetails: specificLocationDetails ? specificLocationDetails.trim() : '',
      imageUrl: imageUrl || '',
      identifyingCharacteristics: identifyingCharacteristics ? identifyingCharacteristics.trim() : '',
      storageLocation: storageLocation ? storageLocation.trim() : '',
      contactInfo: contactInfo ? contactInfo.trim() : `${req.user.fullName} (${req.user.email})`,
      status: 'unresolved',
      submittedBy: req.user._id,
    });

    await newItem.save();
    await newItem.populate('submittedBy', 'fullName email department studentId');

    return res.status(201).json({
      success: true,
      message: `${reportType === 'lost' ? 'Lost item report' : 'Found item report'} submitted successfully!`,
      item: newItem,
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item report.',
      error: error.message,
    });
  }
};

// @desc    Get all items with search, filters, and pagination
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    const {
      search,
      category,
      reportType,
      campusLocation,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 12,
      sort = '-createdAt',
      submittedBy,
    } = req.query;

    const query = {};

    // Filter by report type (lost, found)
    if (reportType && ['lost', 'found'].includes(reportType)) {
      query.reportType = reportType;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by campus location
    if (campusLocation && campusLocation !== 'All') {
      query.campusLocation = campusLocation;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by submitter (e.g. for user's own items)
    if (submittedBy) {
      query.submittedBy = submittedBy;
    }

    // Date range filter
    if (startDate || endDate) {
      query.dateLostOrFound = {};
      if (startDate) query.dateLostOrFound.$gte = new Date(startDate);
      if (endDate) query.dateLostOrFound.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    // Text search query
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      query.$or = [
        { itemName: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { specificLocationDetails: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('submittedBy', 'fullName email department')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      items,
    });
  } catch (error) {
    console.error('Get items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve items.',
      error: error.message,
    });
  }
};

// @desc    Get single item details
// @route   GET /api/items/:id
// @access  Public (sensitive details guarded)
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('submittedBy', 'fullName email department phone');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    let sanitizedItem = item.toObject();
    const isOwner = req.user && req.user._id.toString() === item.submittedBy._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (item.reportType === 'found' && !isAdmin && !isOwner) {
      sanitizedItem.isProtectedProof = true;
      sanitizedItem.identifyingCharacteristicsNotice =
        'Specific distinguishing characteristics are securely withheld by campus safety to verify legitimate ownership during claims.';
    }

    return res.json({
      success: true,
      item: sanitizedItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve item details.',
      error: error.message,
    });
  }
};

// @desc    Update an item report
// @route   PUT /api/items/:id
// @access  Private (Owner or Admin)
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isOwner = req.user._id.toString() === item.submittedBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit reports that you submitted.',
      });
    }

    const {
      itemName,
      description,
      category,
      reportType,
      dateLostOrFound,
      campusLocation,
      specificLocationDetails,
      imageUrl,
      identifyingCharacteristics,
      storageLocation,
      contactInfo,
      status,
    } = req.body;

    if (itemName) item.itemName = itemName.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (reportType) item.reportType = reportType;
    if (dateLostOrFound) item.dateLostOrFound = new Date(dateLostOrFound);
    if (campusLocation) item.campusLocation = campusLocation;
    if (specificLocationDetails !== undefined) item.specificLocationDetails = specificLocationDetails.trim();
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (identifyingCharacteristics !== undefined) item.identifyingCharacteristics = identifyingCharacteristics.trim();
    if (storageLocation !== undefined) item.storageLocation = storageLocation.trim();
    if (contactInfo !== undefined) item.contactInfo = contactInfo.trim();

    if (status) {
      if (isAdmin) {
        item.status = status;
      } else if (['withdrawn', 'returned'].includes(status)) {
        item.status = status;
      }
    }

    await item.save();
    await item.populate('submittedBy', 'fullName email department');

    return res.json({
      success: true,
      message: 'Item report updated successfully.',
      item,
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item report.',
      error: error.message,
    });
  }
};

// @desc    Delete or withdraw an item report
// @route   DELETE /api/items/:id
// @access  Private (Owner or Admin)
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.',
      });
    }

    const isOwner = req.user._id.toString() === item.submittedBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only remove your own reports.',
      });
    }

    await Claim.deleteMany({ item: item._id });
    await Item.findByIdAndDelete(item._id);

    return res.json({
      success: true,
      message: 'Item report and associated claim records removed successfully.',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete item report.',
      error: error.message,
    });
  }
};

// @desc    Automatic match suggestions between lost and found items
// @route   GET /api/items/:id/matches
// @access  Public
export const getPotentialMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const targetType = item.reportType === 'lost' ? 'found' : 'lost';

    const keywords = item.itemName
      .split(' ')
      .filter((w) => w.length > 3)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''));

    const keywordRegex = keywords.length > 0 ? keywords.join('|') : item.itemName;

    const potentialMatches = await Item.find({
      _id: { $ne: item._id },
      reportType: targetType,
      status: { $in: ['unresolved', 'under_review'] },
      $or: [
        { category: item.category },
        { campusLocation: item.campusLocation },
        { itemName: { $regex: keywordRegex, $options: 'i' } },
        { description: { $regex: keywordRegex, $options: 'i' } },
      ],
    })
      .limit(6)
      .populate('submittedBy', 'fullName email department');

    const scoredMatches = potentialMatches.map((match) => {
      let score = 0;
      let reasons = [];

      if (match.category === item.category) {
        score += 40;
        reasons.push('Same category (' + item.category + ')');
      }

      if (match.campusLocation === item.campusLocation) {
        score += 30;
        reasons.push('Same campus location (' + item.campusLocation + ')');
      }

      const titleOverlap = keywords.some((k) =>
        match.itemName.toLowerCase().includes(k.toLowerCase())
      );
      if (titleOverlap) {
        score += 30;
        reasons.push('Similar title keywords');
      }

      return {
        ...match.toObject(),
        matchScore: score,
        matchReasons: reasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      currentItem: {
        id: item._id,
        itemName: item.itemName,
        reportType: item.reportType,
        category: item.category,
        campusLocation: item.campusLocation,
      },
      matches: scoredMatches,
    });
  } catch (error) {
    console.error('Match suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute potential matches.',
      error: error.message,
    });
  }
};