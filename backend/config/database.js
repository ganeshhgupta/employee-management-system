const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'employees.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

// Initialize database tables
const initializeDatabase = () => {
  // Users table for authentication
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      google_id VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Employees table
  const createEmployeesTable = `
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `;

  // Execute table creation
  db.serialize(() => {
    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
      } else {
        console.log('✅ Users table ready');
      }
    });

    db.run(createEmployeesTable, (err) => {
      if (err) {
        console.error('❌ Error creating employees table:', err.message);
      } else {
        console.log('✅ Employees table ready');
      }
    });

    // Create default admin user
    const adminUser = `
      INSERT OR IGNORE INTO users (username, email, password, role)
      VALUES ('admin', 'admin@company.com', '$2b$10$rQjPz6Uq8Y2ZKqQjPz6Uq8Y2ZKqQjPz6Uq8Y2ZKqQjPz6Uq8Y2ZKq', 'admin')
    `;
    
    db.run(adminUser, (err) => {
      if (err) {
        console.error('❌ Error creating admin user:', err.message);
      } else {
        console.log('✅ Default admin user ready (admin@company.com)');
      }
    });

    // Insert some sample employees
    const sampleEmployees = `
      INSERT OR IGNORE INTO employees 
      (employee_id, first_name, last_name, email, phone, department, position, salary, hire_date, created_by)
      VALUES 
      ('EMP001', 'John', 'Doe', 'john.doe@company.com', '+1234567890', 'Engineering', 'Software Developer', 75000.00, '2023-01-15', 1),
      ('EMP002', 'Jane', 'Smith', 'jane.smith@company.com', '+1234567891', 'Marketing', 'Marketing Manager', 65000.00, '2023-02-01', 1),
      ('EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', '+1234567892', 'HR', 'HR Specialist', 55000.00, '2023-03-10', 1)
    `;

    db.run(sampleEmployees, (err) => {
      if (err) {
        console.error('❌ Error creating sample employees:', err.message);
      } else {
        console.log('✅ Sample employees added');
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase
};