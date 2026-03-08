/**
 * Email service for TopRanker
 * Currently logs emails to console. Swap in Resend/SendGrid/SES when ready.
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  // TODO: Replace with Resend/SendGrid when API key is configured
  // Example with Resend:
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({ from: 'TopRanker <hello@topranker.com>', ...payload });
  console.log(`[Email] To: ${payload.to} | Subject: ${payload.subject}`);
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
            <p style="margin:0;color:#0D1B2A;font-size:16px;font-weight:700;">Community Member</p>
            <p style="margin:4px 0 0;color:#888;font-size:12px;">0.10x vote weight · Rate to earn City Reviewer status</p>
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

Your starting tier: Community Member (0.10x vote weight)

Start exploring: https://topranker.com

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `Welcome to TopRanker, ${firstName}! 🏆`,
    html,
    text,
  });
}
