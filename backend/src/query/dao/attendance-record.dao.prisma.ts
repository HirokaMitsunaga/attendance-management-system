import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AttendanceRecordParams,
  IAttendanceRecordDao,
} from '../usecase/attendance-record/attendance-record-dao.interface';
import { PunchEvent } from '../type/attendace-record/punch-events';

@Injectable()
export class AttendanceRecordDaoPrisma implements IAttendanceRecordDao {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndWorkDate(
    params: AttendanceRecordParams,
  ): Promise<PunchEvent[]> {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId: params.userId,
          workDate: params.workDate,
        },
      },
      include: {
        punchEvents: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    if (!record) {
      return [];
    }

    return record.punchEvents.map((e) => ({
      punchType: e.punchType,
      occurredAt: e.occurredAt,
      createdAt: e.createdAt,
      source: e.source,
      sourceId: e.sourceId ?? undefined,
    }));
  }
}
