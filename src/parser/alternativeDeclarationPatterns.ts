/**
 * Normalisation for the `ashStudio.alternativeDeclarationPatterns` setting.
 *
 * Pure logic: no VS Code dependencies. The raw setting value comes from user
 * settings.json and can be anything (null, array, number, objects with
 * non-string values), so it is treated as `unknown` and cleaned up here.
 */

import { NormalizedAlternativeDeclarationPatterns } from "../types/parser";

/**
 * Converts a raw alternative declaration patterns value into a clean map of
 * alternative pattern -> standard declaration patterns.
 *
 * - Non-object values (null, arrays, numbers, strings, ...) yield an empty map.
 * - Entries with an empty key are dropped.
 * - Values may be a string or an array of strings; any other value types and
 *   non-string array elements are ignored, as are empty strings.
 * - Entries that end up without any standard pattern are dropped.
 * - Duplicate standard patterns for the same key are removed.
 *
 * Never throws.
 */
export function normalizeAlternativeDeclarationPatterns(
  raw: unknown
): NormalizedAlternativeDeclarationPatterns {
  const normalized: NormalizedAlternativeDeclarationPatterns = {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return normalized;
  }

  for (const [altPattern, value] of Object.entries(raw)) {
    if (altPattern === "") {
      continue;
    }
    const candidates: unknown[] = Array.isArray(value) ? value : [value];
    const standardPatterns = candidates.filter(
      (candidate): candidate is string =>
        typeof candidate === "string" && candidate !== ""
    );
    if (standardPatterns.length > 0) {
      normalized[altPattern] = Array.from(new Set(standardPatterns));
    }
  }

  return normalized;
}
