import { SEVERITIES, CATEGORIES } from './constants/findings.js';

export { SEVERITIES, CATEGORIES };

/**
 * Finding shape:
 * {
 *   category:    string  — which agent produced it (must be in CATEGORIES)
 *   severity:    string  — one of SEVERITIES
 *   title:       string  — short one-line summary
 *   description: string  — detailed explanation and remediation
 *   file?:       string  — file path where the issue was found
 *   line?:       number  — line number in that file
 * }
 */

export function validateFinding(obj) {
  const errors = [];

  if (!obj || typeof obj !== 'object') {
    return { valid: false, errors: ['finding must be a non-null object'] };
  }

  if (typeof obj.category !== 'string' || !obj.category) {
    errors.push('category is required and must be a non-empty string');
  } else if (!CATEGORIES.includes(obj.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')} — got "${obj.category}"`);
  }

  if (typeof obj.severity !== 'string' || !obj.severity) {
    errors.push('severity is required and must be a non-empty string');
  } else if (!SEVERITIES.includes(obj.severity)) {
    errors.push(`severity must be one of: ${SEVERITIES.join(', ')} — got "${obj.severity}"`);
  }

  if (typeof obj.title !== 'string' || !obj.title) {
    errors.push('title is required and must be a non-empty string');
  }

  if (typeof obj.description !== 'string' || !obj.description) {
    errors.push('description is required and must be a non-empty string');
  }

  if ('file' in obj && obj.file !== undefined && typeof obj.file !== 'string') {
    errors.push('file must be a string when provided');
  }

  if ('line' in obj && obj.line !== undefined && (typeof obj.line !== 'number' || !Number.isInteger(obj.line) || obj.line < 1)) {
    errors.push('line must be a positive integer when provided');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
