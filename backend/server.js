if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
const Guest = require('./models/guest');
const sanitize = require('mongo-sanitize');

const app = express();
const PORT = process.env.PORT || 3000;
const dbUrl = process.env.MONGO_URL;
const secret = process.env.SESSION_SECRET || 'thisshouldbeabettersecret!';

// ▼ 本番は必ず信頼プロキシを有効化（secure cookieが有効に）
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ▼ CORS: フロントのオリジンを明示（* は使わない）
const FRONT = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://guest-house-ecru.vercel.app', // ←使っている本番URLに合わせて調整
];

// fetch が credentials:'include' の時は origin を特定し、credentials:true
app.use(
  cors({
    origin: (origin, cb) => {
      // 開発ツールやcurl等Originなしも許可
      if (!origin) return cb(null, true);
      if (FRONT.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ▼ セッション（secretは絶対に安定させる）
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: { secret }, // ← これを環境ごとに変えない
});
store.on('error', (e) => console.log('SESSION STORE ERROR', e));

const isProd = process.env.NODE_ENV === 'production';

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: false, // 既定はfalse推奨（空セッションを作らない）
  cookie: {
    httpOnly: true,
    secure: isProd,                   // 本番は true
    sameSite: isProd ? 'none' : 'lax',// クロスサイトは 'none'
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// ▼ passport-local-mongoose を想定
passport.use(Guest.createStrategy());
passport.serializeUser(Guest.serializeUser());
passport.deserializeUser(Guest.deserializeUser());

// ▼ サニタイズ（JSONパース後）
app.use((req, _res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) {
    const cleaned = sanitize({ ...req.query });
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, cleaned);
  }
  next();
});

app.get('/health', (_req, res) => res.send('ok'));

// ▼ ルーティング
app.get('/', (_req, res) => {
  res.json({ message: 'Guesthouse API Server is running!' });
});

app.use('/properties', propertyRoutes);
app.use('/guests', guestRoutes);
app.use('/reservations', reservationRoutes);
app.use('/guests/:id/reviews', reviewRoutes); // 子Router側は mergeParams: true が必要

app.use((req, res) => {
  res.status(404).json({ error: 'Page Not Found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Oh No, Something Went Wrong!';
  const payload = { error: message };
  if (process.env.NODE_ENV === 'development') payload.stack = err.stack;
  res.status(statusCode).json(payload);
});

// ▼ DB接続
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
