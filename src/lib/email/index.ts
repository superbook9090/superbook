import nodemailer from 'nodemailer';
import { logApiError } from '@/lib/logger';

interface ContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress: string;
  timestamp: string;
}

// 1. Centralized SMTP Variables Loading & Fallbacks
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpFromName = process.env.SMTP_FROM_NAME || 'Quiz-Do Team';
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || 'quizdo9090@gmail.com';
const adminReceiverEmail = process.env.ADMIN_RECEIVER_EMAIL || 'quizdo9090@gmail.com';

// 2. Validate configuration and instantiate Nodemailer transporter
function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    const errorMsg = 'SMTP Mail Config Error: Missing SMTP environment credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD).';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents certificate verification issues on custom domains/servers
    },
  });
}

// 3. Helper to generate unique Ticket ID
function generateTicketId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ticket = 'QD-';
  for (let i = 0; i < 6; i++) {
    ticket += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ticket;
}

// 4. HTML Template for Admin Alert Email (Support Ticket Style)
function getAdminHtmlTemplate(params: ContactEmailParams, ticketId: string): string {
  const { name, email, subject, message, ipAddress, timestamp } = params;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Support Ticket</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f8fafc;
        color: #1e293b;
      }
      .wrapper {
        width: 100%;
        table-layout: fixed;
        background-color: #f8fafc;
        padding: 40px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid #e2e8f0;
      }
      .header {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        padding: 32px 24px;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 6px 0;
      }
      .header-title {
        font-size: 14px;
        font-weight: 600;
        color: #e0e7ff;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0;
      }
      .content {
        padding: 32px 24px;
      }
      .badge-row {
        margin-bottom: 24px;
        text-align: left;
      }
      .badge {
        display: inline-block;
        padding: 6px 12px;
        background-color: #e0e7ff;
        color: #4338ca;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .section-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #64748b;
        margin: 0 0 12px 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
      }
      .meta-grid {
        display: table;
        width: 100%;
        margin-bottom: 24px;
      }
      .meta-row {
        display: table-row;
      }
      .meta-label {
        display: table-cell;
        width: 120px;
        font-size: 13px;
        font-weight: 700;
        color: #64748b;
        padding: 6px 0;
      }
      .meta-value {
        display: table-cell;
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        padding: 6px 0;
      }
      .meta-value a {
        color: #4f46e5;
        text-decoration: none;
      }
      .meta-value a:hover {
        text-decoration: underline;
      }
      .message-box {
        background-color: #f8fafc;
        border-left: 4px solid #4f46e5;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 24px;
        border-top: 1px solid #edf2f7;
        border-right: 1px solid #edf2f7;
        border-bottom: 1px solid #edf2f7;
      }
      .message-box p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: #334155;
        white-space: pre-wrap;
      }
      .footer {
        background-color: #f1f5f9;
        padding: 24px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer-text {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="logo">Quiz-Do</div>
          <div class="header-title">Contact Us Submission</div>
        </div>
        <div class="content">
          <div class="badge-row">
            <span class="badge">Ticket ID: ${ticketId}</span>
          </div>

          <div class="section-title">Submitter Information</div>
          <div class="meta-grid">
            <div class="meta-row">
              <div class="meta-label">Name:</div>
              <div class="meta-value">${name}</div>
            </div>
            <div class="meta-row">
              <div class="meta-label">Email:</div>
              <div class="meta-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="meta-row">
              <div class="meta-label">IP Address:</div>
              <div class="meta-value">${ipAddress}</div>
            </div>
            <div class="meta-row">
              <div class="meta-label">Timestamp:</div>
              <div class="meta-value">${timestamp}</div>
            </div>
          </div>

          <div class="section-title">Query Summary</div>
          <div class="meta-grid">
            <div class="meta-row">
              <div class="meta-label">Subject:</div>
              <div class="meta-value" style="font-weight: 800; color: #4338ca;">${subject}</div>
            </div>
          </div>

          <div class="section-title">Message Body</div>
          <div class="message-box">
            <p>${message}</p>
          </div>
        </div>
        <div class="footer">
          <p class="footer-text">
            This inquiry was submitted dynamically via the public Quiz-Do contact form page.<br>
            Please respond directly to the submitter by replying to their email address.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// 5. HTML Template for User Auto-Reply Receipt Confirmation
function getUserHtmlTemplate(params: ContactEmailParams, ticketId: string): string {
  const { name, subject, message } = params;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Ticket Received</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f8fafc;
        color: #1e293b;
      }
      .wrapper {
        width: 100%;
        table-layout: fixed;
        background-color: #f8fafc;
        padding: 40px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid #e2e8f0;
      }
      .header {
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        padding: 32px 24px;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0 0 6px 0;
      }
      .header-title {
        font-size: 14px;
        font-weight: 600;
        color: #e0e7ff;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin: 0;
      }
      .content {
        padding: 32px 24px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 16px 0;
      }
      .body-text {
        font-size: 14px;
        line-height: 1.6;
        color: #475569;
        margin: 0 0 24px 0;
      }
      .ticket-box {
        background-color: #e0e7ff;
        border: 1px dashed #4f46e5;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 700;
        color: #4338ca;
        text-align: center;
        margin-bottom: 24px;
      }
      .section-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #64748b;
        margin: 0 0 12px 0;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
      }
      .message-box {
        background-color: #f8fafc;
        border: 1px solid #edf2f7;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 24px;
      }
      .message-box h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 700;
        color: #334155;
      }
      .message-box p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: #64748b;
        white-space: pre-wrap;
      }
      .footer {
        background-color: #f1f5f9;
        padding: 24px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer-text {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.5;
        font-weight: 500;
      }
      .footer-logo {
        font-weight: 700;
        color: #4f46e5;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="logo">Quiz-Do</div>
          <div class="header-title">Message Received Confirmation</div>
        </div>
        <div class="content">
          <h3 class="greeting">Hello ${name},</h3>
          <p class="body-text">
            Thank you for reaching out to Quiz-Do! We have received your inquiry and created a support ticket.
            Our team is currently reviewing your message, and one of our members will reach out to you within 24 business hours.
          </p>

          <div class="ticket-box">
            Your Support Ticket ID: ${ticketId}
          </div>

          <div class="section-title">Your Submission Details</div>
          <div class="message-box">
            <h4>Subject: ${subject}</h4>
            <p>${message}</p>
          </div>

          <p class="body-text" style="margin-bottom: 0;">
            Best regards,<br>
            <strong>The Quiz-Do Support Team</strong>
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">
            © ${new Date().getFullYear()} <span class="footer-logo">Quiz-Do</span>. All rights reserved.<br>
            Please do not reply to this email, as it is an automated receipt confirmation sent by our platform.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// 6. Production-Ready Mail Sending Functions
export async function sendContactEmail(params: ContactEmailParams): Promise<{ success: boolean; ticketId: string }> {
  const ticketId = generateTicketId();

  try {
    const transporter = getTransporter();

    // Send Alert Notification to Admin Support Inbox
    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: adminReceiverEmail,
      replyTo: params.email, // Allows one-click direct reply to submitter!
      subject: `[Support Ticket: ${ticketId}] ${params.subject}`,
      text: `New Inquiry from ${params.name} (${params.email}) on ${params.timestamp}.\n\nSubject: ${params.subject}\n\nMessage:\n${params.message}\n\nIP Address: ${params.ipAddress}\nTicket ID: ${ticketId}`,
      html: getAdminHtmlTemplate(params, ticketId),
    });

    return { success: true, ticketId };
  } catch (error) {
    logApiError(error as Error, 'sendMail', '/lib/email/index.ts', { method: 'SMTP_ADMIN' });
    throw error;
  }
}

export async function sendUserAutoReply(params: ContactEmailParams, ticketId: string): Promise<boolean> {
  try {
    const transporter = getTransporter();

    // Send Receipt Confirmation to Submitter
    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: params.email,
      subject: `We've received your query [Ticket ID: ${ticketId}]`,
      text: `Hello ${params.name},\n\nThank you for reaching out! We've received your inquiry (Ticket ID: ${ticketId}). A support member will contact you within 24 business hours.\n\nSubject: ${params.subject}\nMessage:\n${params.message}\n\nBest regards,\nQuiz-Do Support Team`,
      html: getUserHtmlTemplate(params, ticketId),
    });

    return true;
  } catch (error) {
    // Log auto-reply failures, but do not throw to prevent blocking form success!
    logApiError(error as Error, 'sendMail', '/lib/email/index.ts', { method: 'SMTP_AUTOREPLY' });
    return false;
  }
}

function passwordResetHtml(name: string, resetUrl: string): string {
  const safeName = name.replace(/[<>]/g, '');
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#3730a3);padding:28px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Quiz-Do</h1>
        <p style="margin:8px 0 0;color:#e0e7ff;font-size:13px;">Password Reset</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hello ${safeName},</p>
        <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
          This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:10px;font-size:14px;">
          Reset Password
        </a>
        <p style="margin:20px 0 0;color:#64748b;font-size:12px;line-height:1.6;word-break:break-all;">
          Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color:#4f46e5;">${resetUrl}</a>
        </p>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
  </html>`;
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  try {
    const transporter = getTransporter();
    const safeName = params.name.replace(/[<>]/g, '');

    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: params.to,
      replyTo: smtpFromEmail,
      subject: 'Reset your Quiz-Do password',
      text: `Hello ${safeName},\n\nReset your password using this link (expires in 1 hour):\n${params.resetUrl}\n\nIf you did not request this, ignore this email.\n\n— Quiz-Do Team`,
      html: passwordResetHtml(safeName, params.resetUrl),
    });
  } catch (error) {
    logApiError(error as Error, 'sendMail', '/lib/email/index.ts', { method: 'SMTP_PASSWORD_RESET' });
    throw error;
  }
}
