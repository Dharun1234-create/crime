const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const FIR = require('./models/FIR');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await FIR.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const admin = await User.create({
      name: 'Admin Officer',
      email: 'admin@police.gov',
      password: 'admin123',
      role: 'admin'
    });

    const inspector1 = await User.create({
      name: 'Inspector Sharma',
      email: 'sharma@police.gov',
      password: 'inspector123',
      role: 'inspector',
      assignedDistrict: 'Chennai'
    });

    const inspector2 = await User.create({
      name: 'Inspector Patel',
      email: 'patel@police.gov',
      password: 'inspector123',
      role: 'inspector',
      assignedDistrict: 'Coimbatore'
    });

    const sampleFIRs = [
      {
        title: 'Mobile Phone Snatching',
        description: 'Phone snatched at market near T Nagar bus stand.',
        crimeType: 'Theft',
        complainantName: 'Rajesh Verma',
        complainantAge: 32,
        complainantAddress: '12, Anna Salai, Chennai',
        complainantContact: '+91 98450 12345',
        accusedDetails: 'Two suspects on a black pulsar motorcycle',
        location: 'T Nagar, Chennai',
        district: 'Chennai',
        incidentTime: '18:30',
        policeStation: 'T Nagar Police Station',
        date: new Date('2026-04-15'),
        status: 'Investigating',
        inspectorName: inspector1.name,
        inspectorId: inspector1._id,
        assignedTo: inspector1._id,
        assignedOfficerName: inspector1.name,
        createdBy: admin.name,
        createdById: admin._id,
        statusHistory: [{ status: 'Pending', updatedBy: admin.name, updatedById: admin._id, note: 'Registered' }]
      },
      {
        title: 'ATM Card Fraud',
        description: 'Unauthorized withdrawal reported using cloned card.',
        crimeType: 'Fraud',
        complainantName: 'Priya Singh',
        complainantAge: 27,
        complainantAddress: '45, RS Puram, Coimbatore',
        complainantContact: '+91 91234 56789',
        accusedDetails: 'Cyber criminals unknown',
        location: 'RS Puram, Coimbatore',
        district: 'Coimbatore',
        incidentTime: '11:15',
        policeStation: 'B1 RS Puram Station',
        date: new Date('2026-04-12'),
        status: 'Pending',
        inspectorName: inspector2.name,
        inspectorId: inspector2._id,
        assignedTo: inspector2._id,
        assignedOfficerName: inspector2.name,
        createdBy: admin.name,
        createdById: admin._id,
        statusHistory: [{ status: 'Pending', updatedBy: admin.name, updatedById: admin._id, note: 'Registered' }]
      }
    ];

    // Save one by one to trigger pre-save hooks
    for (const firData of sampleFIRs) {
      const fir = new FIR(firData);
      await fir.save();
    }

    console.log(`📋 ${sampleFIRs.length} professional FIR records created with auto-IDs`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
