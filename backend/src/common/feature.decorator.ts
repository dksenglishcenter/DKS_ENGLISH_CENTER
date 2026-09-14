import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';

/** Names map to env vars FEATURE_<NAME> (e.g. FEATURE_MOCK_TEST=true).
 *  PHASE3 = the management suite (students, classes, attendance, tuition). */
export type FeatureName = 'MOCK_TEST' | 'PHASE3';

/** Gate a controller/route behind a feature flag. */
export const RequireFeature = (name: FeatureName) =>
  SetMetadata(FEATURE_KEY, name);

/** A feature is on only when its env var is exactly "true". Default: off. */
export function isFeatureEnabled(name: FeatureName): boolean {
  return process.env[`FEATURE_${name}`] === 'true';
}
