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

// Get all groups
router.get('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.*,
        p.program_name,
        COUNT(pg.person_id) as member_count
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.program_id
      LEFT JOIN person_groups pg ON g.group_id = pg.group_id
      GROUP BY g.group_id, p.program_name
      ORDER BY g.group_name
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch groups' 
    });
  }
});

// Get group by ID
router.get('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        g.*,
        p.program_name,
        COUNT(pg.person_id) as member_count
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.program_id
      LEFT JOIN person_groups pg ON g.group_id = pg.group_id
      WHERE g.group_id = $1
      GROUP BY g.group_id, p.program_name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Group not found' 
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch group' 
    });
  }
});

// Create new group
router.post('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry']), async (req, res) => {
  try {
    const { group_name, program_id, description } = req.body;

    // Check if group name already exists
    const existingGroup = await pool.query(
      'SELECT group_id FROM groups WHERE group_name = $1',
      [group_name]
    );

    if (existingGroup.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Group with this name already exists'
      });
    }

    const result = await pool.query(`
      INSERT INTO groups (group_name, program_id, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [group_name, program_id, description]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Added Group', `Created group: ${group_name}`, req.ip]);

    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create group' 
    });
  }
});

// Update group
router.put('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry']), async (req, res) => {
  try {
    const { id } = req.params;
    const { group_name, program_id, description } = req.body;

    const result = await pool.query(`
      UPDATE groups 
      SET group_name = $1, program_id = $2, description = $3
      WHERE group_id = $4
      RETURNING *
    `, [group_name, program_id, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Group not found' 
      });
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Updated Group', `Updated group: ${group_name}`, req.ip]);

    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Group updated successfully'
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update group' 
    });
  }
});

// Delete group
router.delete('/:id', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get group details before deletion for logging
    const groupResult = await pool.query('SELECT * FROM groups WHERE group_id = $1', [id]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Group not found' 
      });
    }

    const group = groupResult.rows[0];

    await pool.query('DELETE FROM groups WHERE group_id = $1', [id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Deleted Group', `Deleted group: ${group.group_name}`, req.ip]);

    res.json({ 
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete group' 
    });
  }
});

module.exports = router;
