/**
 * Seed script — populates the database with realistic sample leads.
 *
 * Usage:
 *   npm run seed          # inserts sample data (clears existing leads first)
 *   npm run seed:destroy  # wipes all leads from the DB
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const connectDB = require('./config/db');

const sampleLeads = [
  { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@gmail.com', budget: 8500000, location: 'Bandra West, Mumbai', propertyType: '2 BHK', source: 'Facebook', status: 'New' },
  { name: 'Priya Patel', phone: '9823456789', email: 'priya.patel@yahoo.com', budget: 12000000, location: 'Koregaon Park, Pune', propertyType: '3 BHK', source: 'Google', status: 'Contacted' },
  { name: 'Amit Deshmukh', phone: '9898765432', email: 'amit.d@outlook.com', budget: 5500000, location: 'Thane West', propertyType: '1 BHK', source: 'Referral', status: 'Site Visit' },
  { name: 'Sneha Iyer', phone: '9765432109', email: 'sneha.iyer@gmail.com', budget: 15000000, location: 'Powai, Mumbai', propertyType: '3 BHK', source: 'Website', status: 'Closed' },
  { name: 'Vikram Singh', phone: '9812345678', email: 'vikram.singh@gmail.com', budget: 25000000, location: 'Juhu, Mumbai', propertyType: 'Villa', source: 'Referral', status: 'Contacted' },
  { name: 'Anjali Mehta', phone: '9834567890', email: 'anjali.m@hotmail.com', budget: 7500000, location: 'Andheri East, Mumbai', propertyType: '2 BHK', source: 'Facebook', status: 'New' },
  { name: 'Rohan Kulkarni', phone: '9845678901', email: 'rohan.k@gmail.com', budget: 4500000, location: 'Hinjewadi, Pune', propertyType: '1 BHK', source: 'Google', status: 'Site Visit' },
  { name: 'Kavita Nair', phone: '9856789012', email: 'kavita.nair@gmail.com', budget: 9500000, location: 'Viman Nagar, Pune', propertyType: '2 BHK', source: 'Walk-in', status: 'Contacted' },
  { name: 'Sanjay Gupta', phone: '9867890123', email: 'sanjay.gupta@yahoo.com', budget: 18000000, location: 'Worli, Mumbai', propertyType: '3 BHK', source: 'Website', status: 'New' },
  { name: 'Neha Verma', phone: '9878901234', email: 'neha.verma@gmail.com', budget: 6500000, location: 'Malad West, Mumbai', propertyType: '2 BHK', source: 'Facebook', status: 'Closed' },
  { name: 'Arjun Reddy', phone: '9889012345', email: 'arjun.reddy@gmail.com', budget: 3500000, location: 'Wakad, Pune', propertyType: 'Plot', source: 'Google', status: 'New' },
  { name: 'Divya Krishnan', phone: '9890123456', email: 'divya.k@gmail.com', budget: 11000000, location: 'Chembur, Mumbai', propertyType: '3 BHK', source: 'Referral', status: 'Contacted' },
  { name: 'Karan Malhotra', phone: '9901234567', email: 'karan.m@outlook.com', budget: 35000000, location: 'Lower Parel, Mumbai', propertyType: 'Commercial', source: 'Website', status: 'Site Visit' },
  { name: 'Pooja Joshi', phone: '9912345678', email: 'pooja.joshi@yahoo.com', budget: 5000000, location: 'Kharadi, Pune', propertyType: '1 BHK', source: 'Walk-in', status: 'New' },
  { name: 'Aditya Rao', phone: '9923456789', email: 'aditya.rao@gmail.com', budget: 8000000, location: 'Aundh, Pune', propertyType: '2 BHK', source: 'Facebook', status: 'Contacted' },
  { name: 'Meera Bhat', phone: '9934567890', email: 'meera.bhat@gmail.com', budget: 14000000, location: 'Goregaon East, Mumbai', propertyType: '3 BHK', source: 'Google', status: 'Site Visit' },
  { name: 'Nikhil Agarwal', phone: '9945678901', email: 'nikhil.a@hotmail.com', budget: 22000000, location: 'Bandstand, Mumbai', propertyType: 'Villa', source: 'Referral', status: 'Closed' },
  { name: 'Ritu Bansal', phone: '9956789012', email: 'ritu.bansal@gmail.com', budget: 6000000, location: 'Baner, Pune', propertyType: '2 BHK', source: 'Other', status: 'New' },
  { name: 'Siddharth Shah', phone: '9967890123', email: 'sid.shah@gmail.com', budget: 10500000, location: 'Vashi, Navi Mumbai', propertyType: '2 BHK', source: 'Facebook', status: 'Contacted' },
  { name: 'Tanvi Kapoor', phone: '9978901234', email: 'tanvi.k@gmail.com', budget: 4000000, location: 'Kalyan', propertyType: 'Plot', source: 'Google', status: 'New' },
];

// Sample notes to attach to a few leads for realism
const sampleNotes = {
  'Priya Patel': ['Called on Monday, interested in 3 BHK near IT parks.', 'Scheduled site visit for next Saturday.'],
  'Sneha Iyer': ['Deal closed. Token amount received.', 'Paperwork in progress.'],
  'Vikram Singh': ['Looking for sea-facing property. Budget is flexible.'],
  'Karan Malhotra': ['Wants commercial space for office. Needs parking for 10+ cars.'],
};

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing leads
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');

    // Attach notes to applicable leads
    const leadsWithNotes = sampleLeads.map((lead) => {
      const notes = sampleNotes[lead.name];
      return notes ? { ...lead, notes: notes.map((text) => ({ text })) } : lead;
    });

    // Insert sample data
    const inserted = await Lead.insertMany(leadsWithNotes);
    console.log(`✅ Seeded ${inserted.length} leads successfully`);

    // Summary
    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    console.log('\n📊 Status distribution:');
    byStatus.forEach((s) => console.log(`   ${s._id}: ${s.count}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

const destroyDB = async () => {
  try {
    await connectDB();
    const result = await Lead.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} leads`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy failed:', error.message);
    process.exit(1);
  }
};

// Run based on CLI flag: `node seed.js -d` to destroy, otherwise seed
if (process.argv[2] === '-d') {
  destroyDB();
} else {
  seedDB();
}
