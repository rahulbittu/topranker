#!/usr/bin/env node
/**
 * Comprehensive visual regression / smoke test for TopRanker.
 * Screenshots every page + state, captures all network errors.
 * Usage: node scripts/visual-test.mjs [base-url]
 */
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE =
  process.argv[2] ||
  "https://93e0244a-8147-4206-a20d-160c79b0b4d0-00-2myas8e46xzt0.spock.replit.dev";
const OUT = path.resolve("screenshots");
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });

  const failedRequests = [];
  const apiResponses = [];
  const consoleErrors = [];

  const page = await ctx.newPage();
  page.on("requestfailed", (req) => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/api/") || res.status() >= 400) {
      let body = "";
      try {
        body = await res.text();
      } catch {}
      apiResponses.push({ url, status: res.status(), body: body.slice(0, 300) });
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const snap = async (name, desc) => {
    const p = path.join(OUT, `${name}.png`);
    await page.screenshot({ path: p, fullPage: false });
    console.log(`  [OK] ${name} — ${desc}`);
  };

  // ===== 1. HOME / RANKINGS =====
  console.log("\n--- HOME / RANKINGS ---");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await snap("01-home", "Leaderboard top");

  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(1000);
  await snap("02-home-scrolled", "Leaderboard scrolled");

  // ===== 2. DISCOVER — LIST =====
  console.log("\n--- DISCOVER LIST ---");
  await page.goto(`${BASE}/search`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await snap("03-discover-list", "List view default");

  // ===== 3. DISCOVER — MAP =====
  console.log("\n--- DISCOVER MAP ---");
  const mapBtn = page.locator('text="Map"').first();
  if (await mapBtn.isVisible()) {
    await mapBtn.click();
    await page.waitForTimeout(5000);
  }
  await snap("04-discover-map", "Map view");

  const mapErrorInDOM = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const t = (el.textContent || "").trim();
      if (
        t.includes("didn't load Google Maps") ||
        t.includes("API key") ||
        t.includes("RefererNotAllowed") ||
        t.includes("authFailure")
      )
        return t.slice(0, 300);
    }
    return null;
  });
  if (mapErrorInDOM) console.log("  MAP DOM ERROR:", mapErrorInDOM);

  // ===== 4. DISCOVER — FILTERS =====
  console.log("\n--- DISCOVER FILTERS ---");
  const listBtn = page.locator('text="List"').first();
  if (await listBtn.isVisible()) await listBtn.click();
  await page.waitForTimeout(500);

  for (const filter of ["Top 10", "Challenging", "Trending", "Open Now"]) {
    const btn = page.locator(`text="${filter}"`).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1500);
      await snap(`05-filter-${filter.toLowerCase().replace(" ", "-")}`, `Filter: ${filter}`);
    }
  }

  // Reset to All
  const allBtn = page.locator('text="All"').first();
  if (await allBtn.isVisible()) await allBtn.click();
  await page.waitForTimeout(500);

  // ===== 5. DISCOVER — PRICE FILTERS =====
  console.log("\n--- PRICE FILTERS ---");
  for (const price of ["$", "$$", "$$$", "$$$$"]) {
    const btn = page.locator(`text="${price}"`).nth(0);
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1500);
      await snap(`06-price-${price.length}`, `Price: ${price}`);
      await btn.click(); // toggle off
      await page.waitForTimeout(300);
    }
  }

  // ===== 6. DISCOVER — SEARCH =====
  console.log("\n--- SEARCH ---");
  const searchInput = page.locator('input[placeholder*="Restaurants"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill("ramen");
    await page.waitForTimeout(2000);
    await snap("07-search-ramen", 'Search: "ramen"');

    await searchInput.fill("pizza");
    await page.waitForTimeout(2000);
    await snap("08-search-pizza", 'Search: "pizza"');

    await searchInput.fill("xyznonexistent");
    await page.waitForTimeout(2000);
    await snap("09-search-empty", "Search: no results");

    await searchInput.fill("");
    await page.waitForTimeout(1000);
  }

  // ===== 7. BUSINESS PROFILE =====
  console.log("\n--- BUSINESS PROFILE ---");
  await page.goto(`${BASE}/search`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  // Navigate to first business via API-driven slug
  const firstBizLink = page.locator('[accessibilityrole="button"]').first();
  if (await firstBizLink.isVisible()) {
    await firstBizLink.click();
    await page.waitForTimeout(3000);
    await snap("10-business-top", "Business profile top");

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    await snap("11-business-mid", "Business profile mid");

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);
    await snap("12-business-bottom", "Business profile bottom");
  }

  // ===== 8. CHALLENGER TAB =====
  console.log("\n--- CHALLENGER ---");
  await page.goto(`${BASE}/challenger`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await snap("13-challenger", "Challenger tab");

  // ===== 9. PROFILE TAB =====
  console.log("\n--- PROFILE ---");
  await page.goto(`${BASE}/profile`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await snap("14-profile", "Profile (logged out)");

  // ===== 10. CITY PICKER =====
  console.log("\n--- CITY PICKER ---");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  const cityBtn = page.locator('text="Dallas"').first();
  if (await cityBtn.isVisible()) {
    await cityBtn.click();
    await page.waitForTimeout(1000);
    await snap("15-city-picker", "City picker open");

    // Switch to Austin
    const austinBtn = page.locator('text="Austin"').first();
    if (await austinBtn.isVisible()) {
      await austinBtn.click();
      await page.waitForTimeout(2000);
      await snap("16-austin-rankings", "Austin rankings");
    }
  }

  // ===== 11. DISCOVER MAP + PIN CLICK =====
  console.log("\n--- MAP PIN INTERACTION ---");
  await page.goto(`${BASE}/search`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  const mapBtn2 = page.locator('text="Map"').first();
  if (await mapBtn2.isVisible()) {
    await mapBtn2.click();
    await page.waitForTimeout(5000);
    // Try clicking center of map area (where pins might be)
    const mapArea = page.locator("div").filter({ has: page.locator("canvas, .gm-style") }).first();
    if (await mapArea.isVisible()) {
      const box = await mapArea.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 3);
        await page.waitForTimeout(1500);
        await snap("17-map-pin-clicked", "Map with pin selected");
      }
    }
  }

  await browser.close();

  // ===== REPORT =====
  console.log("\n\n╔══════════════════════════════════════╗");
  console.log("║     FULL VISUAL TEST REPORT          ║");
  console.log("╚══════════════════════════════════════╝\n");

  const failed500 = apiResponses.filter((r) => r.status >= 500);
  const failed404 = apiResponses.filter((r) => r.status === 404);
  const failedAuth = apiResponses.filter((r) => r.status === 401 || r.status === 403);

  if (failed500.length > 0) {
    console.log(`\n🔴 SERVER ERRORS (500) — ${failed500.length} total:`);
    const patterns = new Map();
    failed500.forEach((r) => {
      const key = r.url
        .replace(/[a-f0-9-]{36}/g, "{uuid}")
        .replace(/\d{10,}/g, "{id}");
      if (!patterns.has(key))
        patterns.set(key, { sample: r.url, body: r.body, count: 0 });
      patterns.get(key).count++;
    });
    patterns.forEach((v, k) => {
      console.log(`  [${v.count}x] ${k}`);
      if (v.body) console.log(`         Response: ${v.body.slice(0, 200)}`);
    });
  }

  if (failed404.length > 0) {
    console.log(`\n🟡 NOT FOUND (404) — ${failed404.length} total:`);
    const patterns = new Map();
    failed404.forEach((r) => {
      const key = r.url
        .replace(/[a-f0-9-]{36}/g, "{uuid}")
        .replace(/\d{10,}/g, "{id}");
      if (!patterns.has(key))
        patterns.set(key, { sample: r.url, count: 0 });
      patterns.get(key).count++;
    });
    patterns.forEach((v, k) => console.log(`  [${v.count}x] ${k}`));
  }

  if (failedAuth.length > 0) {
    console.log(`\n🟠 AUTH ERRORS (401/403) — ${failedAuth.length} total:`);
    failedAuth.forEach((r) =>
      console.log(`  [${r.status}] ${r.url}`)
    );
  }

  const mapErrors = consoleErrors.filter(
    (e) =>
      e.includes("Google Maps") ||
      e.includes("RefererNotAllowed") ||
      e.includes("authFailure")
  );
  if (mapErrors.length > 0) {
    console.log(`\n🗺️  GOOGLE MAPS ERRORS:`);
    [...new Set(mapErrors)].forEach((e) => console.log(`  ${e}`));
  }

  if (failedRequests.length > 0) {
    console.log(`\n⚡ NETWORK FAILURES — ${failedRequests.length} total:`);
    const patterns = new Map();
    failedRequests.forEach((r) => {
      const key = r.url.replace(/[a-f0-9-]{36}/g, "{uuid}");
      if (!patterns.has(key))
        patterns.set(key, { failure: r.failure, count: 0 });
      patterns.get(key).count++;
    });
    patterns.forEach((v, k) =>
      console.log(`  [${v.count}x] ${v.failure} — ${k}`)
    );
  }

  const totalIssues =
    failed500.length + failed404.length + failedAuth.length + mapErrors.length;
  console.log(`\n────────────────────────────────────────`);
  console.log(
    `Total issues: ${totalIssues} | Screenshots: ${fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).length}`
  );
  console.log(`Screenshots in: ${OUT}/`);
  console.log(`────────────────────────────────────────\n`);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
