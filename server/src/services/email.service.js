const { Resend } = require('resend');
const logger = require('../utils/logger');

// ── Resend client (only initialized if API key exists) ─────────
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  logger.info('✅ Email service ready via Resend — sender: GymFlow Pro <onboarding@resend.dev>');
} else {
  logger.warn('⚠️  RESEND_API_KEY not set — emails will be skipped (member credentials shown in API response only)');
}

class EmailService {
  // ── Core send method ──────────────────────────────────────────
  async sendEmail(to, subject, text, html) {
    if (!resend) {
      logger.warn(`Email skipped (no API key) — would have sent to: ${to}`);
      return null;
    }
    try {
      const { data, error } = await resend.emails.send({
        from: 'GymFlow Pro <onboarding@resend.dev>', // Free Resend domain — works immediately
        to,
        subject,
        text,
        html,
      });
      if (error) throw new Error(error.message);
      logger.info(`✉️  Email sent to ${to} — ID: ${data.id}`);
      return data;
    } catch (err) {
      logger.error('Email send error:', err.message);
      return null;
    }
  }

  // ── Gym owner signup welcome ──────────────────────────────────
  async sendWelcomeEmail({ firstName, email }) {
    return this.sendEmail(
      email,
      `Welcome to GymFlow Pro, ${firstName}!`,
      `Your gym is now live on GymFlow Pro.`,
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#111;border-radius:16px;color:#fff">
        <h2 style="color:#F59E0B;margin:0 0 16px">GymFlow Pro 🏋️</h2>
        <p>Hi ${firstName}, your gym is now live!</p>
        <p>Visit your admin dashboard to add members, manage plans, and track attendance.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;border-radius:10px;text-decoration:none;font-weight:800">Open Dashboard →</a>
        <p style="margin-top:24px;color:#555;font-size:12px">GymFlow Pro · Your gym's command center</p>
      </div>`
    );
  }

  // ── Member welcome with credentials ──────────────────────────
  async sendMemberWelcomeEmail({ firstName, email, tempPassword, accessPin, appUrl }) {
    const html = `<!DOCTYPE html>
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
    <a href="${appUrl}/login" style="display:block;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:0.5px;">
      Open Member Portal →
    </a>

    <p style="color:#444;font-size:12px;text-align:center;margin-top:24px;">
      Login at: ${appUrl}/login
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
      `🏋️ You've been added to GymFlow — your login details`,
      `Welcome to GymFlow Pro! Email: ${email} | Password: ${tempPassword} | PIN: ${accessPin}`,
      html
    );
  }

  // ── Password reset OTP ────────────────────────────────────────
  async sendPasswordResetEmail(user, otp) {
    return this.sendEmail(
      user.email,
      `Password Reset Code: [${otp}]`,
      `Your password reset code is: ${otp}`,
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#111;border-radius:16px;color:#fff">
        <h2 style="color:#F59E0B;">Password Reset</h2>
        <p>A reset was requested for your GymFlow account.</p>
        <div style="background:#1a1a24;padding:24px;border-radius:12px;text-align:center;margin:20px 0;">
          <span style="font-size:2.5rem;font-weight:900;letter-spacing:8px;color:#fff;">${otp}</span>
          <p style="color:#666;font-size:12px;margin-top:8px;">Expires in 10 minutes</p>
        </div>
        <p style="color:#555;font-size:13px;">If you didn't request this, ignore this email.</p>
        <p style="color:#444;font-size:12px;margin-top:16px;">— GymFlow Pro</p>
      </div>`
    );
  }
}

module.exports = new EmailService();
