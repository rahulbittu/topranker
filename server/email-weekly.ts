import { log } from "./logger";
import { config } from "./config";

const digestLog = log.tag("WeeklyDigest");

/**
 * Weekly Email Digest — TopRanker
 *
 * Sent every Monday to active users.
 * Personalized with their city, rating stats, ranking changes, and live challengers.
 *
 * Pluggable delivery: console log in dev, Resend/SendGrid in production.
 */

import { sendEmail } from "./email";

interface WeeklyDigestData {
  email: string;
  displayName: string;
  city: string;
  ratingsThisWeek: number;
  totalRatings: number;
  credibilityTier: string;
  tierProgress: number; // 0-100
  topMovers: Array<{
    name: string;
    category: string;
    direction: "up" | "down";
    positions: number;
  }>;
  activeChallenges: Array<{
    defender: string;
    challenger: string;
    category: string;
    daysLeft: number;
    defenderPct: number;
  }>;
  newBusinesses: Array<{
    name: string;
    category: string;
  }>;
}

function generateDigestHtml(data: WeeklyDigestData): string {
  const { displayName, city, ratingsThisWeek, totalRatings, credibilityTier, tierProgress } = data;

  const tierColors: Record<string, string> = {
    community: "#9E9E9E",
    city: "#2196F3",
    trusted: "#4CAF50",
    top: "#C49A1A",
  };
  const tierColor = tierColors[credibilityTier] || "#9E9E9E";

  const moverRows = data.topMovers
    .slice(0, 5)
    .map(
      (m) =>
        `<tr>
          <td style="padding:8px 12px;font-size:14px;color:#333;font-family:'DM Sans',Arial,sans-serif;">
            ${m.direction === "up" ? "&#9650;" : "&#9660;"}
            <span style="color:${m.direction === "up" ? "#4CAF50" : "#E53935"};font-weight:700;">
              ${m.positions}
            </span>
            &nbsp;${m.name}
          </td>
          <td style="padding:8px 12px;font-size:12px;color:#888;font-family:'DM Sans',Arial,sans-serif;">
            ${m.category}
          </td>
        </tr>`,
    )
    .join("");

  const challengeRows = data.activeChallenges
    .slice(0, 3)
    .map(
      (c) =>
        `<div style="padding:12px;margin-bottom:8px;background:#f8f8f5;border-radius:8px;">
          <div style="font-size:14px;font-weight:700;color:#0D1B2A;font-family:'DM Sans',Arial,sans-serif;">
            ${c.defender} vs ${c.challenger}
          </div>
          <div style="font-size:12px;color:#888;margin-top:2px;font-family:'DM Sans',Arial,sans-serif;">
            ${c.category} &middot; ${c.daysLeft} days left &middot; ${c.defenderPct}% - ${100 - c.defenderPct}%
          </div>
        </div>`,
    )
    .join("");

  const newBizRows = data.newBusinesses
    .slice(0, 3)
    .map(
      (b) =>
        `<div style="padding:6px 0;font-size:14px;color:#333;font-family:'DM Sans',Arial,sans-serif;">
          &#x2022; ${b.name} <span style="color:#888;font-size:12px;">(${b.category})</span>
        </div>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:#0D1B2A;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <div style="font-size:12px;font-weight:900;color:#C49A1A;letter-spacing:4px;margin-bottom:4px;">TOPRANKER</div>
      <div style="font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif;">Weekly Digest</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px;">${city}</div>
    </div>

    <!-- Personal Stats -->
    <div style="background:#fff;padding:24px;border-bottom:1px solid #eee;">
      <div style="font-size:16px;font-weight:700;color:#0D1B2A;margin-bottom:16px;">
        Hey ${displayName} 👋
      </div>
      <div style="display:flex;gap:16px;">
        <div style="flex:1;text-align:center;padding:12px;background:#f8f8f5;border-radius:8px;">
          <div style="font-size:24px;font-weight:800;color:#C49A1A;">${ratingsThisWeek}</div>
          <div style="font-size:11px;color:#888;">ratings this week</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;background:#f8f8f5;border-radius:8px;">
          <div style="font-size:24px;font-weight:800;color:#0D1B2A;">${totalRatings}</div>
          <div style="font-size:11px;color:#888;">total ratings</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;background:#f8f8f5;border-radius:8px;">
          <div style="font-size:14px;font-weight:700;color:${tierColor};text-transform:uppercase;">${credibilityTier}</div>
          <div style="font-size:11px;color:#888;">your tier</div>
          <div style="margin-top:4px;background:#e0e0e0;border-radius:4px;height:4px;overflow:hidden;">
            <div style="width:${tierProgress}%;height:100%;background:${tierColor};border-radius:4px;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Movers -->
    ${moverRows ? `
    <div style="background:#fff;padding:24px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#0D1B2A;margin-bottom:12px;">
        📊 Biggest Ranking Moves
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${moverRows}
      </table>
    </div>
    ` : ""}

    <!-- Active Challenges -->
    ${challengeRows ? `
    <div style="background:#fff;padding:24px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#0D1B2A;margin-bottom:12px;">
        ⚡ Live Challenges
      </div>
      ${challengeRows}
    </div>
    ` : ""}

    <!-- New Businesses -->
    ${newBizRows ? `
    <div style="background:#fff;padding:24px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#0D1B2A;margin-bottom:12px;">
        🆕 New on TopRanker
      </div>
      ${newBizRows}
    </div>
    ` : ""}

    <!-- CTA -->
    <div style="background:#fff;padding:24px;text-align:center;border-radius:0 0 12px 12px;">
      <a href="${config.siteUrl}" style="display:inline-block;background:#C49A1A;color:#fff;text-decoration:none;padding:14px 32px;border-radius:24px;font-size:14px;font-weight:700;">
        Open TopRanker
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;font-size:11px;color:#aaa;">
      <div>TopRanker Inc. &middot; Dallas, TX</div>
      <div style="margin-top:8px;">
        <a href="${config.siteUrl}/settings" style="color:#aaa;text-decoration:underline;">Manage preferences</a>
        &nbsp;&middot;&nbsp;
        <a href="${config.siteUrl}/unsubscribe" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send the weekly digest email to a user.
 */
export async function sendWeeklyDigest(data: WeeklyDigestData): Promise<void> {
  const html = generateDigestHtml(data);

  await sendEmail({
    to: data.email,
    subject: `📊 Your Week on TopRanker — ${data.city}`,
    html,
  });
}

/**
 * Generate and send weekly digests for all active users.
 * Called by a cron job every Monday at 9 AM local time.
 */
export async function sendAllWeeklyDigests(
  getActiveUsers: () => Promise<WeeklyDigestData[]>,
): Promise<{ sent: number; failed: number }> {
  const users = await getActiveUsers();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await sendWeeklyDigest(user);
      sent++;
    } catch (err) {
      digestLog.error(`Failed for ${user.email}:`, err);
      failed++;
    }
  }

  digestLog.info(`Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}
