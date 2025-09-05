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

// Get all programs
router.get('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        COUNT(pp.person_id) as beneficiary_count
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id
      GROUP BY p.program_id
      ORDER BY p.program_name
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch programs' 
    });
  }
});

// Get program by ID
router.get('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.*,
        COUNT(pp.person_id) as beneficiary_count
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id
      WHERE p.program_id = $1
      GROUP BY p.program_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Program not found' 
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch program' 
    });
  }
});

// Create new program
router.post('/', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { program_name, description } = req.body;

    // Check if program name already exists
    const existingProgram = await pool.query(
      'SELECT program_id FROM programs WHERE program_name = $1',
      [program_name]
    );

    if (existingProgram.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Program with this name already exists'
      });
    }

    const result = await pool.query(`
      INSERT INTO programs (program_name, description)
      VALUES ($1, $2)
      RETURNING *
    `, [program_name, description]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Added Program', `Created program: ${program_name}`, req.ip]);

    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Program created successfully'
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create program' 
    });
  }
});

// Update program
router.put('/:id', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { program_name, description } = req.body;

    const result = await pool.query(`
      UPDATE programs 
      SET program_name = $1, description = $2
      WHERE program_id = $3
      RETURNING *
    `, [program_name, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Program not found' 
      });
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Updated Program', `Updated program: ${program_name}`, req.ip]);

    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update program' 
    });
  }
});

// Delete program
router.delete('/:id', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get program details before deletion for logging
    const programResult = await pool.query('SELECT * FROM programs WHERE program_id = $1', [id]);
    
    if (programResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Program not found' 
      });
    }

    const program = programResult.rows[0];

    await pool.query('DELETE FROM programs WHERE program_id = $1', [id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Deleted Program', `Deleted program: ${program.program_name}`, req.ip]);

    res.json({ 
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete program' 
    });
  }
});

module.exports = router;
