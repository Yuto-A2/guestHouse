const mongoose = require('mongoose');
const Reservation = require('../models/reservation');
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
const sampleReservations = [
    {
        start_date: new Date('2025-09-01'),
        end_date: new Date('2025-09-10'),
        guest: "68af4407606ef500f443ef5f",
        property: "68ae03bd81bb26a71d0ebfd9",
    },
    {
        start_date: new Date('2025-09-05'),
        end_date: new Date('2025-09-15'),
        guest: "68af4407606ef500f443ef60",
        property: "68ae03bd81bb26a71d0ebfda",
    },
    {
        start_date: new Date('2025-09-15'),
        end_date: new Date('2025-09-25'),
        guest: "68af4407606ef500f443ef61",
        property: "68ae03bd81bb26a71d0ebfdb",
    },
    {
        start_date: new Date('2025-09-30'),
        end_date: new Date('2025-10-01'),
        guest: "68af4407606ef500f443ef62",
        property: "68ae03bd81bb26a71d0ebfdc",
    },
    {
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-05'),
        guest: "68af4407606ef500f443ef63",
        property: "68ae03bd81bb26a71d0ebfdc",
    },
    {
        start_date: new Date('2025-10-05'),
        end_date: new Date('2025-10-10'),
        guest: "68af4407606ef500f443ef64",
        property: "68ae03bd81bb26a71d0ebfdd",
    },
    {
        start_date: new Date('2025-10-10'),
        end_date: new Date('2025-10-15'),
        guest: "68af4407606ef500f443ef65",
        property: "68ae03bd81bb26a71d0ebfdd",
    },
    {
        start_date: new Date('2025-10-15'),
        end_date: new Date('2025-10-20'),
        guest: "68af4407606ef500f443ef66",
        property: "68ae03bd81bb26a71d0ebfe0",
    },
    {
        start_date: new Date('2025-10-20'),
        end_date: new Date('2025-10-25'),
        guest: "68af4407606ef500f443ef67",
        property: "68ae03bd81bb26a71d0ebfe0",
    },
    {
        start_date: new Date('2025-10-22'),
        end_date: new Date('2025-10-28'),
        guest: "68af4407606ef500f443ef5f",
        property: "68ae03bd81bb26a71d0ebfe0",
    },
];

// Database clear
const clearDatabase = async () => {
    try {
        await Reservation.deleteMany({});
        console.log('Existing reservations cleared...');
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

// Insert into seed
const seedReservations = async () => {
    try {
        const createdReservations = await Reservation.insertMany(sampleReservations);
        console.log(`${createdReservations.length} reservations seeded successfully!`);

        // Show reservations
        createdReservations.forEach((reservation, index) => {
            console.log(`${index + 1}. ${reservation.start_date} (${reservation.end_date})`);
        });
    } catch (error) {
        console.error('Error seeding reservations:', error);
    }
};

// Run seed
const runSeeds = async () => {
    console.log('🌱 Starting database seeding...');

    await connectDB();
    await clearDatabase();
    await seedReservations();

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
    seedReservations,
    clearDatabase,
    sampleReservations
};
