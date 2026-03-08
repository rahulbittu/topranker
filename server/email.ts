/**
 * Email service for TopRanker
 * Currently logs emails to console. Swap in Resend/SendGrid/SES when ready.
 */
import { log } from "./logger";

const emailLog = log.tag("Email");

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  // TODO: Replace with Resend/SendGrid when API key is configured
  emailLog.info(`To: ${payload.to} | Subject: ${payload.subject}`);
}

export async function sendWelcomeEmail(params: {
  email: string;
  displayName: string;
  city: string;
  username: string;
}): Promise<void> {
  const { email, displayName, city, username } = params;
  const firstName = displayName.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:#0D1B2A;padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:28px;font-weight:900;letter-spacing:-0.5px;">TopRanker</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">The world's most trustworthy ranking platform</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:22px;font-weight:700;">Welcome, ${firstName}!</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            You've joined the ${city} ranking community as <strong>@${username}</strong>. Here's what to know:
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;margin-bottom:8px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">1.</strong> Explore rankings in ${city} — see what the community thinks</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">2.</strong> After 3 days, unlock rating — your voice shapes the leaderboard</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">3.</strong> Build credibility — more ratings = higher vote weight</p>
            </td></tr>
          </table>

          <!-- Tier Preview -->
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Your Starting Tier</p>
            <p style="margin:0;color:#0D1B2A;font-size:16px;font-weight:700;">New Member</p>
            <p style="margin:4px 0 0;color:#888;font-size:12px;">0.10x vote weight · Rate to earn Regular status</p>
          </div>

          <!-- CTA -->
          <a href="https://topranker.com" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Start Exploring ${city}
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">
            TopRanker — Trust-weighted rankings for ${city}<br>
            <a href="https://topranker.com/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to TopRanker, ${firstName}!

You've joined the ${city} ranking community as @${username}.

1. Explore rankings in ${city}
2. After 3 days, unlock rating
3. Build credibility — more ratings = higher vote weight

Your starting tier: New Member (0.10x vote weight)

Start exploring: https://topranker.com

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `Welcome to TopRanker, ${firstName}! 🏆`,
    html,
    text,
  });
}

export async function sendClaimConfirmationEmail(params: {
  email: string;
  displayName: string;
  businessName: string;
}): Promise<void> {
  const { email, displayName, businessName } = params;
  const firstName = displayName.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Claim Received</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, we received your claim for <strong>${businessName}</strong>.
          </p>
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
            <p style="margin:0;color:#C49A1A;font-size:16px;font-weight:700;">Pending Review</p>
            <p style="margin:4px 0 0;color:#888;font-size:12px;">Our team will verify your claim within 24-48 hours.</p>
          </div>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
            Once approved, you'll get access to your business dashboard with analytics, review responses, and a verified owner badge.
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker — Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},

We received your claim for ${businessName}.

Status: Pending Review
Our team will verify your claim within 24-48 hours.

Once approved, you'll get access to your business dashboard.

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `Claim received: ${businessName}`,
    html,
    text,
  });
}

export async function sendPaymentReceiptEmail(params: {
  email: string;
  displayName: string;
  type: string;
  amount: number;
  businessName: string;
  paymentId: string;
}): Promise<void> {
  const { email, displayName, type, amount, businessName, paymentId } = params;
  const firstName = displayName.split(" ")[0];
  const dollars = (amount / 100).toFixed(2);

  const typeLabel = type === "challenger_entry" ? "Challenger Entry"
    : type === "dashboard_pro" ? "Dashboard Pro Subscription"
    : type === "featured_placement" ? "Featured Placement"
    : type;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Payment Receipt</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, thank you for your purchase!
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E6E1;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#F7F6F3;">
              <td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Item</td>
              <td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;text-align:right;">Amount</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;color:#0D1B2A;font-size:14px;">
                <strong>${typeLabel}</strong><br>
                <span style="color:#888;font-size:12px;">${businessName}</span>
              </td>
              <td style="padding:14px 16px;color:#0D1B2A;font-size:18px;font-weight:700;text-align:right;">$${dollars}</td>
            </tr>
            <tr style="border-top:1px solid #E8E6E1;">
              <td style="padding:12px 16px;color:#555;font-size:12px;">Reference</td>
              <td style="padding:12px 16px;color:#888;font-size:11px;text-align:right;font-family:monospace;">${paymentId}</td>
            </tr>
          </table>

          <p style="margin:0;color:#888;font-size:12px;line-height:1.5;">
            Questions about this charge? Contact us at support@topranker.com
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker — Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Payment Receipt

Hi ${firstName},

Thank you for your purchase!

Item: ${typeLabel}
Business: ${businessName}
Amount: $${dollars}
Reference: ${paymentId}

Questions? Contact support@topranker.com

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `TopRanker Receipt: $${dollars} — ${typeLabel}`,
    html,
    text,
  });
}

export async function sendClaimAdminNotification(params: {
  businessName: string;
  claimantName: string;
  claimantEmail: string;
}): Promise<void> {
  // Send to admin — in production, this would go to an admin email list
  const adminEmail = "admin@topranker.com";
  await sendEmail({
    to: adminEmail,
    subject: `New claim: ${params.businessName} by ${params.claimantName}`,
    html: `<p>New business claim submitted.</p>
      <ul>
        <li><strong>Business:</strong> ${params.businessName}</li>
        <li><strong>Claimant:</strong> ${params.claimantName} (${params.claimantEmail})</li>
      </ul>
      <p>Review at: https://topranker.com/admin</p>`,
    text: `New claim: ${params.businessName} by ${params.claimantName} (${params.claimantEmail})`,
  });
}
