const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // Shared cPanel hosting has tight NPROC/EP limits — keep the DB pool tiny.
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 2),
  maxIdle: Number(process.env.DB_MAX_IDLE || 1),
  queueLimit: Number(process.env.DB_QUEUE_LIMIT || 10),
  idleTimeout: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
  enableKeepAlive: false,
  charset: 'utf8mb4_unicode_ci',
  timezone: '+00:00',
});

module.exports = pool;
