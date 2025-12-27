// useAttendanceActions.ts
import { AttendanceCorrectionFormData } from '../schema/attendance-correction-schema';
import { UseFormSetError } from 'react-hook-form';
import toast from 'react-hot-toast';

export const useAttendanceCorrectionActions = () => {
  const handleFormSubmit = async (
    data: AttendanceCorrectionFormData,
    setError: UseFormSetError<AttendanceCorrectionFormData>,
  ): Promise<boolean> => {
    try {
      console.log('打刻修正ボタンを押しました', data);
      toast.success('打刻修正が完了しました。');
      return true;
    } catch (err) {
      console.error('申請エラー:', err);
      toast.error('申請に失敗しました');
      return false;
    }
  };
  return {
    handleFormSubmit,
  };
};
