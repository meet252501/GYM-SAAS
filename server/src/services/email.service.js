const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // Verify connection on startup (non-blocking)
    if (process.env.EMAIL_USER) {
      this.transporter.verify()
        .then(() => logger.info(`✅ Email service ready — sending as "GymFlow Pro" <${process.env.EMAIL_USER}>`))
        .catch(err => logger.warn(`⚠️ Email service not connected: ${err.message}`));
    }
  }

  async sendEmail(to, subject, text, html) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.warn('Email skipped — EMAIL_USER / EMAIL_PASS not set in environment');
        return null;
      }
      const info = await this.transporter.sendMail({
        from: `"GymFlow Pro" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      logger.info(`Email sent to ${to} — ID: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      return null;
    }
  }


  async sendWelcomeEmail(user) {
    const subject = `Welcome to the Workforce, ${user.firstName}!`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #00f2fe;">Welcome to GymFlow Pro</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your access to the fitness terminal has been activated.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Dashboard:</strong> <a href="${process.env.CLIENT_URL}">Access Now</a>
        </div>
        <p>-- GymFlow Command</p>
      </div>
    `;
    return this.sendEmail(user.email, subject, `Welcome to GymFlow Pro, ${user.firstName}!`, html);
  }

  // Sent when admin adds a new member — contains login credentials
  async sendMemberWelcomeEmail({ firstName, email, tempPassword, accessPin, appUrl }) {
    const subject = `🏋️ You've been added to GymFlow — your login details`;
    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111118;border-radius:20px;overflow:hidden;border:1px solid #222;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:32px 40px;">
    <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">GymFlow Pro</div>
    <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Member Portal Access</div>
  </div>

  <!-- Body -->
  <div style="padding:40px;">
    <h2 style="color:#fff;margin:0 0 8px;font-size:22px;">Welcome, ${firstName}! 💪</h2>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">
      Your gym has added you to GymFlow Pro. Use the credentials below to access your personal member portal — track workouts, view your program, and chat with the AI coach.
    </p>

    <!-- Credentials box -->
    <div style="background:#1a1a24;border:1px solid #2a2a3a;border-radius:14px;padding:24px;margin-bottom:24px;">
      <div style="font-size:11px;color:#F59E0B;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Your Login Credentials</div>

      <div style="margin-bottom:14px;">
        <div style="color:#666;font-size:12px;margin-bottom:4px;">EMAIL</div>
        <div style="color:#fff;font-size:16px;font-weight:700;">${email}</div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="color:#666;font-size:12px;margin-bottom:4px;">TEMPORARY PASSWORD</div>
        <div style="color:#F59E0B;font-size:22px;font-weight:900;letter-spacing:2px;">${tempPassword}</div>
        <div style="color:#555;font-size:11px;margin-top:4px;">Change this after first login</div>
      </div>

      ${accessPin ? `
      <div style="border-top:1px solid #2a2a3a;padding-top:14px;margin-top:14px;">
        <div style="color:#666;font-size:12px;margin-bottom:4px;">KIOSK CHECK-IN PIN</div>
        <div style="color:#22C55E;font-size:28px;font-weight:900;letter-spacing:6px;">${accessPin}</div>
        <div style="color:#555;font-size:11px;margin-top:4px;">Enter this at the front desk tablet to check in</div>
      </div>` : ''}
    </div>

    <!-- CTA -->
    <a href="${appUrl}/member-login" style="display:block;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:0.5px;">
      Open Member Portal →
    </a>

    <p style="color:#444;font-size:12px;text-align:center;margin-top:24px;">
      Login at: ${appUrl}/member-login
    </p>
  </div>

  <!-- Footer -->
  <div style="padding:20px 40px;border-top:1px solid #1a1a24;text-align:center;">
    <p style="color:#333;font-size:12px;margin:0;">GymFlow Pro · Your gym's digital command center</p>
  </div>
</div>
</body>
</html>`;

    return this.sendEmail(
      email,
      subject,
      `Welcome to GymFlow Pro! Email: ${email} | Password: ${tempPassword} | PIN: ${accessPin}`,
      html
    );
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
