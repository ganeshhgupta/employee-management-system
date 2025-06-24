const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'database', 'employees.db');
const db = new sqlite3.Database(dbPath);

const sampleEmployees = [
  // Engineering Department
  { employee_id: 'ENG001', first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com', phone: '+1234567893', department: 'Engineering', position: 'Senior Software Engineer', salary: 95000, hire_date: '2022-03-15', status: 'active' },
  { employee_id: 'ENG002', first_name: 'David', last_name: 'Chen', email: 'david.chen@company.com', phone: '+1234567894', department: 'Engineering', position: 'Frontend Developer', salary: 78000, hire_date: '2023-01-20', status: 'active' },
  { employee_id: 'ENG003', first_name: 'Emily', last_name: 'Rodriguez', email: 'emily.rodriguez@company.com', phone: '+1234567895', department: 'Engineering', position: 'DevOps Engineer', salary: 88000, hire_date: '2022-08-10', status: 'active' },
  { employee_id: 'ENG004', first_name: 'Michael', last_name: 'Taylor', email: 'michael.taylor@company.com', phone: '+1234567896', department: 'Engineering', position: 'Backend Developer', salary: 85000, hire_date: '2023-05-15', status: 'active' },
  
  // Marketing Department
  { employee_id: 'MKT001', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@company.com', phone: '+1234567897', department: 'Marketing', position: 'Digital Marketing Specialist', salary: 62000, hire_date: '2022-11-30', status: 'active' },
  { employee_id: 'MKT002', first_name: 'James', last_name: 'Brown', email: 'james.brown@company.com', phone: '+1234567898', department: 'Marketing', position: 'Content Creator', salary: 55000, hire_date: '2023-02-14', status: 'active' },
  { employee_id: 'MKT003', first_name: 'Rachel', last_name: 'Davis', email: 'rachel.davis@company.com', phone: '+1234567899', department: 'Marketing', position: 'SEO Specialist', salary: 58000, hire_date: '2022-09-22', status: 'active' },
  
  // Sales Department
  { employee_id: 'SAL001', first_name: 'Robert', last_name: 'Johnson', email: 'robert.johnson@company.com', phone: '+1234567900', department: 'Sales', position: 'Sales Representative', salary: 50000, hire_date: '2022-06-01', status: 'active' },
  { employee_id: 'SAL002', first_name: 'Amanda', last_name: 'Miller', email: 'amanda.miller@company.com', phone: '+1234567901', department: 'Sales', position: 'Senior Sales Executive', salary: 72000, hire_date: '2021-12-15', status: 'active' },
  { employee_id: 'SAL003', first_name: 'Kevin', last_name: 'Garcia', email: 'kevin.garcia@company.com', phone: '+1234567902', department: 'Sales', position: 'Sales Manager', salary: 85000, hire_date: '2021-08-30', status: 'active' },
  
  // Finance Department
  { employee_id: 'FIN001', first_name: 'Jennifer', last_name: 'White', email: 'jennifer.white@company.com', phone: '+1234567903', department: 'Finance', position: 'Financial Analyst', salary: 68000, hire_date: '2022-04-18', status: 'active' },
  { employee_id: 'FIN002', first_name: 'Christopher', last_name: 'Lee', email: 'christopher.lee@company.com', phone: '+1234567904', department: 'Finance', position: 'Accountant', salary: 58000, hire_date: '2023-03-10', status: 'active' },
  { employee_id: 'FIN003', first_name: 'Michelle', last_name: 'Thompson', email: 'michelle.thompson@company.com', phone: '+1234567905', department: 'Finance', position: 'Finance Manager', salary: 92000, hire_date: '2021-11-08', status: 'active' },
  
  // Operations Department
  { employee_id: 'OPS001', first_name: 'Daniel', last_name: 'Martinez', email: 'daniel.martinez@company.com', phone: '+1234567906', department: 'Operations', position: 'Operations Coordinator', salary: 52000, hire_date: '2022-07-25', status: 'active' },
  { employee_id: 'OPS002', first_name: 'Laura', last_name: 'Wilson', email: 'laura.wilson@company.com', phone: '+1234567907', department: 'Operations', position: 'Supply Chain Analyst', salary: 61000, hire_date: '2023-01-05', status: 'active' },
  
  // Customer Support
  { employee_id: 'SUP001', first_name: 'Brian', last_name: 'Moore', email: 'brian.moore@company.com', phone: '+1234567908', department: 'Customer Support', position: 'Support Specialist', salary: 45000, hire_date: '2022-10-12', status: 'active' },
  { employee_id: 'SUP002', first_name: 'Jessica', last_name: 'Taylor', email: 'jessica.taylor@company.com', phone: '+1234567909', department: 'Customer Support', position: 'Senior Support Engineer', salary: 58000, hire_date: '2022-05-20', status: 'active' },
  
  // A few inactive employees for variety
  { employee_id: 'EX001', first_name: 'Mark', last_name: 'Adams', email: 'mark.adams@company.com', phone: '+1234567910', department: 'Engineering', position: 'Software Engineer', salary: 75000, hire_date: '2021-03-15', status: 'inactive' },
  { employee_id: 'EX002', first_name: 'Sophie', last_name: 'Clark', email: 'sophie.clark@company.com', phone: '+1234567911', department: 'Marketing', position: 'Marketing Coordinator', salary: 48000, hire_date: '2021-09-01', status: 'inactive' }
];

const insertSampleData = () => {
  console.log('🚀 Adding enhanced sample data...');
  
  // Clear existing sample data (except the ones we want to keep)
  const deleteQuery = `DELETE FROM employees WHERE created_by = 1 AND employee_id NOT IN ('EMP001', 'EMP002', 'EMP003', 'EMP004')`;
  
  db.run(deleteQuery, (err) => {
    if (err) {
      console.error('Error clearing existing data:', err);
      return;
    }
    
    // Insert new sample data
    const insertQuery = `
      INSERT OR REPLACE INTO employees (
        employee_id, first_name, last_name, email, phone,
        department, position, salary, hire_date, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    
    let completed = 0;
    const total = sampleEmployees.length;
    
    sampleEmployees.forEach((employee) => {
      const values = [
        employee.employee_id, employee.first_name, employee.last_name,
        employee.email, employee.phone, employee.department,
        employee.position, employee.salary, employee.hire_date,
        employee.status
      ];
      
      db.run(insertQuery, values, function(err) {
        if (err) {
          console.error(`Error inserting ${employee.first_name} ${employee.last_name}:`, err);
        } else {
          console.log(`✅ Added: ${employee.first_name} ${employee.last_name} - ${employee.department}`);
        }
        
        completed++;
        if (completed === total) {
          console.log(`🎉 Successfully added ${total} sample employees!`);
          console.log('📊 Departments included:');
          console.log('   - Engineering (5 employees)');
          console.log('   - Marketing (4 employees)');
          console.log('   - Sales (3 employees)');
          console.log('   - Finance (3 employees)');
          console.log('   - Operations (2 employees)');
          console.log('   - Customer Support (2 employees)');
          console.log('   - HR (1 employee - existing)');
          console.log('   - IT (1 employee - existing)');
          console.log('');
          console.log('💰 Salary ranges from $45,000 to $95,000');
          console.log('📅 Hire dates span from 2021 to 2023');
          console.log('👥 Mix of active and inactive employees');
          console.log('');
          console.log('🚀 Your analytics dashboard will now have rich data!');
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('Database connection closed.');
            }
          });
        }
      });
    });
  });
};

// Run the script
insertSampleData();