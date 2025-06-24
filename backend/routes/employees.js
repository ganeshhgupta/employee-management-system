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

// Health check route
router.get('/health', (req, res) => {
  res.json({ message: 'Employee routes are working!' });
});

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '' } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT id, employee_id, first_name, last_name, email, phone, 
             department, position, salary, hire_date, status
      FROM employees 
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      queryText += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex + 1} OR email ILIKE $${paramIndex + 2} OR employee_id ILIKE $${paramIndex + 3})`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
      paramIndex += 4;
    }

    // Add department filter
    if (department) {
      queryText += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const employees = await all(queryText, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM employees WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (first_name ILIKE $${countParamIndex} OR last_name ILIKE $${countParamIndex + 1} OR email ILIKE $${countParamIndex + 2} OR employee_id ILIKE $${countParamIndex + 3})`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
      countParamIndex += 4;
    }

    if (department) {
      countQuery += ` AND department = $${countParamIndex}`;
      countParams.push(department);
    }

    const countResult = await get(countQuery, countParams);

    res.json({
      employees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.total),
        pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Get single employee
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await get('SELECT * FROM employees WHERE id = $1', [id]);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

// Create new employee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      employee_id, first_name, last_name, email, phone,
      department, position, salary, hire_date, address,
      emergency_contact_name, emergency_contact_phone
    } = req.body;

    // Validation
    if (!employee_id || !first_name || !last_name || !email) {
      return res.status(400).json({ 
        message: 'Employee ID, first name, last name, and email are required' 
      });
    }

    // Check if employee_id or email already exists
    const existing = await get(
      'SELECT id FROM employees WHERE employee_id = $1 OR email = $2',
      [employee_id, email]
    );

    if (existing) {
      return res.status(400).json({ 
        message: 'Employee with this ID or email already exists' 
      });
    }

    // Format and validate data before inserting
    const formattedData = {
      employee_id: employee_id?.trim(),
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      position: position?.trim() || null,
      salary: salary && salary !== '' ? parseFloat(salary) : null,
      hire_date: hire_date && hire_date !== '' ? new Date(hire_date).toISOString().split('T')[0] : null,
      address: address?.trim() || null,
      emergency_contact_name: emergency_contact_name?.trim() || null,
      emergency_contact_phone: emergency_contact_phone?.trim() || null,
      created_by: req.user.id
    };

    console.log('Formatted data for insertion:', formattedData);

    // Insert new employee
    const result = await query(
      `INSERT INTO employees (
        employee_id, first_name, last_name, email, phone,
        department, position, salary, hire_date, address,
        emergency_contact_name, emergency_contact_phone, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        formattedData.employee_id,
        formattedData.first_name,
        formattedData.last_name,
        formattedData.email,
        formattedData.phone,
        formattedData.department,
        formattedData.position,
        formattedData.salary,
        formattedData.hire_date,
        formattedData.address,
        formattedData.emergency_contact_name,
        formattedData.emergency_contact_phone,
        formattedData.created_by
      ]
    );

    const newEmployeeId = result.rows[0].id;

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        id: newEmployeeId,
        employee_id: formattedData.employee_id,
        first_name: formattedData.first_name,
        last_name: formattedData.last_name,
        email: formattedData.email
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ 
      message: 'Error creating employee', 
      details: error.message 
    });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, phone, department,
      position, salary, status, address, emergency_contact_name,
      emergency_contact_phone
    } = req.body;

    // Check if employee exists
    const employee = await get('SELECT id FROM employees WHERE id = $1', [id]);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Format data for update
    const formattedData = {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      position: position?.trim() || null,
      salary: salary && salary !== '' ? parseFloat(salary) : null,
      status: status?.trim() || 'active',
      address: address?.trim() || null,
      emergency_contact_name: emergency_contact_name?.trim() || null,
      emergency_contact_phone: emergency_contact_phone?.trim() || null
    };

    await query(
      `UPDATE employees SET
        first_name = $1, last_name = $2, email = $3, phone = $4,
        department = $5, position = $6, salary = $7, status = $8,
        address = $9, emergency_contact_name = $10, emergency_contact_phone = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12`,
      [
        formattedData.first_name,
        formattedData.last_name,
        formattedData.email,
        formattedData.phone,
        formattedData.department,
        formattedData.position,
        formattedData.salary,
        formattedData.status,
        formattedData.address,
        formattedData.emergency_contact_name,
        formattedData.emergency_contact_phone,
        id
      ]
    );

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await query('DELETE FROM employees WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

module.exports = router;