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
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
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
