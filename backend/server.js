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
const Guest = require('./models/guest'); 

// --- app & env ---
const app = express();
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URL;

// --- basic middlewares ---
app.use(cors({ origin: '*' })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- session store & config---
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60, 
});
store.on('error', (e) => console.log('SESSION STORE ERROR', e));

const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // secure: true,           // 本番(HTTPS)で有効化
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7日
  },
};

// --- apply session THEN passport（
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// --- passport strategy---
passport.use(Guest.createStrategy());
passport.serializeUser(Guest.serializeUser());
passport.deserializeUser(Guest.deserializeUser());

// --- routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Guesthouse API Server is running!' });
});

app.use('/properties', propertyRoutes);
app.use('/guests', guestRoutes);


// --- db & listen ---
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
