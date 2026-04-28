const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FROM = () => `"${process.env.EMAIL_FROM_NAME || 'VedhaEduSpark'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.BREVO_SMTP_USER}>`;

// Logo URL — update this with your deployed URL or Cloudinary-hosted logo
const LOGO_URL = process.env.LOGO_URL || 'https://raw.githubusercontent.com/Maganti-Praveen/vedhaeduspark/main/assets/logo.png';

// Shared email header with logo
const emailHeader = (title, gradient = 'linear-gradient(135deg,#1a56db,#7c3aed)') => `
  <div style="background:${gradient};padding:30px 24px;text-align:center">
    <img src="${LOGO_URL}" alt="VedhaEduSpark" style="width:60px;height:60px;border-radius:12px;margin-bottom:10px" />
    <h1 style="color:#fff;margin:0;font-size:22px">${title}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px">VedhaEduSpark Centre</p>
  </div>`;

const emailFooter = () => `
  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:11px;margin:0">© ${new Date().getFullYear()} VedhaEduSpark Centre. All rights reserved.</p>
  </div>`;

const emailWrap = (content) => `
  <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    ${content}
  </div>`;

// ─── Coupon Email ─────────────────────────────
const sendCouponEmail = async (to, courseName, couponCode, price) => {
  const html = emailWrap(`
    ${emailHeader('🎟️ Your Coupon Code')}
    <div style="padding:28px 24px">
      <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 16px">
        Thank you for your payment of <strong>₹${price}</strong> for the course <strong>"${courseName}"</strong>. 
        Here is your coupon code:
      </p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;margin:0 0 20px">
        <div style="font-size:28px;font-weight:800;letter-spacing:4px;color:#1a56db;font-family:monospace">${couponCode}</div>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 12px">
        📌 Go to <strong>Courses</strong> → Click <strong>"Enroll Now"</strong> on "${courseName}" → Enter the coupon code above.
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:16px 0 0;padding-top:16px;border-top:1px solid #e2e8f0">
        ⚠️ This coupon is single-use and valid for this course only. Do not share it with others.
      </p>
    </div>
    ${emailFooter()}
  `);

  try {
    await transporter.sendMail({ from: FROM(), to, subject: `🎟️ Your Coupon for "${courseName}" — VedhaEduSpark`, html });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
};

// ─── Welcome Email ─────────────────────────────
const sendWelcomeEmail = async (name, email) => {
  const html = emailWrap(`
    ${emailHeader('Welcome to VedhaEduSpark! 🎉')}
    <div style="padding:28px 24px">
      <p style="color:#334155;font-size:14px;line-height:1.7">Hi <strong>${name}</strong>,</p>
      <p style="color:#334155;font-size:14px;line-height:1.7">Your account has been created successfully. Start learning courses, solving problems, and tracking your progress today!</p>
    </div>
    ${emailFooter()}
  `);

  try {
    await transporter.sendMail({ from: FROM(), to: email, subject: 'Welcome to VedhaEduSpark! 🎉', html });
    return true;
  } catch (err) {
    console.error('Welcome email failed:', err.message);
    return false;
  }
};

// ─── Reset Password Email ──────────────────────
const sendResetPasswordEmail = async (name, email, resetUrl) => {
  const html = emailWrap(`
    ${emailHeader('🔒 Reset Your Password', 'linear-gradient(135deg,#ef4444,#f59e0b)')}
    <div style="padding:28px 24px">
      <p style="color:#334155;font-size:14px;line-height:1.7">Hi <strong>${name}</strong>,</p>
      <p style="color:#334155;font-size:14px;line-height:1.7">We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a56db,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px">Reset Password</a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6">If you didn't request this, please ignore this email. This link expires in 15 minutes.</p>
      <p style="color:#94a3b8;font-size:11px;margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;word-break:break-all">Link: ${resetUrl}</p>
    </div>
    ${emailFooter()}
  `);

  try {
    await transporter.sendMail({ from: FROM(), to: email, subject: '🔒 Reset Your Password — VedhaEduSpark', html });
    return true;
  } catch (err) {
    console.error('Reset email failed:', err.message);
    return false;
  }
};

// ─── Admin Notification Email ──────────────────
const sendNotificationEmail = async (name, email, subject, content) => {
  const html = emailWrap(`
    ${emailHeader(`📢 ${subject}`)}
    <div style="padding:28px 24px">
      <p style="color:#334155;font-size:14px;line-height:1.7">Hi <strong>${name}</strong>,</p>
      <p style="color:#334155;font-size:14px;line-height:1.7">${content}</p>
    </div>
    ${emailFooter()}
  `);

  try {
    await transporter.sendMail({ from: FROM(), to: email, subject: `📢 ${subject} — VedhaEduSpark`, html });
    return true;
  } catch (err) {
    console.error('Notification email failed:', err.message);
    return false;
  }
};

// ─── E-Book Email ──────────────────────────────
async function sendEbookEmail(email, ebookTitle, pdfUrl, author) {
  const html = emailWrap(`
    ${emailHeader('📚 Your E-Book is Here!', 'linear-gradient(135deg,#7c3aed,#2563eb)')}
    <div style="padding:28px 24px">
      <p style="color:#334155;font-size:14px;line-height:1.7;margin:0 0 6px">Your e-book <strong>"${ebookTitle}"</strong> by <em>${author}</em> is ready!</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${pdfUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:14px">📥 Download PDF</a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.6">If the button doesn't work, copy this link:<br><a href="${pdfUrl}" style="color:#2563eb;word-break:break-all">${pdfUrl}</a></p>
    </div>
    ${emailFooter()}
  `);

  try {
    await transporter.sendMail({ from: FROM(), to: email, subject: `📚 Your E-Book: "${ebookTitle}" — VedhaEduSpark`, html });
    return true;
  } catch (err) {
    console.error('E-Book email failed:', err.message);
    return false;
  }
}

module.exports = { sendCouponEmail, sendWelcomeEmail, sendResetPasswordEmail, sendNotificationEmail, sendEbookEmail };
