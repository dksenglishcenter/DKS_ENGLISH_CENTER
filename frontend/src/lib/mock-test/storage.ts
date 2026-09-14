/** localStorage key that remembers the in-progress attempt for a test, so a
 *  refresh resumes it (attempts are anonymous — the id is the only handle). */
export function attemptStorageKey(testId: string): string {
  return `exam:attempt:${testId}`;
}
