import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';

/** Names map to env vars FEATURE_<NAME> (e.g. FEATURE_MOCK_TEST=true).
 *  PHASE3 = the management suite (students, classes, attendance, tuition). */
export type FeatureName = 'MOCK_TEST' | 'PHASE3';

/** Gate a controller/route behind a feature flag. */
export const RequireFeature = (name: FeatureName) =>
  SetMetadata(FEATURE_KEY, name);

/**
 * MOCK_TEST: on only when FEATURE_MOCK_TEST=true.
 * PHASE3: hardcoded off until GĐ3 — ignore env so client prod cannot turn it on by mistake.
 */
export function isFeatureEnabled(name: FeatureName): boolean {
  if (name === 'PHASE3') return false;
  return process.env[`FEATURE_${name}`] === 'true';
}
