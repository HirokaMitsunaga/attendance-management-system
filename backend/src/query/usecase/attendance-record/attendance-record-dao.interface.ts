import { PunchEvent } from 'src/query/type/attendace-record/punch-events';

export type AttendanceRecordParams = {
  userId: string;
  workDate: Date;
};

export interface IAttendanceRecordDao {
  findByUserIdAndWorkDate(
    params: AttendanceRecordParams,
  ): Promise<PunchEvent[]>;
}
