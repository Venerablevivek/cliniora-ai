-- Waitlist referrals + saved language preference.
-- Additive and backward compatible: the previous app version keeps working while this deploys.

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ar');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" "Locale";

-- AlterTable
-- The default is volatile, so Postgres evaluates it per row: existing entries are backfilled
-- with distinct codes before the unique index below is created.
ALTER TABLE "WaitlistEntry" ADD COLUMN     "referralCode" TEXT NOT NULL DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_referralCode_key" ON "WaitlistEntry"("referralCode");

-- CreateIndex
CREATE INDEX "WaitlistEntry_referralCount_createdAt_idx" ON "WaitlistEntry"("referralCount", "createdAt");

-- CreateIndex
CREATE INDEX "WaitlistEntry_referredById_idx" ON "WaitlistEntry"("referredById");

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "WaitlistEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
