const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_erBI8HpXcVM5@ep-old-dew-a51lzyuk-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

const checkDatabase = async () => {
  try {
    await client.connect();
    console.log('🔗 Connected to Neon PostgreSQL');

    // Check users
    console.log('\n👥 USERS IN DATABASE:');
    const users = await client.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
    console.table(users.rows);

    // Check employees count
    console.log('\n📊 EMPLOYEES STATISTICS:');
    const employeeStats = await client.query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
        COUNT(DISTINCT department) as departments
      FROM employees
    `);
    console.table(employeeStats.rows);

    // Check departments
    console.log('\n🏢 DEPARTMENTS:');
    const depts = await client.query(`
      SELECT department, COUNT(*) as employee_count 
      FROM employees 
      WHERE department IS NOT NULL 
      GROUP BY department 
      ORDER BY employee_count DESC
    `);
    console.table(depts.rows);

    // Test password for admin user
    console.log('\n🔐 ADMIN USER PASSWORD CHECK:');
    const adminUser = await client.query('SELECT password FROM users WHERE email = $1', ['admin@company.com']);
    if (adminUser.rows.length > 0) {
      console.log('✅ Admin user exists');
      console.log('Password hash starts with:', adminUser.rows[0].password.substring(0, 10) + '...');
      
      // Test bcrypt comparison
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare('admin123', adminUser.rows[0].password);
      console.log('Password "admin123" is valid:', isValid ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Admin user not found!');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
};

checkDatabase();