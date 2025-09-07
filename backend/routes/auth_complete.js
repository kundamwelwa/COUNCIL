const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../config/database');
const emailService = require('../services/emailService');

// ============================
// REGISTRATION
// ============================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, phone_number, department } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, password, and role are required'
      });
    }

    // Validate role
    const validRoles = ['SuperAdmin', 'Admin', 'DataEntry', 'Auditor'];
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

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, phone_number, department, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, username, email, role, created_at
    `, [username, email, passwordHash, role, phone_number || null, department || null, false]);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [result.rows[0].user_id, verificationToken, expiresAt]);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, username, verificationToken);
      console.log(`📧 Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Registered', `New user registered: ${username} (${role})`, req.ip, result.rows[0].user_id]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'User registered successfully. Please check your email for verification instructions.',
      verification_token: verificationToken // For development only
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

// ============================
// LOGIN
// ============================
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember_me = false } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in',
        requires_verification: true
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT token
    const tokenExpiry = remember_me ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        username: user.username, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Store session
    const sessionExpiry = remember_me ? 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
      new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    await pool.query(`
      INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      user.user_id, 
      tokenHash, 
      req.get('User-Agent') || 'Unknown',
      req.ip,
      sessionExpiry
    ]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['User Login', `User logged in: ${username}`, req.ip, user.user_id]);

    res.json({
      success: true,
      data: {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          last_login: user.last_login,
          profile_picture: user.profile_picture,
          department: user.department
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
});

// ============================
// LOGOUT
// ============================
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Deactivate session
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
        [tokenHash]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
});

// ============================
// CHANGE PASSWORD
// ============================
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, decoded.userId]
    );

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Password Changed', `User changed password: ${decoded.username}`, req.ip, decoded.userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// ============================
// FORGOT PASSWORD
// ============================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT user_id, username FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await pool.query(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.user_id, resetToken, expiresAt]);

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(email, user.username, resetToken);
      console.log(`📧 Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError.message);
      // Don't fail the request if email fails
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Password Reset Requested', `Password reset requested for: ${user.username}`, req.ip, user.user_id]);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      reset_token: resetToken // For development only
    });
  } catch (error) {
    console.error('Error processing forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// ============================
// RESET PASSWORD
// ============================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Find valid token
    const tokenResult = await pool.query(`
      SELECT prt.user_id, u.username 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.user_id
      WHERE prt.token = $1 AND prt.expires_at > CURRENT_TIMESTAMP AND prt.used = false
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    const { user_id, username } = tokenResult.rows[0];

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, password_changed_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, user_id]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Password Reset', `Password reset completed for: ${username}`, req.ip, user_id]);

    res.json({
      success: true,
      message: 'Password reset successfully'
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
// EMAIL VERIFICATION
// ============================
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Find valid token
    const tokenResult = await pool.query(`
      SELECT evt.user_id, u.username 
      FROM email_verification_tokens evt
      JOIN users u ON evt.user_id = u.user_id
      WHERE evt.token = $1 AND evt.expires_at > CURRENT_TIMESTAMP AND evt.used = false
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    const { user_id, username } = tokenResult.rows[0];

    // Mark email as verified
    await pool.query(
      'UPDATE users SET email_verified = true WHERE user_id = $1',
      [user_id]
    );

    // Mark token as used
    await pool.query(
      'UPDATE email_verification_tokens SET used = true WHERE token = $1',
      [token]
    );

    // Get user role for welcome email
    const userResult = await pool.query(
      'SELECT role, email FROM users WHERE user_id = $1',
      [user_id]
    );
    const userRole = userResult.rows[0].role;
    const userEmail = userResult.rows[0].email;

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(userEmail, username, userRole);
      console.log(`📧 Welcome email sent to ${userEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError.message);
      // Don't fail verification if email fails
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Email Verified', `Email verified for: ${username}`, req.ip, user_id]);

    res.json({
      success: true,
      message: 'Email verified successfully. Welcome to the Council Management System!'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

// ============================
// RESEND VERIFICATION EMAIL
// ============================
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists and is not verified
    const userResult = await pool.query(
      'SELECT user_id, username FROM users WHERE email = $1 AND is_active = true AND email_verified = false',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User not found or already verified'
      });
    }

    const user = userResult.rows[0];

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store new token
    await pool.query(`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.user_id, verificationToken, expiresAt]);

    res.json({
      success: true,
      message: 'Verification email sent',
      verification_token: verificationToken // In production, send via email
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
});

// ============================
// GET USER PROFILE
// ============================
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(`
      SELECT user_id, username, email, role, created_at, last_login, 
             profile_picture, phone_number, department, email_verified
      FROM users WHERE user_id = $1
    `, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// ============================
// UPDATE USER PROFILE
// ============================
router.put('/profile', async (req, res) => {
  try {
    const { phone_number, department, profile_picture } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(`
      UPDATE users 
      SET phone_number = $1, department = $2, profile_picture = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING user_id, username, email, role, phone_number, department, profile_picture
    `, [phone_number, department, profile_picture, decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Profile Updated', `Profile updated for: ${decoded.username}`, req.ip, decoded.userId]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// ============================
// GET USER PERMISSIONS
// ============================
router.get('/permissions', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user permissions based on role
    const permissions = await pool.query(`
      SELECT permission FROM get_user_permissions($1)
    `, [decoded.role]);

    res.json({
      success: true,
      data: {
        role: decoded.role,
        permissions: permissions.rows.map(row => row.permission)
      }
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// ============================
// PERMISSION REQUEST SYSTEM
// ============================
router.post('/request-permission', async (req, res) => {
  try {
    const { requested_permission, reason, target_user_id } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Create permission request
    await pool.query(`
      INSERT INTO permission_requests (requester_id, target_user_id, requested_permission, reason, status)
      VALUES ($1, $2, $3, $4, 'Pending')
    `, [decoded.userId, target_user_id || decoded.userId, requested_permission, reason]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Permission Requested', `Permission request: ${requested_permission}`, req.ip, decoded.userId]);

    res.json({
      success: true,
      message: 'Permission request submitted successfully'
    });
  } catch (error) {
    console.error('Error requesting permission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit permission request'
    });
  }
});

// ============================
// GET PERMISSION REQUESTS (SuperAdmin only)
// ============================
router.get('/permission-requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is SuperAdmin
    if (decoded.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. SuperAdmin role required.'
      });
    }

    const result = await pool.query(`
      SELECT 
        pr.request_id,
        pr.requester_id,
        pr.target_user_id,
        pr.requested_permission,
        pr.reason,
        pr.status,
        pr.created_at,
        u1.username as requester_username,
        u2.username as target_username
      FROM permission_requests pr
      LEFT JOIN users u1 ON pr.requester_id = u1.user_id
      LEFT JOIN users u2 ON pr.target_user_id = u2.user_id
      ORDER BY pr.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching permission requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permission requests'
    });
  }
});

// ============================
// APPROVE/DENY PERMISSION REQUEST (SuperAdmin only)
// ============================
router.put('/permission-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body; // action: 'approve' or 'deny'
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is SuperAdmin
    if (decoded.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. SuperAdmin role required.'
      });
    }

    // Update permission request
    await pool.query(`
      UPDATE permission_requests 
      SET status = $1, reviewed_by = $2, review_comments = $3, reviewed_at = CURRENT_TIMESTAMP
      WHERE request_id = $4
    `, [action === 'approve' ? 'Approved' : 'Denied', decoded.userId, comments, id]);

    // Log the action
    await pool.query(`
      INSERT INTO audit_logs (action, details, ip_address, user_id)
      VALUES ($1, $2, $3, $4)
    `, ['Permission Request Reviewed', `Permission request ${action}d: ${id}`, req.ip, decoded.userId]);

    res.json({
      success: true,
      message: `Permission request ${action}d successfully`
    });
  } catch (error) {
    console.error('Error updating permission request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update permission request'
    });
  }
});

module.exports = router;
