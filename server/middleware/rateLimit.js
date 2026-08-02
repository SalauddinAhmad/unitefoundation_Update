const rateLimit = require('express-rate-limit');

// Global limiter — generous, and read-only public GETs are not counted so
// normal site browsing can never exhaust the quota for admins.
exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === 'GET' ||
    req.method === 'OPTIONS' ||
    req.path === '/' ||
    req.path.startsWith('/health'),
  message: { message: 'অনেক বেশি অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
});

// Auth limiter — only FAILED attempts count (successful logins / OTP checks
// are skipped), so a valid admin never gets locked out.
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'অনেকবার চেষ্টা করা হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।' },
});
