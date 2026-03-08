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

const app = express();
const log = console.log;

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
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  const distPath = path.resolve(process.cwd(), "dist");
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
        error: (_err, _req, res) => {
          if (res && "writeHead" in res && !res.headersSent) {
            (res as Response).status(503).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e1a;color:#c8a951;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}.c{padding:20px}.spinner{width:40px;height:40px;border:3px solid #1a2040;border-top-color:#c8a951;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:20px;margin-bottom:8px}p{font-size:14px;color:#8890a8}</style></head><body><div class="c"><div class="spinner"></div><h1>${appName}</h1><p>Loading app...</p></div><script>setTimeout(()=>location.reload(),3000)</script></body></html>`);
          }
        },
      },
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
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
  app.use(perfMonitor);

  // X-Response-Time header — measures request duration (Sprint 118)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    res.on("finish", () => {
      if (res.headersSent) return;
      const [seconds, nanoseconds] = process.hrtime(start);
      const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
      res.setHeader("X-Response-Time", `${durationMs}ms`);
    });
    next();
  });

  setupRequestLogging(app);

  const server = await registerRoutes(app);

  // Startup banner: count registered routes (Sprint 121)
  const routeCount = app._router?.stack
    ?.filter((layer: any) => layer.route)
    ?.length ?? 0;
  log(`[TopRanker] ${routeCount} routes registered`);

  configureExpoAndLanding(app);

  const { seedDatabase } = await import("./seed");
  seedDatabase().catch((err) => logger.error("Seed error:", err));

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );

  // Graceful shutdown
  function gracefulShutdown(signal: string) {
    logger.info(`${signal} received. Starting graceful shutdown...`);

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
