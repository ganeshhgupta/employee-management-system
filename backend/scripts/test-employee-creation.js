const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'employees.db');
const db = new sqlite3.Database(dbPath);

const testEmployeeCreation = () => {
  console.log('🧪 Testing employee creation...');
  
  // Test data
  const testEmployee = {
    employee_id: 'TEST001',
    first_name: 'Test',
    last_name: 'Employee',
    email: 'test.employee@company.com',
    phone: '+1234567999',
    department: 'Testing',
    position: 'Test Specialist',
    salary: 60000,
    hire_date: '2024-01-01',
    created_by: 1 // Admin user ID
  };
  
  // Check if employees table structure is correct
  db.all("PRAGMA table_info(employees)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking employees table structure:', err);
      db.close();
      return;
    }
    
    console.log('📋 Employees table structure:');
    console.table(columns);
    
    // Try to insert test employee
    const insertSQL = `
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone,
        department, position, salary, hire_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertSQL, [
      testEmployee.employee_id,
      testEmployee.first_name,
      testEmployee.last_name,
      testEmployee.email,
      testEmployee.phone,
      testEmployee.department,
      testEmployee.position,
      testEmployee.salary,
      testEmployee.hire_date,
      testEmployee.created_by
    ], function(err) {
      if (err) {
        console.error('❌ Error inserting test employee:', err);
        console.error('Error details:', err.message);
      } else {
        console.log('✅ Test employee created successfully!');
        console.log('Employee ID:', this.lastID);
        
        // Verify the employee exists
        db.get('SELECT * FROM employees WHERE id = ?', [this.lastID], (err, employee) => {
          if (err) {
            console.error('❌ Error fetching created employee:', err);
          } else {
            console.log('✅ Created employee details:');
            console.table([employee]);
          }
          
          // Clean up - delete test employee
          db.run('DELETE FROM employees WHERE id = ?', [this.lastID], (err) => {
            if (err) {
              console.error('❌ Error cleaning up test employee:', err);
            } else {
              console.log('🧹 Test employee cleaned up');
            }
            
            // Check foreign key constraints
            db.get('PRAGMA foreign_keys', (err, fkStatus) => {
              console.log('🔗 Foreign keys enabled:', fkStatus);
              
              db.close();
              console.log('🔚 Employee creation test complete');
            });
          });
        });
      }
    });
  });
};

testEmployeeCreation();