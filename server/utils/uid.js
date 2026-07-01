const crypto = require('crypto');
exports.uuid = () => crypto.randomUUID();
exports.shortId = (prefix = '') => prefix + crypto.randomBytes(6).toString('hex').toUpperCase();
exports.token = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
