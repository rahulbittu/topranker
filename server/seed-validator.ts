/**
 * Sprint 237: Seed Data Validation Module
 * Validates seed data integrity before inserting into DB.
 * Owner: Cole Anderson (Backend Lead)
 */

import { log } from "./logger";

const validLog = log.tag("SeedValidator");

interface SeedBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  category: string;
  neighborhood: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  businessCount: number;
}

const VALID_CATEGORIES = [
  "restaurant", "cafe", "bar", "bakery", "street_food", "fast_food",
  "fine_dining", "food_truck", "deli", "bbq", "seafood", "pizza",
];

const VALID_STATE_CODES = ["TX", "OK", "LA", "TN"];

export function validateSeedBusiness(biz: SeedBusiness): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!biz.name || biz.name.length < 2) errors.push("Name too short");
  if (!biz.address) errors.push("Missing address");
  if (!biz.city) errors.push("Missing city");
  if (!biz.state || !VALID_STATE_CODES.includes(biz.state)) errors.push(`Invalid state: ${biz.state}`);
  if (!biz.zip || !/^\d{5}$/.test(biz.zip)) errors.push(`Invalid zip: ${biz.zip}`);
  if (!biz.phone || !/^\(\d{3}\)/.test(biz.phone)) errors.push(`Invalid phone format: ${biz.phone}`);
  if (!VALID_CATEGORIES.includes(biz.category)) errors.push(`Invalid category: ${biz.category}`);
  if (!biz.neighborhood) errors.push("Missing neighborhood");
  return { valid: errors.length === 0, errors };
}

export function validateSeedDataset(businesses: SeedBusiness[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (businesses.length === 0) {
    errors.push("Empty dataset");
    return { valid: false, errors, warnings, businessCount: 0 };
  }

  // Check for duplicates by name
  const names = new Set<string>();
  for (const biz of businesses) {
    if (names.has(biz.name)) {
      errors.push(`Duplicate business: ${biz.name}`);
    }
    names.add(biz.name);

    const result = validateSeedBusiness(biz);
    errors.push(...result.errors);
  }

  // Warnings
  if (businesses.length < 5) warnings.push("Dataset has fewer than 5 businesses");
  const categories = new Set(businesses.map(b => b.category));
  if (categories.size < 3) warnings.push("Low category diversity (< 3 categories)");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    businessCount: businesses.length,
  };
}

export function getValidCategories(): string[] {
  return [...VALID_CATEGORIES];
}

export function getValidStateCodes(): string[] {
  return [...VALID_STATE_CODES];
}
