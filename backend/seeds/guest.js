const mongoose = require('mongoose');
const Guest = require('../models/guest');
require('dotenv').config();
const dbUrl = process.env.MONGO_URL; 

// Database
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed
const sampleGuests = [
  {
        fname: "John",
        lname: "Doe",
        email: "john.doe@example.com",
        phone_num: "123-456-7890",
    },
    {
        fname: "Jane",
        lname: "Smith",
        email: "jane.smith@example.com",
        phone_num: "987-654-3210",
    },
    {
        fname: "Alice",
        lname: "Johnson",
        email: "alice.johnson@example.com",
        phone_num: "555-123-4567",
    },
    {
        fname: "Bob",
        lname: "Brown",
        email: "bob.brown@example.com",
        phone_num: "444-555-6666",
    },
    {
        fname: "Charlie",
        lname: "Davis",
        email: "charlie.davis@example.com",
        phone_num: "333-444-5555",
    },
    {
        fname: "David",
        lname: "Evans",
        email: "david.evans@example.com",
        phone_num: "222-333-4444",
    },
    {
        fname: "Emily",
        lname: "Clark",
        email: "emily.clark@example.com",
        phone_num: "111-222-3333",
    },
    {
        fname: "Frank",
        lname: "Harris",
        email: "frank.harris@example.com",
        phone_num: "999-888-7777",
    },
    {
        fname: "Grace",
        lname: "Lee",
        email: "grace.lee@example.com",
        phone_num: "888-777-6666",
    },
];

// Database clear
const clearDatabase = async () => {
  try {
    await Guest.deleteMany({});
    console.log('Existing guests cleared...');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Insert into seed
const seedGuests = async () => {
  try {
    const createdGuests = await Guest.insertMany(sampleGuests);
    console.log(`${createdGuests.length} properties seeded successfully!`);

    // Show guests
    createdGuests.forEach((guest, index) => {
      console.log(`${index + 1}. ${guest.fname} (${guest.lname})`);
    });
  } catch (error) {
    console.error('Error seeding guests:', error);
  }
};

// Run seed
const runSeeds = async () => {
  console.log('🌱 Starting database seeding...');
  
  await connectDB();
  await clearDatabase();
  await seedGuests();
  
  console.log('✅ Seeding completed!');
  process.exit(0);
};

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// script
if (require.main === module) {
  runSeeds();
}

module.exports = {
  runSeeds,
  seedGuests,
  clearDatabase,
  sampleGuests
};
