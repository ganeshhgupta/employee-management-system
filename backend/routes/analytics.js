const express = require('express');
const jwt = require('jsonwebtoken');
const { query, get, all } = require('../config/database-pg');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Department-wise analytics
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const queryText = `
      SELECT 
        department,
        COUNT(*) as employee_count,
        AVG(salary) as avg_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary,
        SUM(salary) as total_salary,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_employees
      FROM employees 
      WHERE department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY employee_count DESC
    `;

    const results = await all(queryText);

    res.json({
      departments: results.map(dept => ({
        ...dept,
        avg_salary: Math.round(parseFloat(dept.avg_salary) || 0),
        min_salary: parseFloat(dept.min_salary) || 0,
        max_salary: parseFloat(dept.max_salary) || 0,
        total_salary: parseFloat(dept.total_salary) || 0,
        employee_count: parseInt(dept.employee_count),
        active_employees: parseInt(dept.active_employees),
        inactive_employees: parseInt(dept.inactive_employees)
      }))
    });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ message: 'Error fetching department analytics' });
  }
});

// Salary analysis and trends
router.get('/salary-analysis', authenticateToken, async (req, res) => {
  try {
    const queries = {
      salaryRanges: `
        SELECT 
          CASE 
            WHEN salary < 50000 THEN '< $50K'
            WHEN salary >= 50000 AND salary < 75000 THEN '$50K - $75K'
            WHEN salary >= 75000 AND salary < 100000 THEN '$75K - $100K'
            WHEN salary >= 100000 AND salary < 150000 THEN '$100K - $150K'
            WHEN salary >= 150000 THEN '$150K+'
            ELSE 'Not Specified'
          END as salary_range,
          COUNT(*) as count
        FROM employees 
        WHERE salary IS NOT NULL
        GROUP BY salary_range
        ORDER BY MIN(salary)
      `,
      salaryByDepartment: `
        SELECT 
          department,
          AVG(salary) as avg_salary,
          COUNT(*) as employee_count
        FROM employees 
        WHERE department IS NOT NULL AND department != '' AND salary IS NOT NULL
        GROUP BY department
        ORDER BY avg_salary DESC
      `,
      salaryStats: `
        SELECT 
          AVG(salary) as avg_salary,
          MIN(salary) as min_salary,
          MAX(salary) as max_salary,
          COUNT(*) as total_employees_with_salary
        FROM employees 
        WHERE salary IS NOT NULL
      `
    };

    // Execute all queries
    const [salaryRanges, salaryByDepartment, salaryStatsResult] = await Promise.all([
      all(queries.salaryRanges),
      all(queries.salaryByDepartment),
      get(queries.salaryStats)
    ]);

    res.json({
      salaryRanges: salaryRanges || [],
      salaryByDepartment: (salaryByDepartment || []).map(dept => ({
        ...dept,
        avg_salary: Math.round(parseFloat(dept.avg_salary) || 0),
        employee_count: parseInt(dept.employee_count)
      })),
      salaryStats: salaryStatsResult || {
        avg_salary: 0,
        min_salary: 0,
        max_salary: 0,
        total_employees_with_salary: 0
      }
    });
  } catch (error) {
    console.error('Error fetching salary analysis:', error);
    res.status(500).json({ message: 'Error fetching salary analysis' });
  }
});

// Employee metrics and performance
router.get('/employee-metrics', authenticateToken, async (req, res) => {
  try {
    const queries = {
      statusDistribution: `
        SELECT 
          status,
          COUNT(*) as count
        FROM employees 
        GROUP BY status
      `,
      hireDateTrends: `
        SELECT 
          EXTRACT(YEAR FROM hire_date) as year,
          EXTRACT(MONTH FROM hire_date) as month,
          COUNT(*) as hires
        FROM employees 
        WHERE hire_date IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM hire_date), EXTRACT(MONTH FROM hire_date)
        ORDER BY year DESC, month DESC
        LIMIT 12
      `,
      departmentGrowth: `
        SELECT 
          department,
          COUNT(*) as current_count,
          EXTRACT(YEAR FROM MIN(hire_date)) as first_hire_year,
          EXTRACT(YEAR FROM MAX(hire_date)) as latest_hire_year
        FROM employees 
        WHERE department IS NOT NULL AND department != ''
        GROUP BY department
      `,
      employeeTenure: `
        SELECT 
          employee_id,
          first_name,
          last_name,
          department,
          hire_date,
          CASE 
            WHEN hire_date IS NOT NULL 
            THEN ROUND(EXTRACT(EPOCH FROM (CURRENT_DATE - hire_date)) / (365.25 * 24 * 3600), 1)
            ELSE 0 
          END as tenure_years
        FROM employees 
        WHERE hire_date IS NOT NULL
        ORDER BY tenure_years DESC
      `
    };

    const [statusDistribution, hireDateTrends, departmentGrowth, employeeTenure] = await Promise.all([
      all(queries.statusDistribution),
      all(queries.hireDateTrends),
      all(queries.departmentGrowth),
      all(queries.employeeTenure)
    ]);

    res.json({
      statusDistribution: statusDistribution || [],
      hireDateTrends: (hireDateTrends || []).reverse().map(trend => ({
        ...trend,
        year: parseInt(trend.year),
        month: parseInt(trend.month),
        hires: parseInt(trend.hires)
      })),
      departmentGrowth: (departmentGrowth || []).map(growth => ({
        ...growth,
        current_count: parseInt(growth.current_count),
        first_hire_year: parseInt(growth.first_hire_year),
        latest_hire_year: parseInt(growth.latest_hire_year)
      })),
      employeeTenure: (employeeTenure || []).map(tenure => ({
        ...tenure,
        tenure_years: parseFloat(tenure.tenure_years)
      }))
    });
  } catch (error) {
    console.error('Error fetching employee metrics:', error);
    res.status(500).json({ message: 'Error fetching employee metrics' });
  }
});

// Overall dashboard stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const queryText = `
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_employees,
        COUNT(DISTINCT department) as total_departments,
        AVG(salary) as avg_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary,
        COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_hires,
        COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '365 days' THEN 1 END) as hires_this_year
      FROM employees
    `;

    const stats = await get(queryText);

    res.json({
      stats: {
        total_employees: parseInt(stats.total_employees),
        active_employees: parseInt(stats.active_employees),
        inactive_employees: parseInt(stats.inactive_employees),
        total_departments: parseInt(stats.total_departments),
        avg_salary: Math.round(parseFloat(stats.avg_salary) || 0),
        min_salary: parseFloat(stats.min_salary) || 0,
        max_salary: parseFloat(stats.max_salary) || 0,
        recent_hires: parseInt(stats.recent_hires),
        hires_this_year: parseInt(stats.hires_this_year)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Department comparison
router.get('/department-comparison', authenticateToken, async (req, res) => {
  try {
    const queryText = `
      SELECT 
        department,
        COUNT(*) as employee_count,
        AVG(salary) as avg_salary,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN hire_date >= CURRENT_DATE - INTERVAL '365 days' THEN 1 END) as new_hires_this_year,
        AVG(CASE 
          WHEN hire_date IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (CURRENT_DATE - hire_date)) / (365.25 * 24 * 3600)
          ELSE 0 
        END) as avg_tenure_years
      FROM employees 
      WHERE department IS NOT NULL AND department != ''
      GROUP BY department
      ORDER BY employee_count DESC
    `;

    const results = await all(queryText);

    res.json({
      departments: results.map(dept => ({
        department: dept.department,
        employee_count: parseInt(dept.employee_count),
        avg_salary: Math.round(parseFloat(dept.avg_salary) || 0),
        active_count: parseInt(dept.active_count),
        new_hires_this_year: parseInt(dept.new_hires_this_year),
        avg_tenure_years: Math.round((parseFloat(dept.avg_tenure_years) || 0) * 10) / 10
      }))
    });
  } catch (error) {
    console.error('Error fetching department comparison:', error);
    res.status(500).json({ message: 'Error fetching department comparison' });
  }
});

module.exports = router;