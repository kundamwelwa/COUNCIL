const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total persons
    const personsResult = await pool.query('SELECT COUNT(*) as count FROM persons');
    const totalPersons = parseInt(personsResult.rows[0].count);

    // Get total programs
    const programsResult = await pool.query('SELECT COUNT(*) as count FROM programs');
    const totalPrograms = parseInt(programsResult.rows[0].count);

    // Get total groups
    const groupsResult = await pool.query('SELECT COUNT(*) as count FROM groups');
    const totalGroups = parseInt(groupsResult.rows[0].count);

    // Get loan statistics
    const loansResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN repayment_status = 'Pending' THEN 1 END) as active,
        COUNT(CASE WHEN repayment_status = 'Repaid' THEN 1 END) as repaid,
        COUNT(CASE WHEN repayment_status = 'Defaulted' THEN 1 END) as defaulted,
        COALESCE(SUM(amount), 0) as total_amount
      FROM grants_loans
    `);
    const loanStats = loansResult.rows[0];

    const stats = {
      totalPersons,
      totalPrograms,
      totalGroups,
      totalLoans: parseInt(loanStats.total),
      activeLoans: parseInt(loanStats.active),
      repaidLoans: parseInt(loanStats.repaid),
      defaultedLoans: parseInt(loanStats.defaulted),
      totalAmount: parseFloat(loanStats.total_amount)
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
});

// Get beneficiaries by program
router.get('/beneficiaries-by-program', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.program_name,
        COUNT(pp.person_id) as count
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id
      GROUP BY p.program_id, p.program_name
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      name: row.program_name,
      count: parseInt(row.count)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching beneficiaries by program:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch beneficiaries by program' 
    });
  }
});

// Get loan status distribution
router.get('/loan-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        repayment_status,
        COUNT(*) as count
      FROM grants_loans
      GROUP BY repayment_status
    `);

    const data = result.rows.map(row => ({
      name: row.repayment_status,
      value: parseInt(row.count)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching loan status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch loan status data' 
    });
  }
});

// Get monthly trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(DISTINCT p.person_id) as beneficiaries,
        COUNT(DISTINCT gl.grant_loan_id) as loans
      FROM persons p
      FULL OUTER JOIN grants_loans gl ON DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', gl.issued_date)
      WHERE p.created_at >= NOW() - INTERVAL '6 months' 
         OR gl.issued_date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', COALESCE(p.created_at, gl.issued_date))
      ORDER BY month
    `);

    const data = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
      beneficiaries: parseInt(row.beneficiaries) || 0,
      loans: parseInt(row.loans) || 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch monthly trends' 
    });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        action,
        details,
        created_at,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    const data = result.rows.map(row => ({
      action: row.action,
      details: row.details,
      user: row.username,
      time: new Date(row.created_at).toLocaleString()
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent activities' 
    });
  }
});

module.exports = router;
