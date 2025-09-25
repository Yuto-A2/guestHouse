const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

// ルートとモデルのインポート
const propertyRoutes = require('../routes/property');
const guestRoutes = require('../routes/guest');
const reservationRoutes = require('../routes/reservation');
const reviewRoutes = require('../routes/reviews');
const Guest = require('../models/guest');

const app = express();
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SESSION_SECRET;

// CORS設定
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://your-frontend.vercel.app'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB接続（Vercel用）
let cachedConnection = null;

async function connectToDatabase() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    
    try {
        cachedConnection = await mongoose.connect(dbUrl, {
            bufferCommands: false,
            maxPoolSize: 1,
        });
        console.log('MongoDB connected');
        return cachedConnection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// セッション設定
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
    store,
    name: 'session',
    secret: secret || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Passport設定
passport.use(Guest.createStrategy());
passport.serializeUser(Guest.serializeUser());
passport.deserializeUser(Guest.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// DB接続ミドルウェア
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ルート
app.get('/', (req, res) => {
    res.json({ 
        message: 'Guesthouse API Server is running!',
        timestamp: new Date().toISOString()
    });
});

app.use('/properties', propertyRoutes);
app.use('/guests', guestRoutes);
app.use('/reservations', reservationRoutes);
app.use('/guests/:id/reviews', reviewRoutes);

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

module.exports = app;