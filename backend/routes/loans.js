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

// Get all loans/grants
router.get('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        gl.*,
        g.group_name,
        p.program_name
      FROM grants_loans gl
      LEFT JOIN groups g ON gl.group_id = g.group_id
      LEFT JOIN programs p ON g.program_id = p.program_id
      ORDER BY gl.issued_date DESC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch loans' 
    });
  }
});

// Get loan by ID
router.get('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        gl.*,
        g.group_name,
        p.program_name
      FROM grants_loans gl
      LEFT JOIN groups g ON gl.group_id = g.group_id
      LEFT JOIN programs p ON g.program_id = p.program_id
      WHERE gl.grant_loan_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Loan not found' 
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch loan' 
    });
  }
});

// Create new loan/grant
router.post('/', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { group_id, amount, type, issued_date, repayment_status, remarks } = req.body;

    const result = await pool.query(`
      INSERT INTO grants_loans (group_id, amount, type, issued_date, repayment_status, remarks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [group_id, amount, type, issued_date, repayment_status || 'Pending', remarks]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Added Loan/Grant', `Created ${type}: ZMW ${amount} for group ${group_id}`, req.ip]);

    res.status(201).json({ 
      success: true, 
      data: result.rows[0],
      message: `${type} created successfully`
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create loan/grant' 
    });
  }
});

// Update loan/grant
router.put('/:id', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, amount, type, issued_date, repayment_status, remarks } = req.body;

    const result = await pool.query(`
      UPDATE grants_loans 
      SET group_id = $1, amount = $2, type = $3, issued_date = $4, repayment_status = $5, remarks = $6
      WHERE grant_loan_id = $7
      RETURNING *
    `, [group_id, amount, type, issued_date, repayment_status, remarks, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Loan not found' 
      });
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Updated Loan/Grant', `Updated ${type}: ZMW ${amount}`, req.ip]);

    res.json({ 
      success: true, 
      data: result.rows[0],
      message: `${type} updated successfully`
    });
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update loan/grant' 
    });
  }
});

// Delete loan/grant
router.delete('/:id', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get loan details before deletion for logging
    const loanResult = await pool.query('SELECT * FROM grants_loans WHERE grant_loan_id = $1', [id]);
    
    if (loanResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Loan not found' 
      });
    }

    const loan = loanResult.rows[0];

    await pool.query('DELETE FROM grants_loans WHERE grant_loan_id = $1', [id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address)
      VALUES ($1, $2, $3)
    `, ['Deleted Loan/Grant', `Deleted ${loan.type}: ZMW ${loan.amount}`, req.ip]);

    res.json({ 
      success: true,
      message: `${loan.type} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete loan/grant' 
    });
  }
});

module.exports = router;
