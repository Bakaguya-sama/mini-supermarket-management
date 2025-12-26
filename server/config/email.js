// config/email.js - Email Service Configuration
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Transporter Configuration
 * Sử dụng Gmail SMTP hoặc email service khác
 */
const createTransporter = () => {
  // Option 1: Gmail SMTP (recommended for development)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App Password nếu dùng Gmail
      },
    });
  }

  // Option 2: Custom SMTP
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send verification code email
 * @param {string} to - Recipient email
 * @param {string} verificationCode - 6-digit code
 * @param {string} userName - User's name
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, verificationCode, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mini Supermarket" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #10b981;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .verification-code {
              font-size: 32px;
              font-weight: bold;
              color: #10b981;
              text-align: center;
              padding: 20px;
              background-color: #f0f0f0;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .warning {
              color: #e74c3c;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏪 Mini Supermarket</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${userName},</p>
              <p>We received a request to reset your password. Please use the verification code below:</p>
              
              <div class="verification-code">
                ${verificationCode}
              </div>
              
              <p><strong>This code will expire in 10 minutes.</strong></p>
              
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> Never share this code with anyone. Our team will never ask for your verification code.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Mini Supermarket Management System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Mini Supermarket - Password Reset
        
        Hello ${userName},
        
        We received a request to reset your password.
        
        Your verification code is: ${verificationCode}
        
        This code will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        © 2025 Mini Supermarket Management System
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset success notification
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise}
 */
const sendPasswordResetSuccessEmail = async (to, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mini Supermarket" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Password Reset Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #10b981;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .success-icon {
              font-size: 48px;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏪 Mini Supermarket</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Password Reset Successful</h2>
              <p>Hello ${userName},</p>
              <p>Your password has been successfully reset.</p>
              <p>You can now log in with your new password.</p>
              <p>If you didn't perform this action, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>© 2025 Mini Supermarket Management System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset success email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending success email:', error);
    // Don't throw - this is not critical
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetSuccessEmail,
  testEmailConfig,
};
