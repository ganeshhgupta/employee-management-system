const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Your Neon connection string
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_erBI8HpXcVM5@ep-old-dew-a51lzyuk-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  try {
    await client.connect();
    console.log('🔗 Connected to Neon PostgreSQL');

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
      );
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
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute table creation
    await client.query(createUsersTable);
    console.log('✅ Users table created');

    await client.query(createEmployeesTable);
    console.log('✅ Employees table created');

    // Insert default admin user with hashed password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = `
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@company.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `;
    
    await client.query(adminUser, [hashedPassword]);
    console.log('✅ Default admin user ready (admin@company.com / admin123)');

    // Insert comprehensive sample employees for impressive analytics
    const sampleEmployees = [
      // Engineering Department (8 employees)
      { employee_id: 'ENG001', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com', phone: '+1234567893', department: 'Engineering', position: 'Senior Software Engineer', salary: 95000.00, hire_date: '2022-03-15', status: 'active' },
      { employee_id: 'ENG002', first_name: 'David', last_name: 'Chen', email: 'david.chen@company.com', phone: '+1234567894', department: 'Engineering', position: 'Frontend Developer', salary: 78000.00, hire_date: '2023-01-20', status: 'active' },
      { employee_id: 'ENG003', first_name: 'Emily', last_name: 'Rodriguez', email: 'emily.rodriguez@company.com', phone: '+1234567895', department: 'Engineering', position: 'DevOps Engineer', salary: 88000.00, hire_date: '2022-08-10', status: 'active' },
      { employee_id: 'ENG004', first_name: 'Michael', last_name: 'Taylor', email: 'michael.taylor@company.com', phone: '+1234567896', department: 'Engineering', position: 'Backend Developer', salary: 85000.00, hire_date: '2023-05-15', status: 'active' },
      { employee_id: 'ENG005', first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com', phone: '+1234567890', department: 'Engineering', position: 'Software Developer', salary: 75000.00, hire_date: '2023-01-15', status: 'active' },

      // Marketing Department (5 employees)
      { employee_id: 'MKT001', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@company.com', phone: '+1234567897', department: 'Marketing', position: 'Digital Marketing Specialist', salary: 62000.00, hire_date: '2022-11-30', status: 'active' },
      { employee_id: 'MKT002', first_name: 'James', last_name: 'Brown', email: 'james.brown@company.com', phone: '+1234567898', department: 'Marketing', position: 'Content Creator', salary: 55000.00, hire_date: '2023-02-14', status: 'active' },
      { employee_id: 'MKT003', first_name: 'Rachel', last_name: 'Davis', email: 'rachel.davis@company.com', phone: '+1234567899', department: 'Marketing', position: 'SEO Specialist', salary: 58000.00, hire_date: '2022-09-22', status: 'active' },
      { employee_id: 'MKT004', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com', phone: '+1234567891', department: 'Marketing', position: 'Marketing Manager', salary: 70000.00, hire_date: '2023-02-01', status: 'active' },

      // Sales Department (3 employees)
      { employee_id: 'SAL001', first_name: 'Robert', last_name: 'Johnson', email: 'robert.johnson@company.com', phone: '+1234567900', department: 'Sales', position: 'Sales Representative', salary: 50000.00, hire_date: '2022-06-01', status: 'active' },
      { employee_id: 'SAL002', first_name: 'Amanda', last_name: 'Miller', email: 'amanda.miller@company.com', phone: '+1234567901', department: 'Sales', position: 'Senior Sales Executive', salary: 72000.00, hire_date: '2021-12-15', status: 'active' },
      { employee_id: 'SAL003', first_name: 'Kevin', last_name: 'Garcia', email: 'kevin.garcia@company.com', phone: '+1234567902', department: 'Sales', position: 'Sales Manager', salary: 85000.00, hire_date: '2021-08-30', status: 'active' },

      // Finance Department (3 employees)
      { employee_id: 'FIN001', first_name: 'Jennifer', last_name: 'White', email: 'jennifer.white@company.com', phone: '+1234567903', department: 'Finance', position: 'Financial Analyst', salary: 68000.00, hire_date: '2022-04-18', status: 'active' },
      { employee_id: 'FIN002', first_name: 'Christopher', last_name: 'Lee', email: 'christopher.lee@company.com', phone: '+1234567904', department: 'Finance', position: 'Accountant', salary: 58000.00, hire_date: '2023-03-10', status: 'active' },
      { employee_id: 'FIN003', first_name: 'Michelle', last_name: 'Thompson', email: 'michelle.thompson@company.com', phone: '+1234567905', department: 'Finance', position: 'Finance Manager', salary: 92000.00, hire_date: '2021-11-08', status: 'active' },

      // Operations Department (2 employees)
      { employee_id: 'OPS001', first_name: 'Daniel', last_name: 'Martinez', email: 'daniel.martinez@company.com', phone: '+1234567906', department: 'Operations', position: 'Operations Coordinator', salary: 52000.00, hire_date: '2022-07-25', status: 'active' },
      { employee_id: 'OPS002', first_name: 'Laura', last_name: 'Wilson', email: 'laura.wilson@company.com', phone: '+1234567907', department: 'Operations', position: 'Supply Chain Analyst', salary: 61000.00, hire_date: '2023-01-05', status: 'active' },

      // Customer Support (2 employees)
      { employee_id: 'SUP001', first_name: 'Brian', last_name: 'Moore', email: 'brian.moore@company.com', phone: '+1234567908', department: 'Customer Support', position: 'Support Specialist', salary: 45000.00, hire_date: '2022-10-12', status: 'active' },
      { employee_id: 'SUP002', first_name: 'Jessica', last_name: 'Taylor', email: 'jessica.taylor@company.com', phone: '+1234567909', department: 'Customer Support', position: 'Senior Support Engineer', salary: 58000.00, hire_date: '2022-05-20', status: 'active' },

      // HR Department (1 employee)
      { employee_id: 'HR001', first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com', phone: '+1234567892', department: 'HR', position: 'HR Specialist', salary: 55000.00, hire_date: '2023-03-10', status: 'active' },

      // A few inactive employees for variety
      { employee_id: 'EX001', first_name: 'Mark', last_name: 'Adams', email: 'mark.adams@company.com', phone: '+1234567910', department: 'Engineering', position: 'Software Engineer', salary: 75000.00, hire_date: '2021-03-15', status: 'inactive' },
      { employee_id: 'EX002', first_name: 'Sophie', last_name: 'Clark', email: 'sophie.clark@company.com', phone: '+1234567911', department: 'Marketing', position: 'Marketing Coordinator', salary: 48000.00, hire_date: '2021-09-01', status: 'inactive' }
    ];

    for (const employee of sampleEmployees) {
      const insertEmployee = `
        INSERT INTO employees (
          employee_id, first_name, last_name, email, phone,
          department, position, salary, hire_date, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
        ON CONFLICT (email) DO NOTHING;
      `;

      await client.query(insertEmployee, [
        employee.employee_id,
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.phone,
        employee.department,
        employee.position,
        employee.salary,
        employee.hire_date,
        employee.status || 'active'
      ]);

      console.log(`✅ Added: ${employee.first_name} ${employee.last_name} - ${employee.department}`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log('📊 Database now contains:');
    console.log('   - Engineering: 5 employees');
    console.log('   - Marketing: 4 employees'); 
    console.log('   - Sales: 3 employees');
    console.log('   - Finance: 3 employees');
    console.log('   - Operations: 2 employees');
    console.log('   - Customer Support: 2 employees');
    console.log('   - HR: 1 employee');
    console.log('   - Inactive: 2 employees');
    console.log('');
    console.log('💰 Salary ranges from $45,000 to $95,000');
    console.log('📅 Hire dates span from 2021 to 2023');
    console.log('👥 Total: 22 employees across 7 departments');
    console.log('');
    console.log('🚀 Your analytics dashboard will now show rich data!');
    console.log('🔑 Admin login: admin@company.com / admin123');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
};

createTables();