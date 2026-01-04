/*
  Warnings:

  - A unique constraint covering the columns `[userId,workDate]` on the table `attendance_corrections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."attendance_corrections_userId_workDate_idx";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_corrections_userId_workDate_key" ON "attendance_corrections"("userId", "workDate");
