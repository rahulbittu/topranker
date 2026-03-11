import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

import { log as logger } from "./logger";
import { securityHeaders } from "./security-headers";
import { apiRateLimiter } from "./rate-limiter";
import { perfMonitor } from "./perf-monitor";
import { initErrorTracking } from "./error-tracking";
import { cacheHeaders } from "./cache-headers";
import { setFlushHandler } from "./analytics";

const app = express();
const log = console.log;

// Sprint 191: Initialize error tracking early
initErrorTracking();

// Sprint 201: Connect analytics flush to PostgreSQL
(async () => {
  try {
    const { persistAnalyticsEvents } = await import("./storage/analytics");
    setFlushHandler(persistAnalyticsEvents, 30_000); // Flush every 30s
  } catch {
    // DB not available — analytics stays in-memory only
  }
})();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupBodyParsing(app: express.Application) {
  // Stripe webhooks need raw body with a higher size limit
  app.use(
    "/api/webhooks",
    express.raw({ type: "application/json", limit: "5mb" }),
  );

  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  const isProduction = process.env.NODE_ENV === "production";

  log("Serving static Expo files with dynamic manifest routing");

  app.get("/_health", (_req: Request, res: Response) => {
    res.status(200).send("ok");
  });

  // Temporary debug endpoint — remove after deploy fix
  app.get("/_debug-dist", (_req: Request, res: Response) => {
    const cwd = process.cwd();
    const distDir = path.resolve(cwd, "dist");
    const backupDir = path.resolve(cwd, "dist-web-backup");
    const info: Record<string, unknown> = { cwd };
    try { info.distFiles = fs.readdirSync(distDir); } catch { info.distFiles = "NOT FOUND"; }
    try { info.distJsFiles = fs.readdirSync(path.join(distDir, "_expo/static/js/web")); } catch { info.distJsFiles = "NOT FOUND"; }
    try { info.backupFiles = fs.readdirSync(backupDir); } catch { info.backupFiles = "NOT FOUND"; }
    try { info.distHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8").match(/entry-[a-f0-9]+\.js/)?.[0]; } catch { info.distHtml = "NOT FOUND"; }
    res.json(info);
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build"), { index: false }));

  const distPath = path.resolve(process.cwd(), "dist");
  const distBackupPath = path.resolve(process.cwd(), "dist-web-backup");
  // Sprint 593: If dist-web-backup exists, copy it over dist to defeat build cache
  if (fs.existsSync(path.join(distBackupPath, "index.html"))) {
    try {
      fs.cpSync(distBackupPath, distPath, { recursive: true, force: true });
      log("Restored dist/ from dist-web-backup/");
    } catch (e) {
      log("Warning: could not restore dist from backup");
    }
  }
  const hasDistBuild = fs.existsSync(path.join(distPath, "index.html"));

  if (hasDistBuild) {
    app.use(express.static(distPath, {
      maxAge: isProduction ? "1d" : 0,
      index: false,
    }));
    log(`Serving static web build from ${distPath}`);
  }

  if (!isProduction) {
    const metroProxy = createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      ws: true,
      logger: undefined,
      on: {
        error: (_err, req, res) => {
          if (res && "writeHead" in res && !res.headersSent) {
            const httpReq = req as Request;
            const acceptsHtml = httpReq.headers?.accept?.includes("text/html");
            if (acceptsHtml) {
              (res as Response).status(200).type("html").send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e1a;color:#c8a951;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}.c{padding:20px}.spinner{width:40px;height:40px;border:3px solid #1a2040;border-top-color:#c8a951;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:20px;margin-bottom:8px}p{font-size:14px;color:#8890a8}</style></head><body><div class="c"><div class="spinner"></div><h1>${appName}</h1><p>Loading app...</p></div><script>setTimeout(()=>location.reload(),3000)</script></body></html>`);
            } else {
              (res as Response).status(503).set("Retry-After", "3").send("Metro bundler starting...");
            }
          }
        },
      },
    });

    // Bootstrap HTML for dev mode.
    // Key requirements for Replit preview:
    // 1. HTTP 200 with text/html — instant response before Metro is ready
    // 2. No <script defer> or <script src> in <head> — would block load event
    // 3. Dynamic createElement('script') — loads bundle without blocking load
    // 4. Visible content (branded loading screen) — Replit may check for rendered content
    // 5. The bundle URL must go through our Metro proxy on the same origin
    const webIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
<title>${appName}</title>
<style>
html,body{height:100%;margin:0;padding:0}
body{background:#0a0e1a;overflow:hidden}
#root{display:flex;height:100%;flex:1}
#_loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0e1a;z-index:9999;flex-direction:column;gap:16px}
#_loading .sp{width:36px;height:36px;border:3px solid #1a2040;border-top-color:#B8860B;border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
#_loading p{color:#B8860B;font-family:-apple-system,system-ui,sans-serif;font-size:15px;letter-spacing:2px;font-weight:600}
#_loading small{color:#8890a8;font-family:-apple-system,system-ui,sans-serif;font-size:11px}
</style>
</head>
<body>
<div id="_loading">
  <div class="sp"></div>
  <p>TOP RANKER</p>
  <small>Loading app... (v4)</small>
</div>
<div id="root"></div>
<script>
// Remove loading overlay when app renders or after timeout
window.__REMOVE_LOADING = function() {
  var el = document.getElementById('_loading');
  if (el) el.remove();
};
setTimeout(window.__REMOVE_LOADING, 30000);

// Load Metro bundle dynamically (doesn't block load event)
var s = document.createElement('script');
s.src = '/index.bundle?platform=web&dev=true&hot=true';
s.onerror = function() {
  // If simple URL fails, try Expo Router entry point
  var s2 = document.createElement('script');
  s2.src = '/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&transform.reactCompiler=true&unstable_transformProfile=hermes-stable';
  s2.onerror = function() {
    var el = document.getElementById('_loading');
    if (el) {
      var sm = el.querySelector('small');
      if (sm) sm.textContent = 'Waiting for bundler...';
    }
    setTimeout(function() { location.reload(); }, 5000);
  };
  document.body.appendChild(s2);
};
document.body.appendChild(s);
</script>
</body>
</html>`;

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
      }

      if (req.path === "/" || req.path === "/index.html") {
        log(`[DEV] Serving bootstrap HTML for ${req.path} (${webIndexHtml.length} bytes)`);
        return res.status(200).type("html").send(webIndexHtml);
      }

      return metroProxy(req, res, next);
    });

    log("Expo routing: Checking expo-platform header on / and /manifest");
    log("Metro proxy: Forwarding web requests to localhost:8081");
  } else {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
      }

      if (hasDistBuild) {
        return res.sendFile(path.join(distPath, "index.html"));
      }

      return serveLandingPage({ req, res, landingPageTemplate, appName });
    });

    log("Production mode: Serving static dist build (no Metro proxy)");
  }
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    logger.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  // Security headers middleware handles CORS + OWASP headers (must be first)
  app.use(securityHeaders);
  setupBodyParsing(app);
  app.use("/api", apiRateLimiter);
  app.use(cacheHeaders); // Sprint 194: HTTP cache headers for CDN
  app.use(perfMonitor);

  // X-Response-Time header — set before response is sent (Sprint 118)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      if (!res.headersSent) {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        res.setHeader("X-Response-Time", `${durationMs}ms`);
      }
      return (originalEnd as Function).apply(res, args);
    } as typeof res.end;
    next();
  });

  setupRequestLogging(app);

  // Sprint 180: SSR prerender middleware for bot traffic
  const { prerenderMiddleware } = await import("./prerender");
  app.use(prerenderMiddleware);

  const server = await registerRoutes(app);

  // Startup banner: count registered routes (Sprint 121)
  const routeCount = app._router?.stack
    ?.filter((layer: any) => layer.route)
    ?.length ?? 0;
  log(`[TopRanker] ${routeCount} routes registered`);

  configureExpoAndLanding(app);

  const { seedDatabase } = await import("./seed");
  seedDatabase().catch((err) => logger.error("Seed error:", err));

  // Sprint 593: Auto-import real Google Places data on startup (non-blocking)
  const { autoImportGooglePlaces } = await import("./google-places-import");
  autoImportGooglePlaces().catch((err) => logger.error("Google Places auto-import error:", err));

  // Challenger closure batch job — runs hourly (Sprint 161)
  const { closeExpiredChallenges } = await import("./storage/challengers");
  closeExpiredChallenges().catch((err) => logger.error("Initial challenger closure error:", err));
  const challengerInterval = setInterval(() => {
    closeExpiredChallenges().catch((err) => logger.error("Challenger closure error:", err));
  }, 60 * 60 * 1000); // Every hour

  // Dish leaderboard recalculation — runs every 6 hours (Sprint 169)
  const { recalculateDishLeaderboard } = await import("./storage/dishes");
  const { dishLeaderboards } = await import("@shared/schema");
  const { db: dishDb } = await import("./db");

  async function recalculateAllDishBoards() {
    try {
      const boards = await dishDb.select().from(dishLeaderboards);
      let totalEntries = 0;
      for (const board of boards) {
        const count = await recalculateDishLeaderboard(board.id);
        totalEntries += count;
      }
      logger.info(`Dish leaderboard recalculation: ${boards.length} boards, ${totalEntries} entries`);
    } catch (err) {
      logger.error("Dish leaderboard recalculation error:", err);
    }
  }

  recalculateAllDishBoards();
  const dishRecalcInterval = setInterval(recalculateAllDishBoards, 6 * 60 * 60 * 1000);

  // Sprint 587: Preload photo hash index from DB for duplicate detection
  const { preloadHashIndex } = await import("./photo-hash");
  preloadHashIndex().catch((err) => logger.error("Photo hash preload failed:", err));

  // Sprint 592: Preload perceptual hash index from DB for near-duplicate detection
  const { preloadPHashIndex } = await import("./phash");
  preloadPHashIndex().catch((err) => logger.error("PHash preload failed:", err));

  // Sprint 175: Weekly digest push notification scheduler
  const { startWeeklyDigestScheduler, startCityHighlightsScheduler } = await import("./notification-triggers");
  const weeklyDigestTimeout = startWeeklyDigestScheduler();

  // Sprint 488: Weekly city highlights push scheduler
  const cityHighlightsTimeout = startCityHighlightsScheduler();

  // Sprint 223: Drip email scheduler — daily at 9am UTC
  const { startDripScheduler } = await import("./drip-scheduler");
  const dripSchedulerTimeout = startDripScheduler();

  // Sprint 227: Owner outreach scheduler — weekly on Wednesdays
  const { startOutreachScheduler } = await import("./outreach-scheduler");
  const outreachSchedulerTimeout = startOutreachScheduler();

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log(`express server serving on port ${port} (0.0.0.0)`);
    },
  );

  // Graceful shutdown
  function gracefulShutdown(signal: string) {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    clearInterval(challengerInterval);
    clearInterval(dishRecalcInterval);
    clearTimeout(weeklyDigestTimeout);
    clearTimeout(cityHighlightsTimeout);
    clearTimeout(dripSchedulerTimeout);
    clearTimeout(outreachSchedulerTimeout);

    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
