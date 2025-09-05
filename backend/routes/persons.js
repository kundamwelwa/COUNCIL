const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.',
          required_roles: allowedRoles,
          user_role: decoded.role
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  };
};

// Get all persons with pagination
router.get('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        STRING_AGG(DISTINCT pr.program_name, ', ') as programs,
        STRING_AGG(DISTINCT g.group_name, ', ') as groups
      FROM persons p
      LEFT JOIN person_programs pp ON p.person_id = pp.person_id
      LEFT JOIN programs pr ON pp.program_id = pr.program_id
      LEFT JOIN person_groups pg ON p.person_id = pg.person_id
      LEFT JOIN groups g ON pg.group_id = g.group_id
    `;

    const params = [];
    if (search) {
      query += ` WHERE p.first_name ILIKE $1 OR p.last_name ILIKE $1 OR p.national_id ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += `
      GROUP BY p.person_id
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM persons');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch persons' 
    });
  }
});

// Get person by ID
router.get('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.*,
        STRING_AGG(DISTINCT pr.program_name, ', ') as programs,
        STRING_AGG(DISTINCT g.group_name, ', ') as groups
      FROM persons p
      LEFT JOIN person_programs pp ON p.person_id = pp.person_id
      LEFT JOIN programs pr ON pp.program_id = pr.program_id
      LEFT JOIN person_groups pg ON p.person_id = pg.person_id
      LEFT JOIN groups g ON pg.group_id = g.group_id
      WHERE p.person_id = $1
      GROUP BY p.person_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Person not found' 
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch person' 
    });
  }
});

// Create new person
router.post('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry']), async (req, res) => {
  try {
    const { first_name, last_name, national_id, gender, dob, phone_number, address } = req.body;

    // Check if national ID already exists
    const existingPerson = await pool.query(
      'SELECT person_id FROM persons WHERE national_id = $1',
      [national_id]
    );

    if (existingPerson.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Person with this National ID already exists'
      });
    }

    const result = await pool.query(`
      INSERT INTO persons (first_name, last_name, national_id, gender, dob, phone_number, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [first_name, last_name, national_id, gender, dob, phone_number, address]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Added Person', `Created person: ${first_name} ${last_name} (${national_id})`, req.ip]);

    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Person created successfully'
    });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create person' 
    });
  }
});

// Update person
router.put('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry']), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, national_id, gender, dob, phone_number, address } = req.body;

    const result = await pool.query(`
      UPDATE persons 
      SET first_name = $1, last_name = $2, national_id = $3, gender = $4, dob = $5, phone_number = $6, address = $7
      WHERE person_id = $8
      RETURNING *
    `, [first_name, last_name, national_id, gender, dob, phone_number, address, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Person not found' 
      });
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Updated Person', `Updated person: ${first_name} ${last_name} (${national_id})`, req.ip]);

    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Person updated successfully'
    });
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update person' 
    });
  }
});

// Delete person
router.delete('/:id', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get person details before deletion for logging
    const personResult = await pool.query('SELECT * FROM persons WHERE person_id = $1', [id]);
    
    if (personResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Person not found' 
      });
    }

    const person = personResult.rows[0];

    await pool.query('DELETE FROM persons WHERE person_id = $1', [id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Deleted Person', `Deleted person: ${person.first_name} ${person.last_name} (${person.national_id})`, req.ip]);

    res.json({ 
      success: true,
      message: 'Person deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete person' 
    });
  }
});

module.exports = router;
