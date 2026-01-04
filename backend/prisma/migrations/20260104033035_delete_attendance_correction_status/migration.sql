/*
  Warnings:

  - You are about to drop the column `status` on the `attendance_corrections` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."attendance_corrections_status_idx";

-- AlterTable
ALTER TABLE "attendance_corrections" DROP COLUMN "status";
