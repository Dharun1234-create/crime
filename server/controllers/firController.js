const FIR = require('../models/FIR');
const User = require('../models/User');

/**
 * POST /api/fir/create
 * Create a new FIR
 * Admins can assign any officer, Inspectors are auto-assigned to themselves
 */
exports.createFIR = async (req, res) => {
  try {
    const { 
      title, description, crimeType, complainantName, 
      complainantAge, complainantAddress, complainantContact,
      accusedDetails, incidentTime, policeStation,
      location, district, date, assignedTo 
    } = req.body;

    let targetOfficerId = req.user._id;
    let targetOfficerName = req.user.name;

    // If Admin is creating, they can assign a specific officer
    if (req.user.role === 'admin' && assignedTo) {
      const officer = await User.findById(assignedTo);
      if (officer) {
        targetOfficerId = officer._id;
        targetOfficerName = officer.name;
      }
    }

    const fir = await FIR.create({
      title,
      description,
      crimeType,
      complainantName,
      complainantAge,
      complainantAddress,
      complainantContact,
      accusedDetails,
      incidentTime,
      policeStation: policeStation || 'Central Police Station',
      location,
      district: district || req.user.assignedDistrict || 'Chennai',
      date: date || Date.now(),
      createdBy: req.user.name,
      createdById: req.user._id,
      inspectorName: targetOfficerName, // Legacy field support
      inspectorId: targetOfficerId,    // Legacy field support
      assignedTo: targetOfficerId,
      assignedOfficerName: targetOfficerName,
      statusHistory: [{
        status: 'Pending',
        updatedBy: req.user.name,
        updatedById: req.user._id,
        note: 'FIR registered'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'FIR registered successfully',
      fir
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create FIR',
      error: error.message
    });
  }
};

/**
 * GET /api/fir/all
 * Get FIRs: Officers see only assigned cases, Admins see all
 */
exports.getAllFIRs = async (req, res) => {
  try {
    const { crimeType, location, status, startDate, endDate, search } = req.query;

    // Build query filter
    let filter = {};

    // Role-based access: Officers see only their assigned cases
    if (req.user.role === 'inspector') {
      filter.assignedTo = req.user._id;
    }

    if (crimeType) filter.crimeType = crimeType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complainantName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const firs = await FIR.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: firs.length,
      firs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FIRs',
      error: error.message
    });
  }
};

/**
 * GET /api/fir/:id
 */
exports.getFIRById = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdById', 'name email');

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Role-based access: Officers can only view their own cases
    if (req.user.role === 'inspector' && fir.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this case' });
    }

    res.status(200).json({ success: true, fir });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * PUT /api/fir/update/:id
 * Only assigned Officer can update status and add notes
 */
exports.updateFIR = async (req, res) => {
  try {
    const { status, note } = req.body;
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Role-based control: Only assigned officer can update
    if (fir.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned officer can update case status or add notes'
      });
    }

    if (status) fir.status = status;
    
    // Add to history
    fir.statusHistory.push({
      status: status || fir.status,
      updatedBy: req.user.name,
      updatedById: req.user._id,
      note: note || 'Status update'
    });

    await fir.save();

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      fir
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
};

/**
 * POST /api/fir/request-update/:id
 * Admin sends request to Officer
 */
exports.requestUpdate = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can request updates' });
    }

    const fir = await FIR.findById(req.params.id);
    if (!fir) return res.status(404).json({ success: false, message: 'FIR not found' });

    fir.adminRequests.push({
      message,
      senderName: req.user.name,
      timestamp: new Date()
    });

    await fir.save();

    res.status(200).json({ success: true, message: 'Update request sent to officer' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/fir/my-requests
 * Officer sees requests for their cases
 */
exports.getMyRequests = async (req, res) => {
  try {
    const firs = await FIR.find({ 
      assignedTo: req.user._id,
      'adminRequests.isResolved': false 
    }).select('title adminRequests');

    res.status(200).json({ success: true, firs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/fir/:id
 */
exports.deleteFIR = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can delete records' });
    }
    await FIR.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

