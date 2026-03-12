import { exec } from "child_process";
import * as crypto from "crypto";
import type { Request, Response } from "express";
import { log } from "./logger";
import { config } from "./config";

const deployLog = log.tag("Deploy");

interface DeployStatus {
  status: "idle" | "deploying" | "success" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  commit: string | null;
  error: string | null;
  log: string[];
}

let deployStatus: DeployStatus = {
  status: "idle",
  startedAt: null,
  completedAt: null,
  commit: null,
  error: null,
  log: [],
};

// Optional: set GITHUB_WEBHOOK_SECRET in env for signature verification
function verifySignature(req: Request): boolean {
  // Sprint 806: Centralized to config.ts
  const secret = config.githubWebhookSecret;
  if (!secret) return true; // skip verification if no secret configured

  const signature = req.header("x-hub-signature-256");
  if (!signature) return false;

  const body = req.rawBody as Buffer;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expected = `sha256=${hmac.digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function runCommand(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout: 300_000 }, (error, stdout, stderr) => {
      const output = (stdout || "") + (stderr || "");
      if (error) {
        reject(new Error(`${cmd} failed: ${output}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}

async function runDeploy() {
  const cwd = process.cwd();
  deployStatus = {
    status: "deploying",
    startedAt: new Date().toISOString(),
    completedAt: null,
    commit: null,
    error: null,
    log: [],
  };

  const addLog = (msg: string) => {
    deployLog.info(msg);
    deployStatus.log.push(`${new Date().toISOString()} ${msg}`);
  };

  try {
    // Step 1: Pull latest code (preserve .replit)
    addLog("Pulling latest from GitHub...");
    await runCommand("cp .replit .replit.bak 2>/dev/null || true", cwd);
    await runCommand("git checkout -- .replit 2>/dev/null || true", cwd);
    await runCommand("git pull origin main --ff-only", cwd);
    await runCommand("cp .replit.bak .replit 2>/dev/null || true", cwd);
    await runCommand("rm -f .replit.bak", cwd);
    addLog("Git pull complete.");

    // Get the current commit hash
    const commit = await runCommand("git rev-parse --short HEAD", cwd);
    deployStatus.commit = commit;
    addLog(`Now at commit: ${commit}`);

    // Step 2: Install dependencies
    addLog("Installing dependencies...");
    await runCommand(
      "npm install --legacy-peer-deps 2>/dev/null || npm install",
      cwd,
    );
    addLog("Dependencies installed.");

    // Step 3: Build Expo static bundle
    addLog("Building Expo static bundle...");
    await runCommand("npm run expo:static:build", cwd);
    addLog("Expo build complete.");

    // Step 4: Build server
    addLog("Building server...");
    await runCommand("npm run server:build", cwd);
    addLog("Server build complete.");

    deployStatus.status = "success";
    deployStatus.completedAt = new Date().toISOString();
    addLog("Deploy successful!");

    // Send push notification via ntfy.sh (free, no signup)
    sendNotification(
      `TopRanker deployed! Commit: ${commit}`,
      "Build successful - refresh to see changes.",
    );
  } catch (err: any) {
    deployStatus.status = "failed";
    deployStatus.completedAt = new Date().toISOString();
    deployStatus.error = err.message;
    addLog(`Deploy FAILED: ${err.message}`);

    sendNotification(
      "TopRanker deploy FAILED",
      err.message.slice(0, 200),
    );
  }
}

function sendNotification(title: string, message: string) {
  // Uses ntfy.sh — free push notifications, no signup needed
  // Subscribe on your phone: install ntfy app, subscribe to "topranker-deploy"
  // Sprint 806: Centralized to config.ts
  const topic = config.ntfyTopic;
  const url = `https://ntfy.sh/${topic}`;

  // Sprint 784: 5s timeout — notifications are fire-and-forget, don't block
  fetch(url, {
    method: "POST",
    headers: { Title: title },
    body: message,
    signal: AbortSignal.timeout(5000),
  }).catch((err) => {
    deployLog.warn(`Notification failed: ${err.message}`);
  });
}

export async function handleWebhook(req: Request, res: Response) {
  // Verify GitHub signature if secret is configured
  if (!verifySignature(req)) {
    return res.status(403).json({ error: "Invalid signature" });
  }

  // Only deploy on push to main
  const event = req.header("x-github-event");
  const payload = req.body;

  if (event === "ping") {
    return res.json({ message: "pong" });
  }

  if (event !== "push") {
    return res.json({ message: `Ignored event: ${event}` });
  }

  const branch = payload?.ref;
  if (branch !== "refs/heads/main") {
    return res.json({ message: `Ignored branch: ${branch}` });
  }

  // Don't start a new deploy if one is running
  if (deployStatus.status === "deploying") {
    return res.status(409).json({ message: "Deploy already in progress" });
  }

  // Start deploy in background
  runDeploy();

  res.json({
    message: "Deploy started",
    commit: payload?.head_commit?.id?.slice(0, 7) || "unknown",
  });
}

export async function handleDeployStatus(_req: Request, res: Response) {
  res.json(deployStatus);
}
