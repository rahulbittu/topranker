import { sendEmail } from "./email";
import { log } from "./logger";

/**
 * Restaurant owner outreach email templates
 * Used for business claim invitations, Pro upgrades, and weekly digest reports.
 */

const outreachLog = log.tag("OwnerOutreach");

const BRAND_HEADER = `
<tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
  <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
</td></tr>`;

const BRAND_FOOTER = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker — Trust-weighted rankings<br>
    <a href="https://topranker.com/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;

/** Template names for tracking in drip/outreach scheduler */
export const OWNER_OUTREACH_TEMPLATES = [
  "owner_claim_invite",
  "owner_pro_upgrade",
  "owner_weekly_digest",
] as const;

/**
 * Invite a restaurant owner to claim their business on TopRanker.
 * Sent when a business reaches a rank threshold or receives significant ratings.
 */
export async function sendOwnerClaimInviteEmail(params: {
  email: string;
  businessName: string;
  city: string;
  currentRank: number;
}): Promise<void> {
  const { email, businessName, city, currentRank } = params;
  outreachLog.info(`Sending claim invite: ${email} | ${businessName}`);

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">${businessName} is ranked #${currentRank} in ${city}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Your restaurant is being talked about on TopRanker — the platform where rankings are powered by trust-weighted community votes, not ads or paid placements.</p>
    <div style="background:#F7F6F3;border-radius:10px;padding:14px;margin:16px 0;">
      <p style="margin:0;color:#0D1B2A;font-size:13px;"><strong style="color:#C49A1A;">Current Rank:</strong> #${currentRank} in ${city}</p>
      <p style="margin:4px 0 0;color:#888;font-size:12px;">Based on credibility-weighted community ratings</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.5;">Claiming your business is <strong>completely free</strong> and gives you access to:</p>
    <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
      <li>See how customers rate your restaurant</li>
      <li>View basic analytics and rating trends</li>
      <li>Respond to community ratings</li>
      <li>Display a verified owner badge</li>
    </ul>
    <a href="https://topranker.com/claim" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Claim Your Business</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  const text = `${businessName} is ranked #${currentRank} in ${city} on TopRanker.

TopRanker uses trust-weighted community votes — not ads or paid placements — to rank restaurants.

Claiming your business is free and gives you access to:
- See how customers rate your restaurant
- View basic analytics and rating trends
- Respond to community ratings
- Display a verified owner badge

Claim your business: https://topranker.com/claim

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `${businessName} is ranked #${currentRank} on TopRanker`,
    html,
    text,
  });
}

/**
 * Encourage a claimed business owner to upgrade to Business Pro ($49/mo).
 * Sent after the owner has been active for a period and has accumulated ratings.
 */
export async function sendOwnerProUpgradeEmail(params: {
  email: string;
  businessName: string;
  ownerName: string;
  totalRatings: number;
  weightedScore: number;
}): Promise<void> {
  const { email, businessName, ownerName, totalRatings, weightedScore } = params;
  const firstName = ownerName.split(" ")[0];
  outreachLog.info(`Sending Pro upgrade: ${email} | ${businessName}`);

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Unlock ${businessName}'s full analytics</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${firstName}, ${businessName} has ${totalRatings} ratings with a weighted score of ${weightedScore.toFixed(1)}. Upgrade to Business Pro to get deeper insights and grow your ranking.</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${totalRatings}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Total Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${weightedScore.toFixed(1)}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Weighted Score</p>
        </td>
      </tr>
    </table>
    <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Business Pro — $49/mo</p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#0D1B2A;font-size:14px;line-height:1.8;">
        <li>Rating trends and historical analytics</li>
        <li>Competitor insights and benchmarking</li>
        <li>Featured placement in search results</li>
        <li>Priority support from the TopRanker team</li>
      </ul>
    </div>
    <a href="https://topranker.com/business-pro" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Upgrade to Pro</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  const text = `Hi ${firstName},

${businessName} has ${totalRatings} ratings with a weighted score of ${weightedScore.toFixed(1)}.

Upgrade to Business Pro ($49/mo) to unlock:
- Rating trends and historical analytics
- Competitor insights and benchmarking
- Featured placement in search results
- Priority support from the TopRanker team

Upgrade now: https://topranker.com/business-pro

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `Unlock ${businessName}'s full analytics`,
    html,
    text,
  });
}

/**
 * Weekly digest for claimed business owners showing key metrics.
 * Sent every Monday morning to active business owners.
 */
export async function sendOwnerWeeklyDigestEmail(params: {
  email: string;
  businessName: string;
  ownerName: string;
  city: string;
  weeklyViews: number;
  weeklyRatings: number;
  rankChange: number;
}): Promise<void> {
  const { email, businessName, ownerName, city, weeklyViews, weeklyRatings, rankChange } = params;
  const firstName = ownerName.split(" ")[0];
  outreachLog.info(`Sending weekly digest: ${email} | ${businessName}`);

  const rankChangeText = rankChange > 0
    ? `<span style="color:#22c55e;font-weight:700;">+${rankChange}</span>`
    : rankChange < 0
      ? `<span style="color:#ef4444;font-weight:700;">${rankChange}</span>`
      : `<span style="color:#888;font-weight:700;">—</span>`;

  const rankChangePlain = rankChange > 0
    ? `+${rankChange}`
    : rankChange < 0
      ? `${rankChange}`
      : "No change";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">${businessName} weekly report</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${firstName}, here's how ${businessName} performed in ${city} this week:</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${weeklyViews.toLocaleString()}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Views</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${weeklyRatings}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">New Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;font-size:28px;">${rankChangeText}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Rank Change</p>
        </td>
      </tr>
    </table>
    <a href="https://topranker.com/dashboard" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">View Full Dashboard</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  const text = `${businessName} weekly report

Hi ${firstName}, here's how ${businessName} performed in ${city} this week:

- Views: ${weeklyViews.toLocaleString()}
- New Ratings: ${weeklyRatings}
- Rank Change: ${rankChangePlain}

View your full dashboard: https://topranker.com/dashboard

— The TopRanker Team`;

  await sendEmail({
    to: email,
    subject: `${businessName} weekly report`,
    html,
    text,
  });
}
