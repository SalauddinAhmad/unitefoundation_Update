// Run: node db/migrate.js
// Reads db/schema.sql and executes against configured MySQL.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  console.log('Applying schema…');
  await conn.query(sql);
  console.log('Done.');
  await conn.end();
})().catch(err => { console.error(err); process.exit(1); });
