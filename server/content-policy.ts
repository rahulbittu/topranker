/**
 * Sprint 242: Content Policy Engine
 * Evaluates review content against moderation policies.
 * Returns violations with severity and recommended action.
 * Owner: Jordan Blake (Compliance)
 */

import { log } from "./logger";

const policyLog = log.tag("ContentPolicy");

type PolicyViolation = "profanity" | "spam" | "personal_info" | "competitor_mention" | "incentivized" | "off_topic";
type PolicyAction = "approve" | "flag" | "reject";

interface PolicyRule {
  name: PolicyViolation;
  description: string;
  severity: "low" | "medium" | "high";
  action: PolicyAction;
  patterns: RegExp[];
}

export const CONTENT_POLICIES: PolicyRule[] = [
  {
    name: "profanity",
    description: "Profane or abusive language",
    severity: "high",
    action: "reject",
    patterns: [/\b(fuck|shit|damn|ass|bitch)\b/i],
  },
  {
    name: "spam",
    description: "Repetitive or promotional content",
    severity: "medium",
    action: "flag",
    patterns: [/\b(buy now|click here|free money|limited offer)\b/i, /(.)\1{4,}/],
  },
  {
    name: "personal_info",
    description: "Phone numbers, emails, or addresses in reviews",
    severity: "high",
    action: "reject",
    patterns: [/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, /\b[\w.]+@[\w.]+\.\w+\b/],
  },
  {
    name: "competitor_mention",
    description: "References to competitor platforms",
    severity: "low",
    action: "flag",
    patterns: [/\b(yelp|google reviews|tripadvisor|doordash)\b/i],
  },
  {
    name: "incentivized",
    description: "Signs of incentivized review",
    severity: "high",
    action: "reject",
    patterns: [/\b(paid to review|free meal for review|discount for rating)\b/i],
  },
  {
    name: "off_topic",
    description: "Content unrelated to business review",
    severity: "low",
    action: "flag",
    patterns: [/\b(politics|religion|race)\b/i],
  },
];

interface PolicyCheckResult {
  approved: boolean;
  violations: { rule: PolicyViolation; severity: string; action: PolicyAction; match: string }[];
  action: PolicyAction;
}

export function checkContent(text: string): PolicyCheckResult {
  const violations: PolicyCheckResult["violations"] = [];
  for (const rule of CONTENT_POLICIES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        violations.push({ rule: rule.name, severity: rule.severity, action: rule.action, match: match[0] });
        policyLog.info(`Violation detected: ${rule.name} (${rule.severity})`, match[0]);
        break; // One match per rule is enough
      }
    }
  }
  // Overall action: reject > flag > approve
  let action: PolicyAction = "approve";
  if (violations.some(v => v.action === "reject")) action = "reject";
  else if (violations.some(v => v.action === "flag")) action = "flag";

  return { approved: action === "approve", violations, action };
}

export function getPolicyRules(): PolicyRule[] {
  return CONTENT_POLICIES.map(r => ({ ...r, patterns: r.patterns }));
}
