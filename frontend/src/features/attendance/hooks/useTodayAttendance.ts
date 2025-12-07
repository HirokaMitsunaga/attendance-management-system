// useTodayAttendance.ts
import { ATTENDANCE_STATUS } from '../types/attendance-status';
import { TodayStatus } from '../types/todday-status';

// モックデータ（後でAPI実装に置き換える）
const MOCK_TODAY_ATTENDANCE: TodayStatus = {
  clockIn: '09:02',
  clockOut: '',
  workingHours: '5時間32分',
  status: ATTENDANCE_STATUS.WORKING,
};

export const useTodayAttendance = () => {
  // TODO: APIから取得する処理に置き換える
  // const { data, isLoading, error } = useSWRData<TodayStatus>('/attendance/today');

  return {
    todayAttendance: MOCK_TODAY_ATTENDANCE,
    //isLoading: false,
    //error: null,
  };
};
