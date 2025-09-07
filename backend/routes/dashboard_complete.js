const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/database');

// ============================
// ROLE-BASED MIDDLEWARE
// ============================
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
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
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };
};

// ============================
// DASHBOARD STATISTICS (All authenticated users)
// ============================
router.get('/stats', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    // Get total persons
    const personsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM persons 
      WHERE is_active = true
    `);
    const totalPersons = parseInt(personsResult.rows[0].count);

    // Get total programs
    const programsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM programs 
      WHERE status = 'Active'
    `);
    const totalPrograms = parseInt(programsResult.rows[0].count);

    // Get total groups
    const groupsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM groups 
      WHERE status = 'Active'
    `);
    const totalGroups = parseInt(groupsResult.rows[0].count);

    // Get loan statistics
    const loansResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN repayment_status = 'Pending' THEN 1 END) as active,
        COUNT(CASE WHEN repayment_status = 'Repaid' THEN 1 END) as repaid,
        COUNT(CASE WHEN repayment_status = 'Defaulted' THEN 1 END) as defaulted,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount_repaid), 0) as total_repaid
      FROM grants_loans
    `);
    const loanStats = loansResult.rows[0];

    // Get monthly registrations (last 6 months)
    const monthlyRegistrations = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM persons 
      WHERE created_at >= NOW() - INTERVAL '6 months' AND is_active = true
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    // Get gender distribution
    const genderStats = await pool.query(`
      SELECT 
        gender,
        COUNT(*) as count
      FROM persons 
      WHERE is_active = true AND gender IS NOT NULL
      GROUP BY gender
    `);

    // Get program distribution
    const programStats = await pool.query(`
      SELECT 
        p.program_name,
        COUNT(pp.person_id) as beneficiary_count
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id AND pp.status = 'Active'
      WHERE p.status = 'Active'
      GROUP BY p.program_id, p.program_name
      ORDER BY beneficiary_count DESC
    `);

    const stats = {
      totalPersons,
      totalPrograms,
      totalGroups,
      totalLoans: parseInt(loanStats.total),
      activeLoans: parseInt(loanStats.active),
      repaidLoans: parseInt(loanStats.repaid),
      defaultedLoans: parseInt(loanStats.defaulted),
      totalAmount: parseFloat(loanStats.total_amount),
      totalRepaid: parseFloat(loanStats.total_repaid),
      outstandingAmount: parseFloat(loanStats.total_amount) - parseFloat(loanStats.total_repaid),
      monthlyRegistrations: monthlyRegistrations.rows.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        count: parseInt(row.count)
      })),
      genderDistribution: genderStats.rows.map(row => ({
        gender: row.gender,
        count: parseInt(row.count)
      })),
      programDistribution: programStats.rows.map(row => ({
        program: row.program_name,
        count: parseInt(row.beneficiary_count)
      }))
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

// ============================
// BENEFICIARIES BY PROGRAM (All authenticated users)
// ============================
router.get('/beneficiaries-by-program', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.program_name,
        COUNT(pp.person_id) as count,
        p.program_type,
        p.budget_allocation
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id AND pp.status = 'Active'
      WHERE p.status = 'Active'
      GROUP BY p.program_id, p.program_name, p.program_type, p.budget_allocation
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      name: row.program_name,
      count: parseInt(row.count),
      type: row.program_type,
      budget: parseFloat(row.budget_allocation || 0)
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

// ============================
// LOAN STATUS DISTRIBUTION (Admin and SuperAdmin only)
// ============================
router.get('/loan-status', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        repayment_status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM grants_loans
      GROUP BY repayment_status
      ORDER BY count DESC
    `);

    const data = result.rows.map(row => ({
      name: row.repayment_status,
      value: parseInt(row.count),
      amount: parseFloat(row.total_amount || 0)
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

// ============================
// MONTHLY TRENDS (All authenticated users)
// ============================
router.get('/monthly-trends', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', COALESCE(p.created_at, gl.issued_date)) as month,
        COUNT(DISTINCT p.person_id) as beneficiaries,
        COUNT(DISTINCT gl.grant_loan_id) as loans,
        SUM(gl.amount) as loan_amount
      FROM persons p
      FULL OUTER JOIN grants_loans gl ON DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', gl.issued_date)
      WHERE p.created_at >= NOW() - INTERVAL '12 months' 
         OR gl.issued_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', COALESCE(p.created_at, gl.issued_date))
      ORDER BY month
    `);

    const data = result.rows.map(row => ({
      month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
      beneficiaries: parseInt(row.beneficiaries) || 0,
      loans: parseInt(row.loans) || 0,
      loanAmount: parseFloat(row.loan_amount) || 0
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

// ============================
// RECENT ACTIVITIES (All authenticated users)
// ============================
router.get('/recent-activities', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await pool.query(`
      SELECT 
        al.action,
        al.details,
        al.created_at,
        u.username,
        al.table_name,
        al.record_id
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [limit]);

    const data = result.rows.map(row => ({
      action: row.action,
      details: row.details,
      user: row.username || 'System',
      time: new Date(row.created_at).toLocaleString(),
      table: row.table_name,
      recordId: row.record_id
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

// ============================
// GEOGRAPHIC DISTRIBUTION (All authenticated users)
// ============================
router.get('/geographic-distribution', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        province,
        district,
        COUNT(*) as beneficiary_count
      FROM persons 
      WHERE is_active = true AND province IS NOT NULL
      GROUP BY province, district
      ORDER BY province, beneficiary_count DESC
    `);

    const data = result.rows.map(row => ({
      province: row.province,
      district: row.district,
      count: parseInt(row.beneficiary_count)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching geographic distribution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch geographic distribution' 
    });
  }
});

// ============================
// FINANCIAL SUMMARY (Admin and SuperAdmin only)
// ============================
router.get('/financial-summary', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(amount_repaid) as total_repaid,
        AVG(amount) as average_amount
      FROM grants_loans
      GROUP BY type
    `);

    const data = result.rows.map(row => ({
      type: row.type,
      count: parseInt(row.count),
      totalAmount: parseFloat(row.total_amount || 0),
      totalRepaid: parseFloat(row.total_repaid || 0),
      averageAmount: parseFloat(row.average_amount || 0),
      outstandingAmount: parseFloat(row.total_amount || 0) - parseFloat(row.total_repaid || 0)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch financial summary' 
    });
  }
});

// ============================
// PROGRAM PERFORMANCE (Admin and SuperAdmin only)
// ============================
router.get('/program-performance', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.program_name,
        p.program_type,
        p.budget_allocation,
        COUNT(pp.person_id) as beneficiary_count,
        COUNT(gl.grant_loan_id) as loan_count,
        SUM(gl.amount) as total_disbursed,
        p.start_date,
        p.end_date,
        p.status
      FROM programs p
      LEFT JOIN person_programs pp ON p.program_id = pp.program_id AND pp.status = 'Active'
      LEFT JOIN groups g ON p.program_id = g.program_id
      LEFT JOIN grants_loans gl ON g.group_id = gl.group_id
      WHERE p.status = 'Active'
      GROUP BY p.program_id, p.program_name, p.program_type, p.budget_allocation, 
               p.start_date, p.end_date, p.status
      ORDER BY beneficiary_count DESC
    `);

    const data = result.rows.map(row => ({
      programName: row.program_name,
      programType: row.program_type,
      budgetAllocation: parseFloat(row.budget_allocation || 0),
      beneficiaryCount: parseInt(row.beneficiary_count),
      loanCount: parseInt(row.loan_count),
      totalDisbursed: parseFloat(row.total_disbursed || 0),
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      budgetUtilization: row.budget_allocation > 0 ? 
        (parseFloat(row.total_disbursed || 0) / parseFloat(row.budget_allocation)) * 100 : 0
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching program performance:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch program performance' 
    });
  }
});

// ============================
// GROUP STATISTICS (All authenticated users)
// ============================
router.get('/group-statistics', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.group_type,
        COUNT(*) as group_count,
        SUM(g.membership_fee) as total_membership_fees,
        AVG(g.membership_fee) as average_membership_fee
      FROM groups g
      LEFT JOIN person_groups pg ON g.group_id = pg.group_id AND pg.status = 'Active'
      WHERE g.status = 'Active'
      GROUP BY g.group_type, g.membership_fee
      ORDER BY group_count DESC
    `);

    const data = result.rows.map(row => ({
      groupType: row.group_type,
      groupCount: parseInt(row.group_count),
      totalMembershipFees: parseFloat(row.total_membership_fees || 0),
      averageMembershipFee: parseFloat(row.average_membership_fee || 0)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching group statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch group statistics' 
    });
  }
});

// ============================
// DASHBOARD WIDGETS (All authenticated users)
// ============================
router.get('/widgets', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    // Get all dashboard data in one request
    const [
      statsResult,
      beneficiariesByProgramResult,
      loanStatusResult,
      monthlyTrendsResult,
      recentActivitiesResult
    ] = await Promise.all([
      pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM persons WHERE is_active = true) as total_persons,
          (SELECT COUNT(*) FROM programs WHERE status = 'Active') as total_programs,
          (SELECT COUNT(*) FROM groups WHERE status = 'Active') as total_groups,
          (SELECT COUNT(*) FROM grants_loans) as total_loans,
          (SELECT COUNT(*) FROM grants_loans WHERE repayment_status = 'Pending') as active_loans,
          (SELECT COUNT(*) FROM grants_loans WHERE repayment_status = 'Repaid') as repaid_loans,
          (SELECT COUNT(*) FROM grants_loans WHERE repayment_status = 'Defaulted') as defaulted_loans,
          (SELECT COALESCE(SUM(amount), 0) FROM grants_loans) as total_amount,
          (SELECT COALESCE(SUM(amount_repaid), 0) FROM grants_loans) as total_repaid
      `),
      pool.query(`
        SELECT 
          p.program_name,
          COUNT(pp.person_id) as count
        FROM programs p
        LEFT JOIN person_programs pp ON p.program_id = pp.program_id AND pp.status = 'Active'
        WHERE p.status = 'Active'
        GROUP BY p.program_id, p.program_name
        ORDER BY count DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT 
          repayment_status,
          COUNT(*) as count
        FROM grants_loans
        GROUP BY repayment_status
      `),
      pool.query(`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as beneficiaries
        FROM persons 
        WHERE created_at >= NOW() - INTERVAL '6 months' AND is_active = true
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `),
      pool.query(`
        SELECT 
          al.action,
          al.details,
          al.created_at,
          u.username
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.created_at DESC
        LIMIT 5
      `)
    ]);

    const widgets = {
      stats: {
        totalPersons: parseInt(statsResult.rows[0].total_persons),
        totalPrograms: parseInt(statsResult.rows[0].total_programs),
        totalGroups: parseInt(statsResult.rows[0].total_groups),
        totalLoans: parseInt(statsResult.rows[0].total_loans),
        activeLoans: parseInt(statsResult.rows[0].active_loans),
        repaidLoans: parseInt(statsResult.rows[0].repaid_loans),
        defaultedLoans: parseInt(statsResult.rows[0].defaulted_loans),
        totalAmount: parseFloat(statsResult.rows[0].total_amount),
        totalRepaid: parseFloat(statsResult.rows[0].total_repaid),
        outstandingAmount: parseFloat(statsResult.rows[0].total_amount) - parseFloat(statsResult.rows[0].total_repaid)
      },
      beneficiariesByProgram: beneficiariesByProgramResult.rows.map(row => ({
        name: row.program_name,
        count: parseInt(row.count)
      })),
      loanStatus: loanStatusResult.rows.map(row => ({
        name: row.repayment_status,
        value: parseInt(row.count)
      })),
      monthlyTrends: monthlyTrendsResult.rows.map(row => ({
        month: new Date(row.month).toLocaleDateString('en-US', { month: 'short' }),
        beneficiaries: parseInt(row.beneficiaries)
      })),
      recentActivities: recentActivitiesResult.rows.map(row => ({
        action: row.action,
        details: row.details,
        user: row.username || 'System',
        time: new Date(row.created_at).toLocaleString()
      }))
    };

    res.json({ success: true, data: widgets });
  } catch (error) {
    console.error('Error fetching dashboard widgets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard widgets' 
    });
  }
});

module.exports = router;
