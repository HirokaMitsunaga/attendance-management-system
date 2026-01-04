-- AttendanceCorrectionEventテーブルへ以下のチェック制約の追加
-- REQUESTED/APPROVED: punches 必須
-- REJECTED/CANCELED: punches 禁止（NULLのみ）

ALTER TABLE attendance_correction_events
ADD CONSTRAINT attendance_correction_events_punches_required_by_type
CHECK (
  (
    type IN ('REQUESTED', 'APPROVED')
    AND punches IS NOT NULL
  )
  OR
  (
    type IN ('REJECTED', 'CANCELED')
    AND punches IS NULL
  )
);
