if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// --- imports ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const propertyRoutes = require('./routes/property');
const guestRoutes = require('./routes/guest');
const reservationRoutes = require('./routes/reservation');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/auth');
const Guest = require('./models/guest');
const sanitize = require('mongo-sanitize');

// --- app & env ---
const app = express();
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SESSION_SECRET;

// --- basic middlewares ---
const FRONT = new Set([
  'http://localhost:3000',
  'http://localhost:5000',
  'https://guest-house-ecru.vercel.app',
  'https://guest-house-if7i.vercel.app',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow same-origin or SSR
    if (FRONT.has(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// handle preflight requests too
app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true); // required for secure cookies behind proxy

// --- session store & config ---
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: { secret: secret || 'thisshouldbeabettersecret!' }
});
store.on('error', (e) => console.log('SESSION STORE ERROR', e));

const isProd = process.env.NODE_ENV === 'production';

const sessionConfig = {
  store,
  name: 'session',
  secret: secret || 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd, // only true in production (HTTPS)
    sameSite: isProd ? 'none' : 'lax', // allow cross-site in production
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// --- apply session THEN passport ---
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// --- passport strategy ---
passport.use(Guest.createStrategy());
passport.serializeUser(Guest.serializeUser());
passport.deserializeUser(Guest.deserializeUser());

// --- sanitize middleware ---
app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) {
    const cleaned = sanitize({ ...req.query });
    Object.keys(req.query).forEach(k => delete req.query[k]);
    Object.assign(req.query, cleaned);
  }
  next();
});

// --- routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Guesthouse API Server is running!' });
});

app.use('/admin/properties', propertyRoutes);
app.use('/guests', guestRoutes);
app.use('/reservations', reservationRoutes);
app.use('/guests/:id/reviews', reviewRoutes);
app.use('/admin', adminRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Page Not Found', path: req.originalUrl });
});

// --- error handler ---
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Oh No, Something Went Wrong!';
  const payload = { error: message };

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }
  res.status(statusCode).json(payload);
});

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
