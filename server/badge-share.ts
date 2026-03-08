/**
 * Badge Share-by-Link — Server-rendered OG meta for badge social previews
 * Owner: Marcus Chen (CTO) + Sage (Backend)
 *
 * GET /share/badge/:badgeId?user=username
 * Returns an HTML page with OG meta tags for rich link previews.
 * Social platforms (iMessage, Twitter, Slack) render the preview card.
 */
import type { Request, Response } from "express";

// All 61 badge metadata — server-side lookup for OG previews.
// Duplicated from lib/badges.ts to avoid importing React Native modules on the server.
const BADGE_META: Record<string, { name: string; description: string; rarity: string; color: string; icon: string }> = {
  // User Milestone Badges
  "first-taste":       { name: "First Taste", description: "Submit your very first rating", rarity: "common", color: "#FFD700", icon: "star" },
  "getting-started":   { name: "Getting Started", description: "Rate 5 businesses", rarity: "common", color: "#FF6B35", icon: "flame" },
  "ten-strong":        { name: "Ten Strong", description: "Rate 10 businesses", rarity: "common", color: "#4CAF50", icon: "ribbon" },
  "quarter-century":   { name: "Quarter Century", description: "Rate 25 businesses", rarity: "rare", color: "#2196F3", icon: "medal" },
  "half-century":      { name: "Half Century", description: "Rate 50 businesses", rarity: "rare", color: "#7C4DFF", icon: "trophy" },
  "centurion":         { name: "Centurion", description: "Rate 100 businesses", rarity: "epic", color: "#9C27B0", icon: "shield-checkmark" },
  "rating-machine":    { name: "Rating Machine", description: "Rate 250 businesses", rarity: "epic", color: "#E040FB", icon: "flash" },
  "legendary-judge":   { name: "Legendary Judge", description: "Rate 500 businesses", rarity: "legendary", color: "#C49A1A", icon: "diamond" },
  // User Streak Badges
  "three-day-streak":  { name: "On a Roll", description: "Rate on 3 consecutive days", rarity: "common", color: "#FF7043", icon: "flame-outline" },
  "week-warrior":      { name: "Week Warrior", description: "Rate on 7 consecutive days", rarity: "rare", color: "#FF5722", icon: "flame" },
  "two-week-streak":   { name: "Unstoppable", description: "Rate on 14 consecutive days", rarity: "epic", color: "#FF3D00", icon: "bonfire" },
  "monthly-devotion":  { name: "Monthly Devotion", description: "Rate on 30 consecutive days", rarity: "legendary", color: "#DD2C00", icon: "infinite" },
  // User Explorer Badges
  "curious-palate":    { name: "Curious Palate", description: "Rate in 3 different categories", rarity: "common", color: "#26A69A", icon: "compass" },
  "category-hopper":   { name: "Category Hopper", description: "Rate in 5 different categories", rarity: "rare", color: "#00897B", icon: "map" },
  "master-explorer":   { name: "Master Explorer", description: "Rate in 10 different categories", rarity: "epic", color: "#006064", icon: "earth" },
  "city-hopper":       { name: "City Hopper", description: "Rate businesses in 2 different cities", rarity: "rare", color: "#5C6BC0", icon: "airplane" },
  "texas-tour":        { name: "Texas Tour", description: "Rate businesses in 4 Texas cities", rarity: "legendary", color: "#C49A1A", icon: "flag" },
  "night-owl":         { name: "Night Owl", description: "Submit a rating after midnight", rarity: "rare", color: "#3F51B5", icon: "moon" },
  "early-bird":        { name: "Early Bird", description: "Submit a rating before 7 AM", rarity: "rare", color: "#FFC107", icon: "sunny" },
  // User Social Badges
  "first-referral":    { name: "Connector", description: "Invite a friend who creates an account", rarity: "rare", color: "#29B6F6", icon: "people" },
  "squad-builder":     { name: "Squad Builder", description: "Invite 5 friends who join TopRanker", rarity: "epic", color: "#0288D1", icon: "people-circle" },
  "community-leader":  { name: "Community Leader", description: "Invite 25 friends who join TopRanker", rarity: "legendary", color: "#C49A1A", icon: "megaphone" },
  "helpful-voice":     { name: "Helpful Voice", description: "5 of your ratings marked as helpful", rarity: "rare", color: "#66BB6A", icon: "thumbs-up" },
  "influencer":        { name: "Influencer", description: "25 of your ratings marked as helpful", rarity: "epic", color: "#43A047", icon: "hand-left" },
  // User Tier Badges
  "tier-city":         { name: "City Regular", description: "Reach the Regular tier (100+ credibility)", rarity: "rare", color: "#6B6B6B", icon: "star" },
  "tier-trusted":      { name: "Trusted Judge", description: "Reach the Trusted tier (300+ credibility)", rarity: "epic", color: "#C49A1A", icon: "shield-checkmark" },
  "tier-top":          { name: "Top Judge", description: "Reach the Top Judge tier (600+ credibility)", rarity: "legendary", color: "#C49A1A", icon: "trophy" },
  // User Special Badges
  "founding-member":   { name: "Founding Member", description: "Joined TopRanker in its first year", rarity: "legendary", color: "#C49A1A", icon: "sparkles" },
  "perfect-score":     { name: "Perfect 5", description: "Give a perfect 5.0 rating", rarity: "common", color: "#E91E63", icon: "heart" },
  "tough-critic":      { name: "Tough Critic", description: "Give a rating of 1.0", rarity: "rare", color: "#F44336", icon: "alert-circle" },
  "impact-maker":      { name: "Impact Maker", description: "Your rating moves a business up in rankings", rarity: "rare", color: "#4CAF50", icon: "trending-up" },
  "king-maker":        { name: "King Maker", description: "Your rating moves a business to #1", rarity: "legendary", color: "#C49A1A", icon: "podium" },
  // User Seasonal Badges
  "spring-explorer":   { name: "Spring Explorer", description: "Rate 5 businesses in March, April, or May", rarity: "rare", color: "#66BB6A", icon: "flower" },
  "summer-heat":       { name: "Summer Heat", description: "Rate 5 businesses in June, July, or August", rarity: "rare", color: "#FF9800", icon: "sunny" },
  "fall-harvest":      { name: "Fall Harvest", description: "Rate 5 businesses in September, October, or November", rarity: "rare", color: "#BF360C", icon: "leaf" },
  "winter-chill":      { name: "Winter Chill", description: "Rate 5 businesses in December, January, or February", rarity: "rare", color: "#42A5F5", icon: "snow" },
  "year-round":        { name: "Year-Round Rater", description: "Earn all 4 seasonal badges", rarity: "legendary", color: "#C49A1A", icon: "earth" },
  // Business Milestone Badges
  "biz-first-rating":  { name: "On the Map", description: "Receive the first rating", rarity: "common", color: "#4CAF50", icon: "location" },
  "biz-10-ratings":    { name: "Getting Noticed", description: "Receive 10 ratings", rarity: "common", color: "#42A5F5", icon: "eye" },
  "biz-25-ratings":    { name: "Local Favorite", description: "Receive 25 ratings", rarity: "rare", color: "#EF5350", icon: "heart-circle" },
  "biz-50-ratings":    { name: "Community Choice", description: "Receive 50 ratings", rarity: "rare", color: "#AB47BC", icon: "people" },
  "biz-100-ratings":   { name: "City Icon", description: "Receive 100 ratings", rarity: "epic", color: "#C49A1A", icon: "star" },
  "biz-250-ratings":   { name: "Legendary Spot", description: "Receive 250 ratings", rarity: "legendary", color: "#C49A1A", icon: "diamond" },
  "biz-top-10":        { name: "Top 10", description: "Reach top 10 in your city's category", rarity: "rare", color: "#7C4DFF", icon: "trending-up" },
  "biz-top-3":         { name: "Podium Finish", description: "Reach top 3 in your city's category", rarity: "epic", color: "#C49A1A", icon: "podium" },
  "biz-number-one":    { name: "Number One", description: "Reach #1 in your city's category", rarity: "legendary", color: "#FFD700", icon: "trophy" },
  "biz-high-rated":    { name: "Highly Rated", description: "Maintain an average score above 4.0", rarity: "rare", color: "#66BB6A", icon: "thumbs-up" },
  "biz-exceptional":   { name: "Exceptional", description: "Maintain an average score above 4.5", rarity: "epic", color: "#FFC107", icon: "sparkles" },
  "biz-perfect-rep":   { name: "Perfect Reputation", description: "Average score of 4.8+ with 25+ ratings", rarity: "legendary", color: "#C49A1A", icon: "ribbon" },
  "biz-steady-climber": { name: "Steady Climber", description: "Improve ranking for 3 consecutive weeks", rarity: "rare", color: "#26A69A", icon: "arrow-up-circle" },
  "biz-unstoppable-rise": { name: "Unstoppable Rise", description: "Improve ranking for 8 consecutive weeks", rarity: "epic", color: "#FF7043", icon: "rocket" },
  "biz-trusted-approved": { name: "Trusted Approved", description: "Receive 5+ ratings from Trusted tier judges", rarity: "epic", color: "#C49A1A", icon: "shield-checkmark" },
  "biz-top-judge-pick": { name: "Top Judge's Pick", description: "Rated 4.0+ by 3 Top Judge tier members", rarity: "legendary", color: "#C49A1A", icon: "medal" },
  "biz-challenger-winner": { name: "Challenger Champion", description: "Win a challenger battle", rarity: "epic", color: "#FF6F00", icon: "flash" },
  "biz-new-entry":     { name: "New Entry", description: "Just added to TopRanker", rarity: "common", color: "#29B6F6", icon: "sparkles" },
  "biz-verified":      { name: "Verified Business", description: "Business ownership verified by TopRanker", rarity: "rare", color: "#2196F3", icon: "checkmark-circle" },
};

const RARITY_COLORS: Record<string, string> = {
  common: "#8E8E93",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#C49A1A",
};

function generateBadgeHtml(badgeId: string, username: string | null): string {
  const badge = BADGE_META[badgeId];
  const title = badge
    ? `${badge.name} — TopRanker Badge`
    : "TopRanker Badge";
  const description = badge
    ? `${username ? `@${username} earned` : "Earned"} "${badge.name}" — ${badge.description}`
    : "Check out this TopRanker achievement badge!";
  const rarityColor = badge ? (RARITY_COLORS[badge.rarity] || "#C49A1A") : "#C49A1A";

  // SVG-based OG image rendered inline as a data URI
  const svgImage = badge ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#0D1B2A"/>
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#1A2D44"/>
      <circle cx="600" cy="240" r="80" fill="none" stroke="${rarityColor}" stroke-width="6"/>
      <text x="600" y="256" text-anchor="middle" fill="${rarityColor}" font-size="64">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</text>
      <text x="600" y="380" text-anchor="middle" fill="#FFFFFF" font-size="36" font-weight="bold">${badge.name}</text>
      <text x="600" y="420" text-anchor="middle" fill="#8E8E93" font-size="20">${badge.description}</text>
      <rect x="520" y="445" width="160" height="28" rx="14" fill="${rarityColor}22"/>
      <text x="600" y="465" text-anchor="middle" fill="${rarityColor}" font-size="14" font-weight="bold">${badge.rarity.toUpperCase()}</text>
      ${username ? `<text x="600" y="520" text-anchor="middle" fill="#C49A1A" font-size="18">@${username}</text>` : ""}
      <text x="600" y="560" text-anchor="middle" fill="#636366" font-size="14">TopRanker — Where your rankings matter.</text>
    </svg>
  `.trim() : "";

  const ogImageDataUri = badge
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  ${ogImageDataUri ? `<meta property="og:image" content="${ogImageDataUri}">` : ""}
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0D1B2A; color: #fff; font-family: -apple-system, system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1A2D44; border-radius: 24px; padding: 48px; text-align: center; max-width: 400px; }
    .badge-ring { width: 120px; height: 120px; border-radius: 60px; border: 4px solid ${rarityColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 48px; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .desc { color: #8E8E93; font-size: 16px; margin-bottom: 16px; }
    .rarity { display: inline-block; background: ${rarityColor}22; color: ${rarityColor}; font-size: 12px; font-weight: 800; padding: 4px 16px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .user { color: #C49A1A; margin-top: 16px; font-size: 16px; }
    .tagline { color: #636366; font-size: 13px; margin-top: 24px; }
    .cta { display: inline-block; margin-top: 20px; background: #C49A1A; color: #0D1B2A; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    ${badge ? `
      <div class="badge-ring">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</div>
      <h1>${badge.name}</h1>
      <p class="desc">${badge.description}</p>
      <span class="rarity">${badge.rarity}</span>
      ${username ? `<p class="user">Earned by @${username}</p>` : ""}
    ` : `
      <h1>Badge Not Found</h1>
      <p class="desc">This badge doesn't exist or the link is invalid.</p>
    `}
    <p class="tagline">TopRanker — Where your rankings matter.</p>
    <a href="/" class="cta">Open TopRanker</a>
  </div>
</body>
</html>`;
}

export function handleBadgeShare(req: Request, res: Response) {
  const badgeId = req.params.badgeId as string;
  const username = (req.query.user as string) || null;

  const html = generateBadgeHtml(badgeId, username);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(html);
}
