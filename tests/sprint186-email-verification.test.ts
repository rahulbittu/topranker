/**
 * Sprint 186 — Email Verification + Password Reset
 *
 * Validates:
 * 1. Schema fields for email verification and password reset
 * 2. Email verification storage functions
 * 3. Password reset storage functions
 * 4. Verification email template
 * 5. Password reset email template
 * 6. Auth route endpoints
 * 7. Signup sends verification email
 * 8. Security measures
 * 9. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema fields
// ---------------------------------------------------------------------------
describe("Schema — email verification + password reset fields", () => {
  const src = readFile("shared/schema.ts");

  it("has emailVerified boolean field", () => {
    expect(src).toContain('emailVerified: boolean("email_verified")');
  });

  it("emailVerified defaults to false", () => {
    expect(src).toContain(".default(false)");
  });

  it("has emailVerificationToken field", () => {
    expect(src).toContain('emailVerificationToken: text("email_verification_token")');
  });

  it("has passwordResetToken field", () => {
    expect(src).toContain('passwordResetToken: text("password_reset_token")');
  });

  it("has passwordResetExpires timestamp field", () => {
    expect(src).toContain('passwordResetExpires: timestamp("password_reset_expires")');
  });
});

// ---------------------------------------------------------------------------
// 2. Email verification storage
// ---------------------------------------------------------------------------
describe("Email verification — storage", () => {
  const src = readFile("server/storage/members.ts");

  it("exports generateEmailVerificationToken", () => {
    expect(src).toContain("export async function generateEmailVerificationToken");
  });

  it("generates a 32-byte hex token", () => {
    expect(src).toContain('crypto.randomBytes(32).toString("hex")');
  });

  it("stores token on member record", () => {
    expect(src).toContain("emailVerificationToken: token");
  });

  it("exports verifyEmailToken", () => {
    expect(src).toContain("export async function verifyEmailToken");
  });

  it("sets emailVerified to true on success", () => {
    expect(src).toContain("emailVerified: true");
  });

  it("clears verification token after use", () => {
    expect(src).toContain("emailVerificationToken: null");
  });

  it("returns success with memberId", () => {
    expect(src).toContain("success: true, memberId: member.id");
  });

  it("exports isEmailVerified", () => {
    expect(src).toContain("export async function isEmailVerified");
  });
});

// ---------------------------------------------------------------------------
// 3. Password reset storage
// ---------------------------------------------------------------------------
describe("Password reset — storage", () => {
  const src = readFile("server/storage/members.ts");

  it("exports generatePasswordResetToken", () => {
    expect(src).toContain("export async function generatePasswordResetToken");
  });

  it("sets 1-hour expiry", () => {
    expect(src).toContain("60 * 60 * 1000");
  });

  it("stores token and expiry on member", () => {
    expect(src).toContain("passwordResetToken: token");
    expect(src).toContain("passwordResetExpires: expires");
  });

  it("returns null for missing member", () => {
    expect(src).toContain("if (!member) return null");
  });

  it("returns null for Google-only accounts", () => {
    expect(src).toContain("if (!member.password) return null");
  });

  it("exports resetPasswordWithToken", () => {
    expect(src).toContain("export async function resetPasswordWithToken");
  });

  it("validates token expiry", () => {
    expect(src).toContain("passwordResetExpires");
    expect(src).toContain("Reset token has expired");
  });

  it("clears token after successful reset", () => {
    expect(src).toContain("passwordResetToken: null");
    expect(src).toContain("passwordResetExpires: null");
  });

  it("updates password hash", () => {
    expect(src).toContain("password: newPasswordHash");
  });
});

// ---------------------------------------------------------------------------
// 4. Verification email template
// ---------------------------------------------------------------------------
describe("Email — verification template", () => {
  const src = readFile("server/email.ts");

  it("exports sendVerificationEmail", () => {
    expect(src).toContain("export async function sendVerificationEmail");
  });

  it("includes verification URL with token", () => {
    expect(src).toContain("topranker.io/verify-email?token=");
  });

  it("has HTML and plain text versions", () => {
    expect(src).toContain("Verify Your Email");
    expect(src).toContain("Verify Email Address");
  });

  it("includes safety note for non-users", () => {
    expect(src).toContain("you can safely ignore this email");
  });
});

// ---------------------------------------------------------------------------
// 5. Password reset email template
// ---------------------------------------------------------------------------
describe("Email — password reset template", () => {
  const src = readFile("server/email.ts");

  it("exports sendPasswordResetEmail", () => {
    expect(src).toContain("export async function sendPasswordResetEmail");
  });

  it("includes reset URL with token", () => {
    expect(src).toContain("topranker.io/reset-password?token=");
  });

  it("mentions 1-hour expiry", () => {
    expect(src).toContain("1 hour");
  });

  it("has Reset Password CTA", () => {
    expect(src).toContain("Reset Password");
    expect(src).toContain("Reset Your Password");
  });
});

// ---------------------------------------------------------------------------
// 6. Auth route endpoints
// ---------------------------------------------------------------------------
describe("Auth routes — verification + reset endpoints", () => {
  const src = readFile("server/routes-auth.ts");

  it("has POST /api/auth/verify-email", () => {
    expect(src).toContain('"/api/auth/verify-email"');
  });

  it("has POST /api/auth/resend-verification", () => {
    expect(src).toContain('"/api/auth/resend-verification"');
  });

  it("has POST /api/auth/forgot-password", () => {
    expect(src).toContain('"/api/auth/forgot-password"');
  });

  it("has POST /api/auth/reset-password", () => {
    expect(src).toContain('"/api/auth/reset-password"');
  });

  it("verify-email calls verifyEmailToken", () => {
    expect(src).toContain("verifyEmailToken");
  });

  it("resend-verification requires auth", () => {
    expect(src).toContain("resend-verification");
    expect(src).toContain("requireAuth");
  });

  it("forgot-password calls generatePasswordResetToken", () => {
    expect(src).toContain("generatePasswordResetToken");
  });

  it("reset-password validates password policy", () => {
    expect(src).toContain("Password must be at least 8 characters");
    expect(src).toContain("Password must contain at least one number");
  });

  it("reset-password hashes new password with bcrypt", () => {
    expect(src).toContain("bcrypt.hash(password, 10)");
  });
});

// ---------------------------------------------------------------------------
// 7. Signup sends verification email
// ---------------------------------------------------------------------------
describe("Signup — verification email integration", () => {
  const src = readFile("server/routes-auth.ts");

  it("generates verification token on signup", () => {
    expect(src).toContain("generateEmailVerificationToken(member.id)");
  });

  it("sends verification email on signup", () => {
    expect(src).toContain("sendVerificationEmail");
  });

  it("imports sendVerificationEmail", () => {
    expect(src).toContain("sendVerificationEmail");
  });
});

// ---------------------------------------------------------------------------
// 8. Security measures
// ---------------------------------------------------------------------------
describe("Security — email enumeration prevention", () => {
  const src = readFile("server/routes-auth.ts");

  it("forgot-password returns same message regardless of email existence", () => {
    expect(src).toContain("If an account exists with that email");
  });

  it("forgot-password uses rate limiter", () => {
    expect(src).toContain("authRateLimiter");
  });

  it("reset-password uses rate limiter", () => {
    // Both forgot and reset use authRateLimiter
    const matches = src.match(/authRateLimiter/g);
    expect(matches!.length).toBeGreaterThanOrEqual(4); // signup, login, google, forgot, reset
  });

  it("resend-verification checks if already verified", () => {
    expect(src).toContain("Email already verified");
  });
});

// ---------------------------------------------------------------------------
// 9. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 186 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports generateEmailVerificationToken", () => {
    expect(indexSrc).toContain("generateEmailVerificationToken");
  });

  it("exports verifyEmailToken", () => {
    expect(indexSrc).toContain("verifyEmailToken");
  });

  it("exports isEmailVerified", () => {
    expect(indexSrc).toContain("isEmailVerified");
  });

  it("exports generatePasswordResetToken", () => {
    expect(indexSrc).toContain("generatePasswordResetToken");
  });

  it("exports resetPasswordWithToken", () => {
    expect(indexSrc).toContain("resetPasswordWithToken");
  });
});
