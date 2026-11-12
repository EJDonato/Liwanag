-- Counters for rate limiting the public forms. "key" is "<bucket>:<hashed visitor address>";
-- the address itself is never stored. Row level security stays on with no policies, like every table.
CREATE TABLE "RateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
