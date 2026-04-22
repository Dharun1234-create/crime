const mongoose = require('mongoose');

/**
 * FIR (First Information Report) Schema
 * Stores crime report details with automatic inspector tagging
 */
const firSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'FIR title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  crimeType: {
    type: String,
    required: [true, 'Crime type is required'],
    enum: [
      'Theft',
      'Robbery',
      'Assault',
      'Murder',
      'Fraud',
      'Cybercrime',
      'Drug Trafficking',
      'Kidnapping',
      'Domestic Violence',
      'Vandalism',
      'Burglary',
      'Other'
    ]
  },
  firNumber: {
    type: String,
    unique: true
  },
  policeStation: {
    type: String,
    required: true,
    default: 'Central Police Station'
  },
  complainantName: {
    type: String,
    required: [true, 'Complainant name is required'],
    trim: true
  },
  complainantAge: {
    type: Number,
    required: true
  },
  complainantAddress: {
    type: String,
    required: true
  },
  complainantContact: {
    type: String,
    required: true
  },
  accusedDetails: {
    type: String,
    default: 'Unknown'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Thanjavur', 'Vellore', 'Erode', 'Dharmapuri', 'Thoothukudi', 'Virudhunagar', 'Tenkasi', 'Kanniyakumari'], 
    default: 'Chennai'
  },
  incidentTime: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Investigating', 'Closed'],
    default: 'Pending'
  },
  createdBy: {
    type: String,
    required: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectorName: {
    type: String,
    required: true
  },
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedOfficerName: {
    type: String,
    required: true
  },
  statusHistory: [
    {
      status: { type: String, enum: ['Pending', 'Investigating', 'Closed'] },
      updatedBy: { type: String },
      updatedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  adminRequests: [
    {
      message: { type: String, required: true },
      senderName: { type: String },
      timestamp: { type: Date, default: Date.now },
      isResolved: { type: Boolean, default: false }
    }
  ]
}, {
  timestamps: true
});

// Auto-generate FIR Number before saving
firSchema.pre('save', async function(next) {
  if (!this.firNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.firNumber = `FIR/${year}/${this.district.substring(0, 3).toUpperCase()}/${random}`;
  }
  next();
});

// Index for efficient querying on common search/analysis fields
firSchema.index({ crimeType: 1 });
firSchema.index({ location: 1 });
firSchema.index({ date: -1 });
firSchema.index({ status: 1 });

module.exports = mongoose.model('FIR', firSchema);
