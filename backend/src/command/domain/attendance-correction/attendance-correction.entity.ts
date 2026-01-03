import { EntityId } from '../entity-id.vo';
import { DomainError } from '../../../common/errors/domain.error';
import {
  ATTENDANCE_CORRECTION_STATUS,
  AttendanceCorrectionStatus,
} from './attendance-correction-status';
import {
  AttendanceCorrectionEvent,
  CorrectionPunch,
  ATTENDANCE_CORRECTION_EVENT_TYPE,
  EventType,
} from './attendance-correction-event';

type AttendanceCorrectionParams = {
  id: EntityId;
  userId: EntityId;
  workDate: Date;
  reason: string;
  events: AttendanceCorrectionEvent[];
};

export class AttendanceCorrection {
  private readonly id: EntityId;
  private readonly userId: EntityId;
  private readonly reason: string;
  private readonly workDate: Date;

  // 「申請中/差し戻し/承認」は、このイベント列から導出する
  private events: AttendanceCorrectionEvent[];

  private constructor(params: AttendanceCorrectionParams) {
    if (params.events.length === 0) {
      throw new DomainError('勤怠修正のイベントが存在しません');
    }
    this.id = params.id;
    this.userId = params.userId;
    this.workDate = params.workDate;
    this.reason = params.reason;
    this.events = params.events;
  }

  // 新規申請（作成）
  public static create(params: {
    userId: EntityId;
    workDate: Date;
    requestedBy: string;
    requestedAt: Date;
    reason: string;
    punches: CorrectionPunch[];
  }): AttendanceCorrection {
    AttendanceCorrection.validatePunches(params.punches);
    //修正のエンティティ生成時に申請中のイベントを積む
    return new AttendanceCorrection({
      id: EntityId.generate(),
      userId: params.userId,
      workDate: params.workDate,
      reason: params.reason,
      events: [
        {
          type: ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED,
          requestedAt: params.requestedAt,
          requestedBy: params.requestedBy,
          reason: params.reason,
          punches: params.punches,
        },
      ],
    });
  }

  // 永続化からの復元
  public static reconstruct(
    params: AttendanceCorrectionParams,
  ): AttendanceCorrection {
    return new AttendanceCorrection(params);
  }

  //TODO:承認者はユーザーの上長でないと行けないor承認するロールを持っていないといけないロジックも追加する
  public approve(params: { approvedBy: string; approvedAt: Date }): void {
    const status = this.getStatus();
    if (status !== ATTENDANCE_CORRECTION_STATUS.PENDING) {
      throw new DomainError('申請中以外の勤怠修正は承認できません');
    }

    //申請中となるのは、新規申請の場合と差し戻し→再申請の場合
    //複数の再申請があった場合に一番最新のものを取得する
    const requested = this.getLatestEventByType(
      ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED,
    );
    if (
      !requested ||
      requested.type !== ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED
    ) {
      throw new DomainError('申請内容が存在しないため承認できません');
    }

    this.events.push({
      type: ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED,
      approvedAt: params.approvedAt,
      approvedBy: params.approvedBy,
      punches: requested.punches,
    });
  }

  public reject(params: {
    rejectedBy: string;
    rejectedAt: Date;
    comment: string | null;
  }): void {
    const status = this.getStatus();
    if (status !== ATTENDANCE_CORRECTION_STATUS.PENDING) {
      throw new DomainError('申請中以外の勤怠修正は差し戻しできません');
    }

    this.events.push({
      type: ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED,
      rejectedAt: params.rejectedAt,
      rejectedBy: params.rejectedBy,
      comment: params.comment,
    });
  }

  public cancel(params: { canceledBy: string; canceledAt: Date }): void {
    const status = this.getStatus();
    if (status !== ATTENDANCE_CORRECTION_STATUS.PENDING) {
      throw new DomainError('申請中以外の勤怠修正は取り下げできません');
    }

    this.events.push({
      type: ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED,
      canceledAt: params.canceledAt,
      canceledBy: params.canceledBy,
    });
  }

  // 申請内容を再提出したい場合に使う（差し戻し→再申請）
  public resubmit(params: {
    requestedBy: string;
    requestedAt: Date;
    reason: string | null;
    punches: CorrectionPunch[];
  }): void {
    const status = this.getStatus();
    if (status !== ATTENDANCE_CORRECTION_STATUS.REJECTED) {
      throw new DomainError('差し戻し以外の勤怠修正は再申請できません');
    }

    AttendanceCorrection.validatePunches(params.punches);

    this.events.push({
      type: ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED,
      requestedAt: params.requestedAt,
      requestedBy: params.requestedBy,
      reason: params.reason,
      punches: params.punches,
    });
  }

  // 承認済みなら「勤怠記録へ反映するPunch」を返す
  public getApprovedPunches(): CorrectionPunch[] {
    const latestApproved = this.getLatestEventByType(
      ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED,
    );
    if (
      !latestApproved ||
      latestApproved.type !== ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED
    )
      return [];
    return latestApproved.punches;
  }

  public getStatus(): AttendanceCorrectionStatus {
    const latest = this.getLatestEvent();
    const map: Record<EventType, AttendanceCorrectionStatus> = {
      [ATTENDANCE_CORRECTION_EVENT_TYPE.REQUESTED]:
        ATTENDANCE_CORRECTION_STATUS.PENDING,
      [ATTENDANCE_CORRECTION_EVENT_TYPE.REJECTED]:
        ATTENDANCE_CORRECTION_STATUS.REJECTED,
      [ATTENDANCE_CORRECTION_EVENT_TYPE.APPROVED]:
        ATTENDANCE_CORRECTION_STATUS.APPROVED,
      [ATTENDANCE_CORRECTION_EVENT_TYPE.CANCELED]:
        ATTENDANCE_CORRECTION_STATUS.CANCELED,
    };
    return map[latest.type];
  }

  public getId(): string {
    return this.id.getEntityId();
  }

  public getUserId(): string {
    return this.userId.getEntityId();
  }

  public getWorkDate(): Date {
    return this.workDate;
  }

  public getReason(): string {
    return this.reason;
  }

  public getEvents(): AttendanceCorrectionEvent[] {
    return this.events;
  }

  private getLatestEvent(): AttendanceCorrectionEvent {
    return this.events[this.events.length - 1];
  }

  private getLatestEventByType(
    type: AttendanceCorrectionEvent['type'],
  ): AttendanceCorrectionEvent | null {
    for (let i = this.events.length - 1; i >= 0; i -= 1) {
      const e = this.events[i];
      if (e.type === type) return e;
    }
    return null;
  }

  private static validatePunches(punches: CorrectionPunch[]): void {
    //将来的に複数修正を許可する可能性があるため配列で保持している。ただし現状は validatePunchesで1件に制限している。
    if (punches.length !== 1) {
      throw new DomainError('修正内容は1件のみ指定できます');
    }
  }
}
