/**
 * Feature flags — on/off switches for unfinished product slices.
 *
 * mockTest: env-driven (NEXT_PUBLIC_FEATURE_MOCK_TEST / FEATURE_MOCK_TEST).
 * phase3: hardcoded OFF until GĐ3 ships — do not re-enable via env for client prod.
 */
function flag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export const features = {
  /** Management suite: students, classes, attendance, tuition (GĐ3). Locked off in code. */
  phase3: false,
  mockTest: flag(process.env.NEXT_PUBLIC_FEATURE_MOCK_TEST),
} as const;

export type FeatureKey = keyof typeof features;

export function isFeatureOn(key: FeatureKey): boolean {
  return features[key];
}
