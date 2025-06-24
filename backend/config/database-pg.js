const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Helper function to execute queries
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Helper function to get single row
const get = async (text, params) => {
  const result = await query(text, params);
  return result.rows[0];
};

// Helper function to get all rows
const all = async (text, params) => {
  const result = await query(text, params);
  return result.rows;
};

// Helper function to run insert/update/delete
const run = async (text, params) => {
  const result = await query(text, params);
  return {
    lastID: result.rows[0]?.id,
    changes: result.rowCount
  };
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create employees table
    const createEmployeesTable = `
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(50),
        position VARCHAR(100),
        salary DECIMAL(10,2),
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        address TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `;

    await query(createUsersTable);
    console.log('✅ Users table ready');

    await query(createEmployeesTable);
    console.log('✅ Employees table ready');

    console.log('✅ Database initialization complete');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

module.exports = {
  pool,
  query,
  get,
  all,
  run,
  initializeDatabase
};