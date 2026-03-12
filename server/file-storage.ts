import { promises as fs } from "node:fs";
import path from "node:path";
import { log } from "./logger";
import { config } from "./config";

/**
 * File storage abstraction layer.
 *
 * In development, files are saved to `public/uploads/` and served as static
 * assets.  In production, files are uploaded to Cloudflare R2 (S3-compatible)
 * and served via a public CDN URL.
 *
 * The active implementation is selected at startup by checking the
 * `R2_BUCKET_NAME` environment variable.
 */

// ── Interface ────────────────────────────────────────────────

export interface FileStorage {
  /** Upload a file and return its public URL. */
  upload(key: string, data: Buffer, contentType: string): Promise<string>;
  /** Delete a previously-uploaded file. */
  delete(key: string): Promise<void>;
  /** Return the public URL for a given key (without uploading). */
  getUrl(key: string): string;
}

// ── Local file storage (development) ─────────────────────────

const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

class LocalFileStorage implements FileStorage {
  private ready: Promise<void>;

  constructor() {
    this.ready = fs.mkdir(UPLOADS_DIR, { recursive: true }).then(() => {
      log.info(`[FileStorage] Local storage ready at ${UPLOADS_DIR}`);
    });
  }

  async upload(key: string, data: Buffer, _contentType: string): Promise<string> {
    await this.ready;
    const filePath = path.join(UPLOADS_DIR, key);
    // Ensure nested subdirectories exist (e.g. "avatars/abc.jpg")
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    await this.ready;
    const filePath = path.join(UPLOADS_DIR, key);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
      // File already gone — idempotent delete
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

// ── R2 / S3-compatible storage (production) ──────────────────

class R2FileStorage implements FileStorage {
  private client: any; // S3Client — lazily typed to avoid hard dep at import time
  private bucket: string;
  private publicUrl: string;

  constructor() {
    // Sprint 808: Centralized to config.ts
    const R2_ACCOUNT_ID = config.r2AccountId;
    const R2_ACCESS_KEY_ID = config.r2AccessKeyId;
    const R2_SECRET_ACCESS_KEY = config.r2SecretAccessKey;
    const R2_BUCKET_NAME = config.r2BucketName;
    const R2_PUBLIC_URL = config.r2PublicUrl;

    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID) {
      throw new Error(
        "[FileStorage] R2 storage requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME env vars",
      );
    }

    this.bucket = R2_BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.r2.dev`;

    // Dynamic import so @aws-sdk/client-s3 is only required in production
    const { S3Client } = require("@aws-sdk/client-s3");
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    log.info(`[FileStorage] R2 storage ready — bucket: ${this.bucket}`);
  }

  async upload(key: string, data: Buffer, contentType: string): Promise<string> {
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

// ── Factory ──────────────────────────────────────────────────

export function createFileStorage(): FileStorage {
  // Sprint 808: Centralized to config.ts
  if (config.r2BucketName) {
    return new R2FileStorage();
  }
  return new LocalFileStorage();
}

/** Singleton instance — import this in route handlers. */
export const fileStorage = createFileStorage();
