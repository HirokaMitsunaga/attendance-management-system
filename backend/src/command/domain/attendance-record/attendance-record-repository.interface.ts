import { EntityId } from '../entity-id.vo';
import { AttendanceRecord } from './attendance-record.entity';

export type FindAttendanceRecordParams = {
  userId: EntityId;
  workDate: Date; // 日付の扱いは DateUtil で正規化したものを渡す
};

export interface IAttendanceRecordRepository {
  findByUserIdAndWorkDate(
    params: FindAttendanceRecordParams,
  ): Promise<AttendanceRecord | undefined>;
  save(params: { record: AttendanceRecord }): Promise<void>;
}
