import { log } from "./logger";
import { sendEmail as sendEmailReal } from "./email";
import { config } from "./config";

const dripLog = log.tag("EmailDrip");

/**
 * Email drip sequence for TopRanker
 * Automated engagement emails sent at key moments after signup
 *
 * Day 0: Welcome email (handled by sendWelcomeEmail)
 * Day 2: "Top 5 in your neighborhood"
 * Day 3: "You can rate now!" (rating unlock)
 * Day 7: "Your first week stats"
 * Day 14: "Join a Challenger — see your impact"
 * Day 30: "Your first month on TopRanker"
 *
 * Sprint 222: Wired to real email sender + scheduler
 */

interface DripEmailParams {
  email: string;
  displayName: string;
  city: string;
  username: string;
}

/** Sprint 222: Wire to real email sender */
async function sendEmail(to: string, subject: string, html: string, text: string) {
  dripLog.info(`Sending drip: ${to} | ${subject}`);
  await sendEmailReal({ to, subject, html, text });
}

/** Sprint 222: Drip schedule definition */
export interface DripStep {
  day: number;
  name: string;
  send: (params: DripEmailParams & Record<string, unknown>) => Promise<void>;
}

export const DRIP_SEQUENCE: DripStep[] = [
  { day: 2, name: "top_5_neighborhood", send: sendDay2Email },
  { day: 3, name: "rating_unlock", send: sendDay3Email },
  { day: 7, name: "first_week_stats", send: sendDay7Email as DripStep["send"] },
  { day: 14, name: "challenger_intro", send: sendDay14Email },
  { day: 30, name: "first_month_recap", send: sendDay30Email as DripStep["send"] },
];

/** Get the drip step due for a given number of days since signup */
export function getDripStepForDay(daysSinceSignup: number): DripStep | undefined {
  return DRIP_SEQUENCE.find((s) => s.day === daysSinceSignup);
}

/** Get all drip step names */
export function getDripStepNames(): string[] {
  return DRIP_SEQUENCE.map((s) => s.name);
}

const BRAND_HEADER = `
<tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
  <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
</td></tr>`;

const BRAND_FOOTER = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker — Trust-weighted rankings<br>
    <a href="${config.siteUrl}/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;

export async function sendDay2Email(params: DripEmailParams) {
  const { email, displayName, city } = params;
  const firstName = displayName.split(" ")[0];

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Top 5 near you, ${firstName}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">You've been exploring ${city}'s rankings for 2 days now. Have you checked out the top spots in your neighborhood?</p>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">See ${city}'s Top 5</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  await sendEmail(email, `Top 5 near you, ${firstName}`, html, `Top 5 restaurants near you in ${city}. Open TopRanker to explore.`);
}

export async function sendDay3Email(params: DripEmailParams) {
  const { email, displayName } = params;
  const firstName = displayName.split(" ")[0];

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Your voice is unlocked! 🎉</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, you've earned the right to rate businesses on TopRanker. Your ratings start at 0.10x weight — the more you rate, the more your voice matters.</p>
    <div style="background:#F7F6F3;border-radius:10px;padding:14px;margin:16px 0;">
      <p style="margin:0;color:#0D1B2A;font-size:13px;"><strong style="color:#C49A1A;">Your tier:</strong> New Member (0.10x)</p>
      <p style="margin:4px 0 0;color:#888;font-size:12px;">Rate 10+ businesses to reach Regular (0.35x)</p>
    </div>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Rate Your First Restaurant</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  await sendEmail(email, `Your voice is unlocked, ${firstName}!`, html, `You can now rate businesses on TopRanker. Your voice matters.`);
}

export async function sendDay7Email(params: DripEmailParams & { ratingsCount: number; businessesRated: number }) {
  const { email, displayName, city, ratingsCount, businessesRated } = params;
  const firstName = displayName.split(" ")[0];

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Your first week on TopRanker</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Here's what you accomplished in ${city}:</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${ratingsCount}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${businessesRated}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Businesses</p>
        </td>
      </tr>
    </table>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Keep Rating</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  await sendEmail(email, `Your first week, ${firstName}`, html, `Your first week: ${ratingsCount} ratings, ${businessesRated} businesses.`);
}

export async function sendDay14Email(params: DripEmailParams) {
  const { email, displayName, city } = params;
  const firstName = displayName.split(" ")[0];

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Live challenges in ${city} ⚡</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, the Challenger tab has live head-to-head competitions. Your weighted vote can decide which restaurant claims the #1 spot.</p>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Vote in Live Challenges</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  await sendEmail(email, `Live challenges in ${city}`, html, `See live head-to-head challenges in ${city}. Your vote matters.`);
}

export async function sendDay30Email(params: DripEmailParams & { totalRatings: number; currentTier: string; credibilityScore: number }) {
  const { email, displayName, city, totalRatings, currentTier, credibilityScore } = params;
  const firstName = displayName.split(" ")[0];

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">One month on TopRanker 🎉</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, you've been shaping ${city}'s rankings for 30 days. Here's your impact:</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${totalRatings}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Total Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${currentTier}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Tier</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${credibilityScore}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Cred Score</p>
        </td>
      </tr>
    </table>
    <p style="color:#555;font-size:13px;text-align:center;">Thank you for being part of the trust movement.</p>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:12px;">View Your Profile</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;

  await sendEmail(email, `Your first month, ${firstName}!`, html, `One month on TopRanker: ${totalRatings} ratings, ${currentTier} tier, ${credibilityScore} cred score.`);
}
