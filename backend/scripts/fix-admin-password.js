const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'employees.db');
const db = new sqlite3.Database(dbPath);

const fixAdminPassword = async () => {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed successfully');
    
    // Update admin user password
    db.run(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@company.com'],
      function(err) {
        if (err) {
          console.error('❌ Error updating admin password:', err);
        } else {
          console.log('✅ Admin password updated successfully');
          console.log('👤 Admin login: admin@company.com / admin123');
        }
        
        // Fix your user password too
        fixUserPassword();
      }
    );
    
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    db.close();
  }
};

const fixUserPassword = async () => {
  try {
    console.log('🔧 Setting password for your user account...');
    
    // Set a known password for your email
    const userPassword = await bcrypt.hash('ganesh123', 10);
    
    db.run(
      'UPDATE users SET password = ? WHERE email = ?',
      [userPassword, 'iamgs10rk@gmail.com'],
      function(err) {
        if (err) {
          console.error('❌ Error updating user password:', err);
        } else {
          console.log('✅ Your user password updated successfully');
          console.log('👤 Your login: iamgs10rk@gmail.com / ganesh123');
        }
        
        // Test passwords
        testPasswords();
      }
    );
    
  } catch (error) {
    console.error('❌ Error setting user password:', error);
    db.close();
  }
};

const testPasswords = () => {
  console.log('\n🧪 Testing passwords...');
  
  // Test admin password
  db.get('SELECT password FROM users WHERE email = ?', ['admin@company.com'], async (err, admin) => {
    if (admin) {
      const isValidAdmin = await bcrypt.compare('admin123', admin.password);
      console.log('Admin password test:', isValidAdmin ? '✅ VALID' : '❌ INVALID');
    }
    
    // Test your password
    db.get('SELECT password FROM users WHERE email = ?', ['iamgs10rk@gmail.com'], async (err, user) => {
      if (user) {
        const isValidUser = await bcrypt.compare('ganesh123', user.password);
        console.log('Your password test:', isValidUser ? '✅ VALID' : '❌ INVALID');
      }
      
      // Test other user
      db.get('SELECT password FROM users WHERE email = ?', ['test@example.com'], async (err, testUser) => {
        if (testUser) {
          const isValidTest = await bcrypt.compare('password123', testUser.password);
          console.log('Test user password test:', isValidTest ? '✅ VALID' : '❌ INVALID');
        }
        
        console.log('\n🎉 Password fix complete!');
        console.log('\n👥 Working login credentials:');
        console.log('   Admin: admin@company.com / admin123');
        console.log('   Your account: iamgs10rk@gmail.com / ganesh123');
        console.log('   Test account: test@example.com / password123');
        
        db.close();
      });
    });
  });
};

// Run the fix
fixAdminPassword();