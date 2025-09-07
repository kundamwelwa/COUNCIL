const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  async init() {
    try {
      // Check if real email is enabled
      const useRealEmail = process.env.USE_REAL_EMAIL === 'true' || process.env.NODE_ENV === 'production';
      
      if (useRealEmail) {
        // Configure real email service with Yahoo SMTP
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.mail.yahoo.com',
          port: process.env.SMTP_PORT || 587,
          secure: false, // Yahoo uses port 587 with STARTTLS
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verify connection
        await this.transporter.verify();
        this.isConfigured = true;
        console.log('📧 Email service initialized (Real Email Mode - Yahoo SMTP)');
      } else {
        // Development mode - use mock transporter
        this.transporter = {
          sendMail: async (options) => {
            console.log('\n📧 EMAIL SENT (Development Mode)');
            console.log('=====================================');
            console.log(`To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log('Content:');
            console.log(options.html || options.text);
            console.log('=====================================\n');
            
            // In development, always succeed
            return { messageId: 'dev-' + Date.now() };
          }
        };
        this.isConfigured = true;
        console.log('📧 Email service initialized (Development Mode)');
      }
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('📧 Falling back to development mode...');
      
      // Fallback to mock service
      this.transporter = {
        sendMail: async (options) => {
          console.log('\n📧 EMAIL SENT (Fallback Mode)');
          console.log('=====================================');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log('Content:');
          console.log(options.html || options.text);
          console.log('=====================================\n');
          
          return { messageId: 'fallback-' + Date.now() };
        }
      };
      this.isConfigured = true;
      console.log('📧 Email service initialized (Fallback Mode)');
    }
  }

  async sendEmail(to, subject, html, text) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    try {
      console.log(`📧 Attempting to send email to: ${to}`);
      console.log(`📧 From: ${process.env.FROM_EMAIL || 'noreply@council.gov.zm'}`);
      console.log(`📧 Subject: ${subject}`);
      
      const result = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@council.gov.zm',
        to,
        subject,
        html,
        text
      });

      console.log(`✅ Email sent successfully. Message ID: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      console.error('❌ Error details:', error);
      throw error;
    }
  }

  async sendVerificationEmail(userEmail, username, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const html = this.getVerificationEmailTemplate(username, verificationUrl);
    const text = this.getVerificationEmailText(username, verificationUrl);

    console.log(`📧 Sending verification email to: ${userEmail}`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);

    return await this.sendEmail(
      userEmail,
      'Verify Your Council Management System Account',
      html,
      text
    );
  }

  async sendPasswordResetEmail(userEmail, username, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetEmailTemplate(username, resetUrl);
    const text = this.getPasswordResetEmailText(username, resetUrl);

    console.log(`📧 Sending password reset email to: ${userEmail}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);

    return await this.sendEmail(
      userEmail,
      'Reset Your Council Management System Password',
      html,
      text
    );
  }

  async sendWelcomeEmail(userEmail, username, role) {
    const html = this.getWelcomeEmailTemplate(username, role);
    const text = this.getWelcomeEmailText(username, role);

    return await this.sendEmail(
      userEmail,
      'Welcome to Council Management System',
      html,
      text
    );
  }

  getVerificationEmailTemplate(username, verificationUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #22c55e, #f97316, #ef4444, #1e293b); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #22c55e, #f97316); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .logo { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #1e293b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️</div>
                <h1>Council Management System</h1>
            </div>
            <div class="content">
                <h2>Hello ${username}!</h2>
                <p>Thank you for registering with the Council Management System. To complete your registration and start using the platform, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationUrl}</p>
                
                <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2024 Council Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getVerificationEmailText(username, verificationUrl) {
    return `
Council Management System - Email Verification

Hello ${username}!

Thank you for registering with the Council Management System. To complete your registration and start using the platform, please verify your email address by visiting the following link:

${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, please ignore this email.

© 2024 Council Management System. All rights reserved.
    `;
  }

  getPasswordResetEmailTemplate(username, resetUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .logo { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #1e293b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔐</div>
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Hello ${username}!</h2>
                <p>We received a request to reset your password for your Council Management System account. Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
                
                <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
                
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>© 2024 Council Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getPasswordResetEmailText(username, resetUrl) {
    return `
Council Management System - Password Reset Request

Hello ${username}!

We received a request to reset your password for your Council Management System account. Visit the following link to reset your password:

${resetUrl}

This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

© 2024 Council Management System. All rights reserved.
    `;
  }

  getWelcomeEmailTemplate(username, role) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #22c55e, #f97316, #ef4444, #1e293b); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #22c55e, #f97316); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .logo { width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #1e293b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎉</div>
                <h1>Welcome to Council Management System</h1>
            </div>
            <div class="content">
                <h2>Hello ${username}!</h2>
                <p>Welcome to the Council Management System! Your account has been successfully verified and you can now access all features of the platform.</p>
                
                <p><strong>Your Role:</strong> ${role}</p>
                
                <p>You can now:</p>
                <ul>
                    <li>Access the dashboard and view system statistics</li>
                    <li>Manage beneficiaries and their information</li>
                    <li>Track programs and funding allocations</li>
                    <li>Generate reports and analytics</li>
                    <li>And much more based on your role permissions</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
                </div>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </div>
            <div class="footer">
                <p>© 2024 Council Management System. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getWelcomeEmailText(username, role) {
    return `
Council Management System - Welcome!

Hello ${username}!

Welcome to the Council Management System! Your account has been successfully verified and you can now access all features of the platform.

Your Role: ${role}

You can now:
- Access the dashboard and view system statistics
- Manage beneficiaries and their information
- Track programs and funding allocations
- Generate reports and analytics
- And much more based on your role permissions

Login to your account: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

If you have any questions or need assistance, please contact our support team.

© 2024 Council Management System. All rights reserved.
    `;
  }
}

module.exports = new EmailService();
