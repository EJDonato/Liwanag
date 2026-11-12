-- Sign-in lockout for the admin area. Existing rows start with no failures and no lock.
-- The "Admin" table already has row level security enabled with no policies.
ALTER TABLE "Admin"
  ADD COLUMN "failedLogins" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);
