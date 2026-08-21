import nodemailer from 'nodemailer';

// Configure SMTP transport (uses local or environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Inara Technologies" <no-reply@inara.io>',
    to,
    subject,
    text,
    html,
  };

  // If credentials aren't set, log to console for local development ease
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    return { mock: true, messageId: 'mock-id' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error);
    // Silent fail so API requests don't error out completely due to email config issues
    return { error: true };
  }
};
