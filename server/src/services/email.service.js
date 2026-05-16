const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, text, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.GYM_NAME || 'GymFlow Pro'}" <${process.env.EMAIL_FROM || 'noreply@gymflow.com'}>`,
        to,
        subject,
        text,
        html,
      });

      logger.info(`Message sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      // In a real app, you might want to retry or use a fallback
      return null;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = `Welcome to the Workforce, ${user.firstName}!`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #00f2fe;">Welcome to GymFlow Pro</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your access to the fitness terminal has been activated. You can now track your workouts, manage your nutrition, and sync with your AI coach.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Your Temporary Terminal Access:</strong><br/>
          Dashboard: <a href="${process.env.CLIENT_URL}">Access Now</a>
        </div>
        <p>Stay focused, stay consistent.</p>
        <p>-- GymFlow Command</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, `Welcome to GymFlow Pro, ${user.firstName}!`, html);
  }

  async sendPasswordResetEmail(user, otp) {
    const subject = `Password Reset Command: [${otp}]`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f59e0b;">Password Reset Requested</h2>
        <p>A password reset command was initiated for your GymFlow account.</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <span style="font-size: 2rem; font-weight: 900; letter-spacing: 5px; color: #111;">${otp}</span>
          <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">This code expires in 10 minutes.</p>
        </div>
        <p>If you did not request this, please ignore this email or contact support.</p>
        <p>-- GymFlow Command</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, `Your password reset code is: ${otp}`, html);
  }
}

module.exports = new EmailService();
