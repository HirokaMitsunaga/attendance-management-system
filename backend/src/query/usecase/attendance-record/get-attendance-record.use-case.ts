import { Inject, Injectable } from '@nestjs/common';
import type { IAttendanceRecordDao } from './attendance-record-dao.interface';
import { ATTENDANCE_RECORD_DAO } from './attendance-record-dao.tokens';
import type { GetEventResponseDto } from '../../response/getEventResponse';

export type GetAttendanceRecordParams = {
  userId: string;
  workDate: Date;
};

@Injectable()
export class GetAttendanceRecordUseCase {
  constructor(
    @Inject(ATTENDANCE_RECORD_DAO)
    private readonly attendanceRecordDao: IAttendanceRecordDao,
  ) {}

  async execute(
    params: GetAttendanceRecordParams,
  ): Promise<GetEventResponseDto> {
    // workDateFromJsonSchemaで既にUTCの0時に正規化されているため、そのまま使用
    // DBのworkDateはDATE型なので、UTCの0時として扱われる
    const punchEvents = await this.attendanceRecordDao.findByUserIdAndWorkDate({
      userId: params.userId,
      workDate: params.workDate,
    });

    // Date型をISO文字列に変換
    return punchEvents.map((event) => ({
      punchType: event.punchType,
      occurredAt: event.occurredAt.toISOString(),
      createdAt: event.createdAt?.toISOString(),
      source: event.source,
      sourceId: event.sourceId ?? null,
    }));
  }
}
