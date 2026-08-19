import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';

/** Names map to env vars FEATURE_<NAME> (e.g. FEATURE_MOCK_TEST=true). */
export type FeatureName = 'MOCK_TEST' | 'ATTENDANCE';

/** Gate a controller/route behind a feature flag. */
export const RequireFeature = (name: FeatureName) =>
  SetMetadata(FEATURE_KEY, name);

/** A feature is on only when its env var is exactly "true". Default: off. */
export function isFeatureEnabled(name: FeatureName): boolean {
  return process.env[`FEATURE_${name}`] === 'true';
}
