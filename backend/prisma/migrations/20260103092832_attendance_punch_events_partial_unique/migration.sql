-- DropIndex
DROP INDEX "public"."attendance_punch_events_source_sourceId_key";

-- CreateIndex
CREATE INDEX "attendance_punch_events_source_sourceId_idx" ON "attendance_punch_events"("source", "sourceId");

-- CreateIndex (Partial Unique)
-- CORRECTION のみ冪等性を強く担保する（sourceIdがNULLの場合は対象外）
CREATE UNIQUE INDEX "attendance_punch_events_correction_unique"
ON "attendance_punch_events"("source", "sourceId", "punchType")
WHERE "source" = 'CORRECTION' AND "sourceId" IS NOT NULL;
