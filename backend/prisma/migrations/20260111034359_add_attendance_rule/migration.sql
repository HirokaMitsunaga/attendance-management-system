-- CreateEnum
CREATE TYPE "RuleTargetAction" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('ALLOW_CLOCK_IN_ONLY_BEFORE_TIME', 'ALLOW_CLOCK_OUT_ONLY_AFTER_TIME');

-- CreateTable
CREATE TABLE "attendance_rules" (
    "id" TEXT NOT NULL,
    "targets" "RuleTargetAction"[],
    "type" "RuleType" NOT NULL,
    "setting" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_rules_enabled_type_idx" ON "attendance_rules"("enabled", "type");
