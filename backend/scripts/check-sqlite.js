const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'employees.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking SQLite Database:', dbPath);

// Check users
db.serialize(() => {
  console.log('\n👥 USERS IN DATABASE:');
  db.all('SELECT id, username, email, role, created_at FROM users ORDER BY id', (err, users) => {
    if (err) {
      console.error('❌ Error fetching users:', err);
    } else {
      console.table(users);
    }
    
    // Check employees
    console.log('\n📊 EMPLOYEES STATISTICS:');
    db.get(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
        COUNT(DISTINCT department) as departments
      FROM employees
    `, (err, stats) => {
      if (err) {
        console.error('❌ Error fetching employee stats:', err);
      } else {
        console.table([stats]);
      }
      
      // Check departments
      console.log('\n🏢 DEPARTMENTS:');
      db.all(`
        SELECT department, COUNT(*) as employee_count 
        FROM employees 
        WHERE department IS NOT NULL 
        GROUP BY department 
        ORDER BY employee_count DESC
      `, (err, depts) => {
        if (err) {
          console.error('❌ Error fetching departments:', err);
        } else {
          console.table(depts);
        }
        
        // Test admin password
        console.log('\n🔐 TESTING PASSWORDS:');
        db.get('SELECT password FROM users WHERE email = ?', ['admin@company.com'], async (err, adminUser) => {
          if (err) {
            console.error('❌ Error fetching admin user:', err);
          } else if (adminUser) {
            console.log('✅ Admin user exists');
            
            const bcrypt = require('bcrypt');
            try {
              const isValid = await bcrypt.compare('admin123', adminUser.password);
              console.log('Admin password "admin123" is valid:', isValid ? '✅ YES' : '❌ NO');
            } catch (error) {
              console.log('❌ Password check failed:', error.message);
            }
          } else {
            console.log('❌ Admin user not found!');
          }
          
          // Test regular user
          db.get('SELECT password FROM users WHERE email = ?', ['test@example.com'], async (err, testUser) => {
            if (err) {
              console.error('❌ Error fetching test user:', err);
            } else if (testUser) {
              console.log('✅ Test user exists');
              
              const bcrypt = require('bcrypt');
              try {
                const isValid = await bcrypt.compare('password123', testUser.password);
                console.log('Test user password "password123" is valid:', isValid ? '✅ YES' : '❌ NO');
              } catch (error) {
                console.log('❌ Password check failed:', error.message);
              }
            } else {
              console.log('❌ Test user (test@example.com) not found!');
            }
            
            db.close();
            console.log('\n🔚 Database check complete');
          });
        });
      });
    });
  });
});