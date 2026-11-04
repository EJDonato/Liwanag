// Sign-in lockout policy: 5 wrong passwords in a row lock the account for 15 minutes.
// Kept as small pure functions so the rule is easy to read and test.

export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export function isLocked(lockedUntil: Date | null, now = new Date()) {
  return !!lockedUntil && lockedUntil.getTime() > now.getTime();
}

export function shouldLock(failedLogins: number) {
  return failedLogins >= MAX_FAILED_LOGINS;
}

export function lockUntil(now = new Date()) {
  return new Date(now.getTime() + LOCK_MINUTES * 60_000);
}
