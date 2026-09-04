/**
 * Numbers the UI says out loud that the server also enforces.
 *
 * These must match the backend or the app lies to players about a penalty:
 *  - LOCKOUT_MINUTES  → routes/teamRoutes.js  (wrong station code)
 *  - VERIFY_ATTEMPTS / VERIFY_WINDOW_MINUTES → middleware/rateLimit.js
 *
 * The lockout and the rate-limit window are separate controls that were both
 * 15 minutes for a while; keeping them as distinct named values here is what
 * stops one edit from silently changing the other's copy.
 */
export const LOCKOUT_MINUTES = 7

export const VERIFY_ATTEMPTS = 10
export const VERIFY_WINDOW_MINUTES = 15
