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
      `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111118;border-radius:20px;overflow:hidden;border:1px solid #222;">
  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" alt="Gym" style="width:100%;height:140px;object-fit:cover;border-bottom:3px solid #F59E0B;display:block;" />
  <div style="padding:40px;">
    <h2 style="color:#fff;margin:0 0 8px;font-size:24px;">Welcome, ${firstName}! 🚀</h2>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">
      Your gym is now officially live on <strong>GymFlow Pro</strong>. You have unlocked the ultimate command center to manage members, process memberships, and deploy AI-driven training.
    </p>
    <div style="background:#1a1a24;border:1px solid #2a2a3a;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="color:#F59E0B;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">SYSTEM STATUS</div>
      <div style="color:#22C55E;font-size:20px;font-weight:900;letter-spacing:1px;">ALL SYSTEMS OPERATIONAL</div>
    </div>
    <a href="${process.env.CLIENT_URL}/login" style="display:block;background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:0.5px;">
      Initialize Dashboard →
    </a>
  </div>
  <div style="padding:20px 40px;border-top:1px solid #1a1a24;text-align:center;">
    <p style="color:#333;font-size:12px;margin:0;">GymFlow Pro · The Future of Fitness</p>
  </div>
</div>
</body>
</html>`
    );
  }

  // ── Member welcome with credentials ──────────────────────────
  async sendMemberWelcomeEmail({ firstName, email, tempPassword, accessPin, appUrl }) {
    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111118;border-radius:20px;overflow:hidden;border:1px solid #222;">

  <!-- Header Image -->
  <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" alt="GymFlow Training" style="width:100%;height:160px;object-fit:cover;display:block;" />
  <div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:16px 40px;">
    <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">GymFlow Pro</div>
    <div style="color:rgba(255,255,255,0.9);font-size:11px;margin-top:2px;letter-spacing:2px;text-transform:uppercase;">Member Portal Access</div>
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
      `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#111118;border-radius:20px;overflow:hidden;border:1px solid #222;">
  <div style="background:#F59E0B;padding:24px 40px;">
    <div style="font-size:20px;font-weight:900;color:#000;letter-spacing:-0.5px;">GymFlow Pro</div>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#fff;margin:0 0 8px;font-size:22px;">Password Reset Request</h2>
    <p style="color:#888;font-size:15px;line-height:1.6;margin:0 0 32px;">
      A password reset command was initiated for your account. Please use the secure OTP below to proceed.
    </p>
    <div style="background:#1a1a24;border:1px solid #2a2a3a;border-radius:14px;padding:32px;margin-bottom:24px;text-align:center;">
      <div style="color:#666;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">AUTHORIZATION CODE</div>
      <div style="color:#fff;font-size:36px;font-weight:900;letter-spacing:12px;">${otp}</div>
      <div style="color:#EF4444;font-size:12px;margin-top:12px;font-weight:600;">⚠️ Expires in 10 minutes</div>
    </div>
    <p style="color:#444;font-size:13px;text-align:center;">If you did not request this, please ignore this email.</p>
  </div>
</div>
</body>
</html>`
    );
  }
}

module.exports = new EmailService();
