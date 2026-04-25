const nodemailer = require('nodemailer');

// ─── Brevo SMTP Transport ────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || 'VedhaEduSpark'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@vedhaeduspark.com'}>`;

// ─── Base Send Function ──────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    throw error;
  }
};

// ─── Shared HTML Wrapper ─────────────────────────────────────
const wrapTemplate = (body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1a56db 50%, #3b82f6 100%); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header .logo { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #ea580c, #fb923c); border-radius: 12px; line-height: 48px; color: #fff; font-weight: 800; font-size: 22px; margin-bottom: 12px; }
    .body { padding: 40px; }
    .body h2 { color: #111827; font-size: 20px; margin: 0 0 16px; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #ea580c, #fb923c); color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
    .btn-blue { background: linear-gradient(135deg, #1a56db, #3b82f6); }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .footer { padding: 24px 40px; text-align: center; background: #f9fafb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
    .footer a { color: #3b82f6; text-decoration: none; }
    .highlight { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight p { color: #1e3a5f; margin: 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">V</div>
      <h1>VedhaEduSpark</h1>
    </div>
    ${body}
  </div>
</body>
</html>`;

// ─── Welcome Email ───────────────────────────────────────────
const sendWelcomeEmail = async (name, email) => {
  const subject = '🎉 Welcome to VedhaEduSpark!';
  const html = wrapTemplate(`
    <div class="body">
      <h2>Welcome aboard, ${name}! 👋</h2>
      <p>Thank you for joining <strong>VedhaEduSpark</strong> — your all-in-one CSE learning platform.</p>
      <p>Here's what you can do now:</p>
      <div class="highlight">
        <p>📚 <strong>Learn</strong> — DSA, DBMS, OS, CN with structured notes & videos</p>
      </div>
      <div class="highlight">
        <p>💻 <strong>Practice</strong> — Solve coding problems with our built-in IDE</p>
      </div>
      <div class="highlight">
        <p>📊 <strong>Track</strong> — Monitor your progress and skill growth</p>
      </div>
      <p style="margin-top: 24px;">Ready to start learning?</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard →</a>
      <p>If you have any questions, feel free to reach out to us anytime.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VedhaEduSpark Centre. All rights reserved.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Visit Website</a></p>
    </div>
  `);
  return sendEmail(email, subject, html);
};

// ─── Password Reset Email ────────────────────────────────────
const sendResetPasswordEmail = async (name, email, resetUrl) => {
  const subject = '🔐 Reset Your Password — VedhaEduSpark';
  const html = wrapTemplate(`
    <div class="body">
      <h2>Password Reset Request</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your VedhaEduSpark account. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="btn btn-blue">Reset Password →</a>
      <div class="highlight">
        <p>⏰ This link is valid for <strong>15 minutes</strong> only. After that, you'll need to request a new one.</p>
      </div>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #9ca3af;">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VedhaEduSpark Centre. All rights reserved.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Visit Website</a></p>
    </div>
  `);
  return sendEmail(email, subject, html);
};

// ─── Admin Notification Email ────────────────────────────────
const sendNotificationEmail = async (name, email, subject, content) => {
  const html = wrapTemplate(`
    <div class="body">
      <h2>${subject}</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <div style="white-space: pre-wrap; color: #374151; font-size: 15px; line-height: 1.8; margin: 16px 0;">
${content}
      </div>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #9ca3af;">This notification was sent by the VedhaEduSpark team.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VedhaEduSpark Centre. All rights reserved.</p>
      <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Visit Website</a></p>
    </div>
  `);
  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendNotificationEmail,
};
