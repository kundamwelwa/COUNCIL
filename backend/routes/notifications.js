const express = require('express');
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
// GET USER NOTIFICATIONS
// ============================
router.get('/', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { page = 1, limit = 50, type = '', is_read = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        notification_id,
        title,
        message,
        type,
        is_read,
        action_url,
        created_at
      FROM notifications
      WHERE user_id = $1
    `;

    const params = [req.user.userId];
    let paramCount = 1;

    if (type && type !== 'All') {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (is_read !== '') {
      paramCount++;
      query += ` AND is_read = $${paramCount}`;
      params.push(is_read === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
    const countParams = [req.user.userId];
    let countParamCount = 1;

    if (type && type !== 'All') {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }

    if (is_read !== '') {
      countParamCount++;
      countQuery += ` AND is_read = $${countParamCount}`;
      countParams.push(is_read === 'true');
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
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
});

// ============================
// MARK NOTIFICATION AS READ
// ============================
router.put('/:id/read', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE notification_id = $1 AND user_id = $2
      RETURNING notification_id, title, is_read
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// ============================
// MARK ALL NOTIFICATIONS AS READ
// ============================
router.put('/read-all', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `, [req.user.userId]);

    res.json({
      success: true,
      data: {
        updated_count: parseInt(result.rows[0].updated_count)
      },
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

// ============================
// DELETE NOTIFICATION
// ============================
router.delete('/:id', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM notifications 
      WHERE notification_id = $1 AND user_id = $2
      RETURNING notification_id, title
    `, [id, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// ============================
// CREATE NOTIFICATION (Admin/SuperAdmin only)
// ============================
router.post('/', requireRole(['SuperAdmin', 'Admin']), async (req, res) => {
  try {
    const { user_id, title, message, type = 'info', action_url } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'User ID, title, and message are required'
      });
    }

    // Validate type
    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, action_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING notification_id, title, message, type, created_at
    `, [user_id, title, message, type, action_url || null]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Notification Created', `Created notification: ${title}`, req.ip, req.user.userId]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// ============================
// GET NOTIFICATION STATISTICS
// ============================
router.get('/stats', requireRole(['SuperAdmin', 'Admin', 'DataEntry', 'Auditor']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count,
        COUNT(CASE WHEN type = 'info' THEN 1 END) as info_count,
        COUNT(CASE WHEN type = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning_count,
        COUNT(CASE WHEN type = 'error' THEN 1 END) as error_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_count
      FROM notifications
      WHERE user_id = $1
    `, [req.user.userId]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics'
    });
  }
});

// ============================
// BULK NOTIFICATIONS (SuperAdmin only)
// ============================
router.post('/bulk', requireRole(['SuperAdmin']), async (req, res) => {
  try {
    const { user_ids, title, message, type = 'info', action_url } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'User IDs array, title, and message are required'
      });
    }

    // Validate type
    const validTypes = ['info', 'success', 'warning', 'error'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    // Create notifications for all users
    const values = user_ids.map((user_id, index) => 
      `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
    ).join(', ');

    const params = [];
    user_ids.forEach(user_id => {
      params.push(user_id, title, message, type, action_url || null);
    });

    const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, action_url)
      VALUES ${values}
      RETURNING notification_id, user_id
    `, params);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Bulk Notification Created', `Created ${result.rows.length} notifications: ${title}`, req.ip, req.user.userId]);

    res.status(201).json({
      success: true,
      data: {
        created_count: result.rows.length,
        user_ids: user_ids
      },
      message: `Notifications created for ${result.rows.length} users`
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bulk notifications'
    });
  }
});

module.exports = router;
