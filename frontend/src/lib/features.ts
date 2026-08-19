/**
 * Feature flags — the appsettings-style on/off switches.
 *
 * Each flag defaults to OFF and is turned on by its env var, e.g.
 * NEXT_PUBLIC_FEATURE_MOCK_TEST=true. Keep the same flag on the backend
 * (FEATURE_MOCK_TEST) so a disabled feature is blocked at the API too.
 */
function flag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export const features = {
  attendance: flag(process.env.NEXT_PUBLIC_FEATURE_ATTENDANCE),
  mockTest: flag(process.env.NEXT_PUBLIC_FEATURE_MOCK_TEST),
} as const;

export type FeatureKey = keyof typeof features;

export function isFeatureOn(key: FeatureKey): boolean {
  return features[key];
}
