/*
  Warnings:

  - You are about to drop the `search_conditions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PunchType" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END');

-- CreateEnum
CREATE TYPE "PunchSource" AS ENUM ('NORMAL', 'CORRECTION');

-- CreateEnum
CREATE TYPE "AttendanceCorrectionStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AttendanceCorrectionEventType" AS ENUM ('REQUESTED', 'REJECTED', 'APPROVED', 'CANCELED');

-- DropTable
DROP TABLE "public"."search_conditions";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."Gender";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_punch_events" (
    "id" TEXT NOT NULL,
    "attendanceRecordId" TEXT NOT NULL,
    "punchType" "PunchType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "PunchSource" NOT NULL,
    "sourceId" TEXT,

    CONSTRAINT "attendance_punch_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AttendanceCorrectionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_correction_events" (
    "id" TEXT NOT NULL,
    "attendanceCorrectionId" TEXT NOT NULL,
    "type" "AttendanceCorrectionEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "reason" TEXT,
    "comment" TEXT,
    "punches" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_correction_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_userId_workDate_key" ON "attendance_records"("userId", "workDate");

-- CreateIndex
CREATE INDEX "attendance_punch_events_attendanceRecordId_occurredAt_idx" ON "attendance_punch_events"("attendanceRecordId", "occurredAt");

-- CreateIndex
CREATE INDEX "attendance_punch_events_attendanceRecordId_createdAt_idx" ON "attendance_punch_events"("attendanceRecordId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_punch_events_source_sourceId_key" ON "attendance_punch_events"("source", "sourceId");

-- CreateIndex
CREATE INDEX "attendance_corrections_userId_workDate_idx" ON "attendance_corrections"("userId", "workDate");

-- CreateIndex
CREATE INDEX "attendance_corrections_status_idx" ON "attendance_corrections"("status");

-- CreateIndex
CREATE INDEX "attendance_correction_events_attendanceCorrectionId_created_idx" ON "attendance_correction_events"("attendanceCorrectionId", "createdAt");

-- CreateIndex
CREATE INDEX "attendance_correction_events_attendanceCorrectionId_type_idx" ON "attendance_correction_events"("attendanceCorrectionId", "type");

-- AddForeignKey
ALTER TABLE "attendance_punch_events" ADD CONSTRAINT "attendance_punch_events_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_correction_events" ADD CONSTRAINT "attendance_correction_events_attendanceCorrectionId_fkey" FOREIGN KEY ("attendanceCorrectionId") REFERENCES "attendance_corrections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
