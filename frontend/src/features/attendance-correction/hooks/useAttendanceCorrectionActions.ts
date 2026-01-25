import { apiClient } from '@/libs/api-client';
import { ApiClientError } from '@/libs/api-client-error';
import { AttendanceCorrectionFormData } from '../schema/attendance-correction-schema';
import { UseFormSetError } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getYYYYMMDDDateString } from '@/features/attendance/utils/getTodayDateString';
import { ATTENDANCE_CORRECTION_TYPE } from '../types/attendance-correction-type';

const endpointMap: Record<
  (typeof ATTENDANCE_CORRECTION_TYPE)[keyof typeof ATTENDANCE_CORRECTION_TYPE]['value'],
  string
> = {
  [ATTENDANCE_CORRECTION_TYPE.CLOCK_IN.value]:
    '/attendance-correction/request/clock-in',
  [ATTENDANCE_CORRECTION_TYPE.CLOCK_OUT.value]:
    '/attendance-correction/request/clock-out',
};

export const useAttendanceCorrectionActions = () => {
  const handleFormSubmit = async (
    data: AttendanceCorrectionFormData,
    setError: UseFormSetError<AttendanceCorrectionFormData>,
  ): Promise<boolean> => {
    try {
      // workDate: DateオブジェクトからYYYY-MM-DD形式の文字列に変換
      const workDate = getYYYYMMDDDateString(data.workDate);

      // occurredAt: 日付と時刻を組み合わせてISO 8601形式の文字列に変換
      const dateStr = getYYYYMMDDDateString(data.workDate);
      const occurredAt = `${dateStr}T${data.occurredAt}:00.000Z`;

      const reason = data.reason;
      const endpoint = endpointMap[data.correctionType];

      await apiClient<void>(endpoint, {
        method: 'POST',
        body: { workDate, occurredAt, reason },
      });
      toast.success('打刻修正が完了しました。');
      return true;
    } catch (err) {
      if (err instanceof ApiClientError && err.details) {
        // サーバーサイドのバリデーションエラー（フィールド固有）
        err.details.forEach((detail) => {
          const fieldName = detail
            .path[0] as keyof AttendanceCorrectionFormData;
          setError(fieldName, {
            type: 'server',
            message: detail.message,
          });
        });
      } else if (err instanceof ApiClientError) {
        // 一般的なAPIエラー
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('申請に失敗しました');
      }
      return false;
    }
  };
  return {
    handleFormSubmit,
  };
};
