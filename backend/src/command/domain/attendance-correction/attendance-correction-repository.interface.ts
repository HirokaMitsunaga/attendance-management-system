import { AttendanceCorrection } from './attendance-correction.entity';

export type FindAttendanceCorrectionParams = {
  userId: string;
  workDate: Date; // 日付の扱いは DateUtil で正規化したものを渡す
};

export interface IAttendanceCorrectionRepository {
  findByUserIdAndWorkDate(
    params: FindAttendanceCorrectionParams,
  ): Promise<AttendanceCorrection | undefined>;

  save(params: { correction: AttendanceCorrection }): Promise<void>;
}
