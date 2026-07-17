// Rate limits for spam and brute-force protection. Tune the numbers here only.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Login: 10/min — blocks password brute-force. */
export const THROTTLE_LOGIN = { default: { ttl: MINUTE, limit: 10 } };

/** Register: 10/hour — blocks junk accounts. */
export const THROTTLE_REGISTER = { default: { ttl: HOUR, limit: 10 } };

/** Password reset: 10/hour — blocks email flooding and token guessing. */
export const THROTTLE_FORGOT_PASSWORD = { default: { ttl: HOUR, limit: 10 } };

/** Contact form: 10/hour — blocks form spam. */
export const THROTTLE_CONTACT = { default: { ttl: HOUR, limit: 10 } };

/** Job application: 100/hour. */
export const THROTTLE_CAREER_APPLY = { default: { ttl: HOUR, limit: 100 } };
