#!/usr/bin/env node
/**
 * Generate rich PNG favicons from the SVG brand mark at multiple sizes.
 * Uses sharp for SVG → PNG conversion.
 *
 * Usage: node scripts/generate-favicons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "..", "assets", "images");
const SVG_PATH = path.join(ASSETS, "favicon.svg");

const SIZES = [
  { name: "favicon.png", size: 48 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-192.png", size: 192 },
  { name: "favicon-512.png", size: 512 },
  { name: "splash-icon.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function generate() {
  const svgBuffer = fs.readFileSync(SVG_PATH);
  console.log("Generating favicons from SVG...\n");

  for (const { name, size } of SIZES) {
    const outPath = path.join(ASSETS, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath);
    const stats = fs.statSync(outPath);
    console.log(`  ${name} (${size}x${size}) — ${(stats.size / 1024).toFixed(1)}KB`);
  }

  console.log("\nDone! All favicons generated.");
}

generate().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
