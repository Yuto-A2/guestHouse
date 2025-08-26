const mongoose = require('mongoose');
const Property = require('../models/property');
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
const sampleProperties = [
  {
        address: "1204 Avenue Rd",
        property_type: "Condominium",
    },
    {
        address: "195 Redpath Ave",
        property_type: "Condominium",
    },
    {
        address: "251 Jarvis St",
        property_type: "Appartment",
    },
        {
        address: "153 Church St",
        property_type: "Apartment",
    },
    {
        address: "1553 Bloor St W",
        property_type: "Townhouse/Row House",
    },
    {
        address: "16 Marquette",
        property_type: "Condominium",
    },
        {
        address: "458 Richmond St W",
        property_type: "Condominium",
    },
    {
        address: "1787 St Clair Ave W",
        property_type: "Apartment",
    },
    {
        address: "2412 Danforth Ave",
        property_type: "Duplex/Triplex/Fourplex",
    },
];

// Database clear
const clearDatabase = async () => {
  try {
    await Property.deleteMany({});
    console.log('Existing properties cleared...');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Insert into seed
const seedProperties = async () => {
  try {
    const createdProperties = await Property.insertMany(sampleProperties);
    console.log(`${createdProperties.length} properties seeded successfully!`);

    // Show properties
    createdProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.address} (${property.property_type})`);
    });
  } catch (error) {
    console.error('Error seeding properties:', error);
  }
};

// Run seed
const runSeeds = async () => {
  console.log('🌱 Starting database seeding...');
  
  await connectDB();
  await clearDatabase();
  await seedProperties();
  
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
  seedProperties,
  clearDatabase,
  sampleProperties
};
