// --- imports ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

const propertyRoutes = require('./routes/property');
const guestRoutes = require('./routes/guest');
const reservationRoutes = require('./routes/reservation');
const reviewRoutes = require('./routes/reviews');
const Guest = require('./models/guest'); 

// --- app & env ---
const app = express();
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SESSION_SECRET;

// --- CORS設定をVercel用に修正 ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://your-frontend.vercel.app', // 実際のフロントエンドURL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MongoDB接続を関数化 ---
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const connection = await mongoose.connect(dbUrl);
  cachedDb = connection;
  return connection;
}

// --- session store & config---
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
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// --- passport strategy---
passport.use(Guest.createStrategy());
passport.serializeUser(Guest.serializeUser());
passport.deserializeUser(Guest.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

// --- routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Guesthouse API Server is running!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API endpoint working!' });
});

app.use('/properties', propertyRoutes);
app.use('/guests', guestRoutes);
app.use('/reservations', reservationRoutes);
app.use('/guests/:id/reviews', reviewRoutes);

// --- Vercel用のハンドラー ---
app.use((req, res, next) => {
  connectToDatabase()
    .then(() => next())
    .catch(next);
});

// --- Vercelのexport ---
module.exports = app;

// --- ローカル開発用 ---
if (process.env.NODE_ENV !== 'production') {
  const port = PORT;
  connectToDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}