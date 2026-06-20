// backend/src/config/db.js
// SQL Server connection pool using mssql package.
// Call connectDB() once at startup; use getPool() everywhere else.

const sql = require('mssql');
require('dotenv').config();

const config = {
  server:   process.env.DB_SERVER   || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME     || 'depi',
  user:     process.env.DB_USER     || 'sa',
  password: process.env.DB_PASSWORD,
  options: {
    encrypt:                process.env.DB_ENCRYPT    === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    enableArithAbort:       true,
  },
  pool: {
    max:                10,
    min:                0,
    idleTimeoutMillis:  30000,
  },
};

let pool = null;

// Initialize connection pool – call once on server startup
const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server  →  database: depi');
    return pool;
  } catch (err) {
    console.error('❌ SQL Server connection failed:', err.message);
    process.exit(1);
  }
};

// Returns the active pool; throws if connectDB() was never called
const getPool = () => {
  if (!pool) throw new Error('Database not initialized. Call connectDB() first.');
  return pool;
};

module.exports = { connectDB, getPool, sql };
