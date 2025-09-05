const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/database');

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

// ============================
// GET ALL USERS (SuperAdmin only)
// ============================
router.get('/users', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.email_verified,
        u.phone_number,
        u.department,
        u.created_at,
        u.last_login,
        u.updated_at,
        COUNT(s.session_id) as active_sessions
      FROM users u
      LEFT JOIN user_sessions s ON u.user_id = s.user_id AND s.is_active = true
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(u.username ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1} OR u.department ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (role && role !== 'All') {
      conditions.push(`u.role = $${params.length + 1}`);
      params.push(role);
    }

    if (status && status !== 'All') {
      if (status === 'Active') {
        conditions.push(`u.is_active = $${params.length + 1}`);
        params.push(true);
      } else if (status === 'Inactive') {
        conditions.push(`u.is_active = $${params.length + 1}`);
        params.push(false);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY u.user_id, u.username, u.email, u.role, u.is_active, u.email_verified, 
               u.phone_number, u.department, u.created_at, u.last_login, u.updated_at
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM users u';
    const countParams = [];
    const countConditions = [];

    if (search) {
      countConditions.push(`(u.username ILIKE $${countParams.length + 1} OR u.email ILIKE $${countParams.length + 1} OR u.department ILIKE $${countParams.length + 1})`);
      countParams.push(`%${search}%`);
    }

    if (role && role !== 'All') {
      countConditions.push(`u.role = $${countParams.length + 1}`);
      countParams.push(role);
    }

    if (status && status !== 'All') {
      if (status === 'Active') {
        countConditions.push(`u.is_active = $${countParams.length + 1}`);
        countParams.push(true);
      } else if (status === 'Inactive') {
        countConditions.push(`u.is_active = $${countParams.length + 1}`);
        countParams.push(false);
      }
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, countParams);
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
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// ============================
// CREATE USER (SuperAdmin only)
// ============================
router.post('/users', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { username, email, role, phone_number, department, is_active = true } = req.body;

    // Validate input
    if (!username || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and role are required'
      });
    }

    // Validate role
    const validRoles = ['Admin', 'DataEntry', 'Auditor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this username or email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, phone_number, department, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_id, username, email, role, is_active, phone_number, department, created_at
    `, [username, email, passwordHash, role, phone_number || null, department || null, is_active, true]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Created', `Created user: ${username} (${role})`, req.ip, req.user.userId]);

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        temp_password: tempPassword // In production, send via email
      },
      message: 'User created successfully. Temporary password generated.'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// ============================
// UPDATE USER (SuperAdmin only)
// ============================
router.put('/users/:id', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, phone_number, department, is_active } = req.body;

    // Validate role if provided
    if (role) {
      const validRoles = ['Admin', 'DataEntry', 'Auditor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be one of: ' + validRoles.join(', ')
        });
      }
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Check if username/email already exists (excluding current user)
    if (username || email) {
      const existingUser = await pool.query(
        'SELECT user_id FROM users WHERE (username = $1 OR email = $2) AND user_id != $3',
        [username || user.username, email || user.email, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Username or email already exists'
        });
      }
    }

    // Update user
    const result = await pool.query(`
      UPDATE users 
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          phone_number = COALESCE($4, phone_number),
          department = COALESCE($5, department),
          is_active = COALESCE($6, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $7
      RETURNING user_id, username, email, role, is_active, phone_number, department, updated_at
    `, [username, email, role, phone_number, department, is_active, id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Updated', `Updated user: ${result.rows[0].username}`, req.ip, req.user.userId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// ============================
// DELETE USER (SuperAdmin only)
// ============================
router.delete('/users/:id', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Prevent deletion of SuperAdmin users
    if (user.role === 'SuperAdmin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete SuperAdmin users'
      });
    }

    // Prevent self-deletion
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE user_id = $1', [id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Deleted', `Deleted user: ${user.username}`, req.ip, req.user.userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// ============================
// TOGGLE USER STATUS (SuperAdmin only)
// ============================
router.put('/users/:id/toggle-status', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Prevent deactivating SuperAdmin users
    if (user.role === 'SuperAdmin' && !is_active) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate SuperAdmin users'
      });
    }

    // Prevent self-deactivation
    if (parseInt(id) === req.user.userId && !is_active) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    // Update user status
    const result = await pool.query(`
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id, username, is_active
    `, [is_active, id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Status Changed', `User ${is_active ? 'activated' : 'deactivated'}: ${user.username}`, req.ip, req.user.userId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// ============================
// RESET USER PASSWORD (SuperAdmin only)
// ============================
router.post('/users/:id/reset-password', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // Update password
    await pool.query(`
      UPDATE users 
      SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [passwordHash, id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Password Reset', `Password reset for user: ${user.username}`, req.ip, req.user.userId]);

    res.json({
      success: true,
      data: {
        temp_password: tempPassword // In production, send via email
      },
      message: 'Password reset successfully. New temporary password generated.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// ============================
// GET SYSTEM STATISTICS (SuperAdmin only)
// ============================
router.get('/statistics', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const [
      userStats,
      activityStats,
      systemStats
    ] = await Promise.all([
      // User statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
          COUNT(CASE WHEN role = 'SuperAdmin' THEN 1 END) as super_admins,
          COUNT(CASE WHEN role = 'Admin' THEN 1 END) as admins,
          COUNT(CASE WHEN role = 'DataEntry' THEN 1 END) as data_entry,
          COUNT(CASE WHEN role = 'Auditor' THEN 1 END) as auditors
        FROM users
      `),
      
      // Activity statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_activities,
          COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_activities,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_activities,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_activities
        FROM audit_logs
      `),
      
      // System statistics
      pool.query(`
        SELECT 
          COUNT(DISTINCT user_id) as users_with_sessions,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions
        FROM user_sessions
        WHERE expires_at > CURRENT_TIMESTAMP
      `)
    ]);

    const statistics = {
      users: userStats.rows[0],
      activities: activityStats.rows[0],
      sessions: systemStats.rows[0]
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// ============================
// GET AUDIT LOGS (SuperAdmin only)
// ============================
router.get('/audit-logs', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      action = '', 
      user = '', 
      date = '' 
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.log_id,
        al.action,
        al.details,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(al.action ILIKE $${params.length + 1} OR al.details ILIKE $${params.length + 1} OR u.username ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (action && action !== 'All') {
      conditions.push(`al.action = $${params.length + 1}`);
      params.push(action);
    }

    if (user && user !== 'All') {
      conditions.push(`u.username = $${params.length + 1}`);
      params.push(user);
    }

    if (date && date !== 'All') {
      let dateCondition = '';
      switch (date) {
        case 'today':
          dateCondition = `al.created_at >= CURRENT_DATE`;
          break;
        case 'week':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
      }
      if (dateCondition) {
        conditions.push(dateCondition);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
    `;
    const countParams = [];
    const countConditions = [];

    if (search) {
      countConditions.push(`(al.action ILIKE $${countParams.length + 1} OR al.details ILIKE $${countParams.length + 1} OR u.username ILIKE $${countParams.length + 1})`);
      countParams.push(`%${search}%`);
    }

    if (action && action !== 'All') {
      countConditions.push(`al.action = $${countParams.length + 1}`);
      countParams.push(action);
    }

    if (user && user !== 'All') {
      countConditions.push(`u.username = $${countParams.length + 1}`);
      countParams.push(user);
    }

    if (date && date !== 'All') {
      let dateCondition = '';
      switch (date) {
        case 'today':
          dateCondition = `al.created_at >= CURRENT_DATE`;
          break;
        case 'week':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
      }
      if (dateCondition) {
        countConditions.push(dateCondition);
      }
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, countParams);
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
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch audit logs' 
    });
  }
});

// ============================
// EXPORT AUDIT LOGS (SuperAdmin only)
// ============================
router.get('/audit-logs/export', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { format = 'csv', search = '', action = '', user = '', date = '' } = req.query;

    let query = `
      SELECT 
        al.log_id,
        al.action,
        al.details,
        al.table_name,
        al.record_id,
        al.ip_address,
        al.created_at,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
    `;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(al.action ILIKE $${params.length + 1} OR al.details ILIKE $${params.length + 1} OR u.username ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (action && action !== 'All') {
      conditions.push(`al.action = $${params.length + 1}`);
      params.push(action);
    }

    if (user && user !== 'All') {
      conditions.push(`u.username = $${params.length + 1}`);
      params.push(user);
    }

    if (date && date !== 'All') {
      let dateCondition = '';
      switch (date) {
        case 'today':
          dateCondition = `al.created_at >= CURRENT_DATE`;
          break;
        case 'week':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateCondition = `al.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
      }
      if (dateCondition) {
        conditions.push(dateCondition);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT 10000`; // Limit for export

    const result = await pool.query(query, params);

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Action', 'User', 'Details', 'Table', 'Record ID', 'IP Address', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => [
          row.log_id,
          `"${row.action}"`,
          `"${row.username || 'System'}"`,
          `"${(row.details || '').replace(/"/g, '""')}"`,
          `"${row.table_name || ''}"`,
          row.record_id || '',
          `"${row.ip_address || ''}"`,
          `"${new Date(row.created_at).toISOString()}"`
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      res.send(csvContent);
    } else {
      // Generate JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
      res.json({
        success: true,
        data: result.rows,
        exported_at: new Date().toISOString(),
        total_records: result.rows.length
      });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export audit logs' 
    });
  }
});

// ============================
// GET SYSTEM STATUS (SuperAdmin only)
// ============================
router.get('/system-status', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    // Get database status
    const dbStatus = await pool.query('SELECT 1 as status');
    const dbHealthy = dbStatus.rows.length > 0;

    // Get database metrics
    const dbMetrics = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
        pg_database_size(current_database()) as database_size
    `);

    // Get user statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login >= CURRENT_DATE THEN 1 END) as online_today,
        COUNT(CASE WHEN last_login >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 1 END) as active_sessions
      FROM users
    `);

    // Get recent audit logs for system events
    const recentEvents = await pool.query(`
      SELECT 
        action,
        details,
        created_at,
        CASE 
          WHEN action ILIKE '%error%' OR action ILIKE '%failed%' THEN 'error'
          WHEN action ILIKE '%warning%' OR action ILIKE '%timeout%' THEN 'warning'
          ELSE 'healthy'
        END as status
      FROM audit_logs
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get API metrics (simplified)
    const apiMetrics = await pool.query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute' THEN 1 END) as requests_per_minute
      FROM audit_logs
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day'
    `);

    // Calculate system health
    const overallStatus = dbHealthy ? 'healthy' : 'error';

    const systemStatus = {
      overall_status: overallStatus,
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        cpu_usage: Math.floor(Math.random() * 30) + 20, // Mock data
        memory_usage: Math.floor(Math.random() * 40) + 30, // Mock data
        disk_usage: Math.floor(Math.random() * 20) + 10 // Mock data
      },
      database: {
        status: dbHealthy ? 'healthy' : 'error',
        active_connections: parseInt(dbMetrics.rows[0].active_connections),
        total_tables: parseInt(dbMetrics.rows[0].total_tables),
        size: parseInt(dbMetrics.rows[0].database_size),
        query_time: Math.floor(Math.random() * 50) + 10 // Mock data
      },
      api: {
        status: 'healthy',
        response_time: Math.floor(Math.random() * 100) + 50, // Mock data
        requests_per_minute: parseInt(apiMetrics.rows[0].requests_per_minute),
        error_rate: Math.floor(Math.random() * 5), // Mock data
        avg_response_time: Math.floor(Math.random() * 200) + 100 // Mock data
      },
      users: {
        total_users: parseInt(userStats.rows[0].total_users),
        active_users: parseInt(userStats.rows[0].active_users),
        online_today: parseInt(userStats.rows[0].online_today),
        active_sessions: parseInt(userStats.rows[0].active_sessions)
      },
      security: {
        ssl_status: 'healthy',
        failed_logins: Math.floor(Math.random() * 10), // Mock data
        blocked_ips: Math.floor(Math.random() * 5) // Mock data
      },
      events: recentEvents.rows.map(event => ({
        message: event.details,
        status: event.status,
        timestamp: new Date(event.created_at).toLocaleString()
      }))
    };

    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system status'
    });
  }
});

module.exports = router;
