import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseISOString } from '../../common/utils/date.utils';
import { EntityId } from '../domain/entity-id.vo';
import { AttendanceCorrection } from '../domain/attendance-correction/attendance-correction.entity';
import {
  ATTENDANCE_CORRECTION_EVENT_TYPE,
  type AttendanceCorrectionEvent,
  type CorrectionPunchEvent,
} from '../domain/attendance-correction/attendance-correction-event';
import {
  type FindAttendanceCorrectionParams,
  type IAttendanceCorrectionRepository,
} from '../domain/attendance-correction/attendance-correction-repository.interface';

type PersistedPunch = { punchType: string; occurredAt: string };

@Injectable()
export class AttendanceCorrectionRepositoryPrisma implements IAttendanceCorrectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIdAndWorkDate(
    params: FindAttendanceCorrectionParams,
  ): Promise<AttendanceCorrection | undefined> {
    const correction = await this.prisma.attendanceCorrection.findFirst({
      where: { userId: params.userId, workDate: params.workDate },
      include: { events: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    if (!correction) return undefined;

    return AttendanceCorrection.reconstruct({
      id: EntityId.reconstruct({ entityId: correction.id }),
      userId: EntityId.reconstruct({ entityId: correction.userId }),
      workDate: correction.workDate,
      reason: correction.reason,
      events: correction.events.map((e) =>
        this.toDomainEvent({
          type: e.type as AttendanceCorrectionEvent['type'],
          occurredAt: e.occurredAt,
          actorUserId: e.actorUserId,
          reason: e.reason,
          comment: e.comment,
          punches: e.punches,
          createdAt: e.createdAt,
        }),
      ),
    });
  }

  async save(params: { correction: AttendanceCorrection }): Promise<void> {
    const { correction } = params;

    const newEvents = correction
      .getEvents()
      .filter((e) => e.createdAt === undefined);

    if (newEvents.length === 0) return;

    for (const event of newEvents) {
      await this.prisma.attendanceCorrectionEvent.create({
        data: {
          attendanceCorrection: {
            connectOrCreate: {
              where: { id: correction.getId() },
              create: {
                id: correction.getId(),
                userId: correction.getUserId(),
                workDate: correction.getWorkDate(),
                reason: correction.getReason(),
              },
            },
          },
          ...this.toPrismaEventData(event),
        },
      });
    }
  }
  private toJsonPunches(punchEvents: CorrectionPunchEvent[]) {
    return punchEvents.map((p) => ({
      punchType: p.punchType,
      occurredAt: p.occurredAt.toISOString(),
    }));
  }

  private fromJsonPunches(punches: unknown): CorrectionPunchEvent[] {
    if (!Array.isArray(punches)) return [];
    return (punches as PersistedPunch[])
      .filter(
        (p) =>
          typeof p === 'object' &&
          p !== null &&
          typeof p.punchType === 'string' &&
          typeof p.occurredAt === 'string',
      )
      .map((p) => ({
        punchType: p.punchType as CorrectionPunchEvent['punchType'],
        occurredAt: parseISOString(p.occurredAt),
      }));
  }

  private toDomainEvent(row: {
    type: AttendanceCorrectionEvent['type'];
    occurredAt: Date;
    actorUserId: string;
    reason: string | null;
    comment: string | null;
    punches: unknown;
    createdAt: Date;
  }): AttendanceCorrectionEvent {
    switch (row.type) {
      case ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED,
          requestedAt: row.occurredAt,
          requestedBy: row.actorUserId,
          reason: row.reason ?? null,
          punchEvents: this.fromJsonPunches(row.punches),
          createdAt: row.createdAt,
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED,
          rejectedAt: row.occurredAt,
          rejectedBy: row.actorUserId,
          comment: row.comment ?? null,
          createdAt: row.createdAt,
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED,
          approvedAt: row.occurredAt,
          approvedBy: row.actorUserId,
          punchEvents: this.fromJsonPunches(row.punches),
          createdAt: row.createdAt,
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED,
          canceledAt: row.occurredAt,
          canceledBy: row.actorUserId,
          createdAt: row.createdAt,
        };
    }
  }

  private toPrismaEventData(event: AttendanceCorrectionEvent) {
    switch (event.type) {
      case ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED,
          occurredAt: event.requestedAt,
          actorUserId: event.requestedBy,
          reason: event.reason ?? null,
          comment: null,
          punches: this.toJsonPunches(event.punchEvents),
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED,
          occurredAt: event.rejectedAt,
          actorUserId: event.rejectedBy,
          reason: null,
          comment: event.comment ?? null,
          punches: Prisma.DbNull,
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED,
          occurredAt: event.approvedAt,
          actorUserId: event.approvedBy,
          reason: null,
          comment: null,
          punches: this.toJsonPunches(event.punchEvents),
        };
      case ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED:
        return {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED,
          occurredAt: event.canceledAt,
          actorUserId: event.canceledBy,
          reason: null,
          comment: null,
          punches: Prisma.DbNull,
        };
    }
  }
}
