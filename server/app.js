// ================================================================
// Unite Foundation API — Entry Point
// Compatible with cPanel Node.js App Manager (Passenger)
// ================================================================
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimit');

const app = express();

// --- Core middleware ---
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- CORS ---
// Built-in safe defaults so the site keeps working even if CORS_ORIGINS
// env var is missing on the server (e.g. after re-creating the Node.js app).
const DEFAULT_ORIGINS = [
  'https://unitefoundation.bd',
  'https://www.unitefoundation.bd',
  'http://localhost:8080',
];
const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const origins = [...new Set([...DEFAULT_ORIGINS, ...envOrigins])];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origins.includes(origin)) return cb(null, true);
    // Allow Lovable preview/staging origins
    if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin)) return cb(null, true);
    return cb(null, false); // respond without CORS headers instead of 500
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
}));

// --- Global rate limit ---
app.use(globalLimiter);

// --- Static uploads ---
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || './uploads')));

// --- Health ---
app.get('/', (_req, res) => res.json({ ok: true, service: 'unite-foundation-api', ts: new Date().toISOString() }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Routes ---
app.use('/auth', require('./routes/auth'));
app.use('/donations', require('./routes/donations'));
app.use('/applications', require('./routes/applications'));
app.use('/projects', require('./routes/projects'));
app.use('/posts', require('./routes/posts'));
app.use('/gallery', require('./routes/gallery'));
app.use('/messages', require('./routes/messages'));
app.use('/settings', require('./routes/settings'));
app.use('/team', require('./routes/team'));
app.use('/admin', require('./routes/admin'));
app.use('/stats', require('./routes/stats'));

// --- 404 + errors ---
app.use((_req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

module.exports = app;
