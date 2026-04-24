const Lead = require('../models/Lead');

// Helper: find leads matching this phone or email (case-insensitive email)
const findDuplicates = async (phone, email, excludeId = null) => {
  const query = {
    $or: [
      { phone: phone },
      { email: email ? email.toLowerCase() : null },
    ],
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Lead.find(query).select('name phone email createdAt');
};

// @desc    Check for duplicate leads before submitting
// @route   POST /api/leads/check-duplicate
// @body    { phone, email }
exports.checkDuplicate = async (req, res, next) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Phone or email is required for duplicate check',
      });
    }
    const duplicates = await findDuplicates(phone, email);
    res.status(200).json({
      success: true,
      isDuplicate: duplicates.length > 0,
      duplicates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead (with duplicate guard)
// @route   POST /api/leads
exports.createLead = async (req, res, next) => {
  try {
    // Server-side duplicate guard — runs even if the frontend skipped check-duplicate
    const { phone, email } = req.body;
    const duplicates = await findDuplicates(phone, email);

    // If `force=true` query param is present, skip the block (user confirmed via UI)
    if (duplicates.length > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        success: false,
        message: 'A lead with this phone or email already exists',
        duplicates,
      });
    }

    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads with search, filter, sort, pagination
// @route   GET /api/leads
exports.getLeads = async (req, res, next) => {
  try {
    const {
      search,
      source,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (source && source !== 'all') query.source = source;
    if (status && status !== 'all') query.status = status;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email role')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
exports.getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead (status or full update)
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a note/comment to a lead
// @route   POST /api/leads/:id/notes
exports.addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({ text });
    await lead.save();

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard metrics
// @route   GET /api/leads/dashboard/metrics
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();

    // Leads grouped by source
    const leadsBySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $project: { source: '$_id', count: 1, _id: 0 } },
    ]);

    // Status distribution
    const statusDistribution = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);

    // Conversion rate = (Closed leads / Total leads) * 100
    const closedCount = await Lead.countDocuments({ status: 'Closed' });
    const conversionRate =
      totalLeads > 0 ? ((closedCount / totalLeads) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        leadsBySource,
        statusDistribution,
        conversionRate: Number(conversionRate),
        closedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
