import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FindAttendanceRecordParams,
  IAttendanceRecordRepository,
} from '../domain/attendance-record/attendance-record-repository.interface';
import { AttendanceRecord } from '../domain/attendance-record/attendance-record.entity';
import { PunchEvent } from '../domain/common/punch/punch-event.vo';
import { EntityId } from '../domain/entity-id.vo';

@Injectable()
export class AttendanceRecordRepositoryPrisma
  implements IAttendanceRecordRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndWorkDate(
    params: FindAttendanceRecordParams,
  ): Promise<AttendanceRecord | undefined> {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: {
        userId_workDate: {
          userId: params.userId.getEntityId(),
          workDate: params.workDate,
        },
      },
      include: {
        punchEvents: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    if (!record) return undefined;

    return AttendanceRecord.reconstruct({
      id: EntityId.reconstruct({ entityId: record.id }),
      userId: EntityId.reconstruct({ entityId: record.userId }),
      workDate: record.workDate,
      punchEvents: record.punchEvents.map((e) =>
        PunchEvent.reconstruct({
          punchType: e.punchType,
          occurredAt: e.occurredAt,
          createdAt: e.createdAt,
          source: e.source,
          sourceId: e.sourceId
            ? EntityId.reconstruct({ entityId: e.sourceId })
            : undefined,
        }),
      ),
    });
  }

  /**
   * AttendanceRecord の永続化方針:
   *
   * - 勤怠は「日次集約（AttendanceRecord）＋イベント（PunchEvent）追加」で成立するため、
   *   ここでは集約全体を更新するのではなく「新規に追加された PunchEvent だけ」を保存する。
   * - 親の `attendance_records` は `(userId, workDate)` で一意のため、
   *   `attendancePunchEvent.create` の `connectOrCreate` で「無ければ作成・あれば接続」を行う。
   * - DB復元した PunchEvent には `createdAt` が入る想定のため、
   *   `createdAt === undefined` を「未永続化イベント」として扱う。
   * - Prisma の `createMany` は `connectOrCreate` を使えないため、イベントは 1件ずつ `create` する。
   */
  async save(params: { record: AttendanceRecord }): Promise<void> {
    const { record } = params;

    const newPunchEvents = record
      .getPunchEvents()
      .filter((p) => p.getCreatedAt() === undefined);
    if (newPunchEvents.length === 0) return;

    // createMany だと connectOrCreate が使えないため、1件ずつ作成する
    for (const punch of newPunchEvents) {
      await this.prisma.attendancePunchEvent.create({
        data: {
          attendanceRecord: {
            connectOrCreate: {
              where: {
                userId_workDate: {
                  userId: record.getUserId(),
                  workDate: record.getWorkDate(),
                },
              },
              create: {
                id: record.getId(),
                userId: record.getUserId(),
                workDate: record.getWorkDate(),
              },
            },
          },
          punchType: punch.getPunchType(),
          occurredAt: punch.getOccurredAt(),
          source: punch.getSource(),
          sourceId: punch.getSourceId() ?? null,
        },
      });
    }
  }
}
